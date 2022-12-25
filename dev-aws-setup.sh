#!/usr/bin/env bash

pushd terraform || exit

if [ ! -f private_key.pem ]; then
  echo "Generating CloudFront signing private key"
  openssl genrsa -out private_key.pem 2048
fi
if [ ! -f public_key.pem ]; then
  echo "Generating CloudFront signing public key"
  openssl rsa -pubout -in private_key.pem -out public_key.pem
fi
CF_SIGNER_PRIVATE_KEY_ENCODED=$(base64 -i private_key.pem)

echo "Applying Terraform"
export AWS_PROFILE=PillCityDevTerraform
terraform init
terraform apply -auto-approve
S3_BUCKET_NAME=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-bucket") .instances[0].attributes.bucket')
AWS_ACCESS_KEY=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-admin-user-secret") .instances[0].attributes.id')
AWS_SECRET_KEY=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-admin-user-secret") .instances[0].attributes.secret')
CF_SIGNER_KEY_ID=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-cf-public-key") .instances[0].attributes.id')
CF_DISTRIBUTION_DOMAIN_NAME=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-cf-distribution") .instances[0].attributes.domain_name')

popd || exit

echo "Please replace the following lines in .env file"
echo "S3_BUCKET_NAME=${S3_BUCKET_NAME}"
echo "AWS_ACCESS_KEY=${AWS_ACCESS_KEY}"
echo "AWS_SECRET_KEY=${AWS_SECRET_KEY}"
echo "CF_SIGNER_PRIVATE_KEY_ENCODED=${CF_SIGNER_PRIVATE_KEY_ENCODED}"
echo "CF_SIGNER_KEY_ID=${CF_SIGNER_KEY_ID}"
echo "CF_DISTRIBUTION_DOMAIN_NAME=${CF_DISTRIBUTION_DOMAIN_NAME}"
