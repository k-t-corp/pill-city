#!/usr/bin/env bash

for i in 1 2 3 4 5 6; do
  echo 'Waiting for LocalStack Pro'
  curl -f http://localhost:4566/health
  ret=$?
  echo "Return code was $ret"
  [ $ret -eq 0 ] && break
  sleep 5
done

pushd terraform
tflocal init
tflocal apply -auto-approve
AWS_ACCESS_KEY=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-stsadmin-secret") .instances[0].attributes.id')
AWS_SECRET_KEY=$(cat terraform.tfstate | jq -r '.resources[] | select(.name=="pill-city-stsadmin-secret") .instances[0].attributes.secret')
popd

echo "Please replace the line AWS_ACCESS_KEY=${AWS_ACCESS_KEY} in .env"
echo "Please replace the line AWS_SECRET_KEY=${AWS_SECRET_KEY} in .env"
