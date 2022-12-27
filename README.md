# server
The OpenAPI spec and server for pill.city

## Features and Demo
See client repos

* [Flutter](https://github.com/pill-city/flutter)
* [Web](https://github.com/pill-city/web)

## Tech Overview
This is an API server written in Python/Flask. It stores information in a MongoDB database, and uses S3 to store media.

## Dependencies
* `Python 3.9` and [`virtualenv`](http://packaging.python.org/guides/installing-using-pip-and-virtualenv/)
* [`terraform`](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
* [`saturn`, a development CLI for my Python stacks](https://github.com/k-t-corp/saturn)
* `jq`
* `openssl`
* `base64`

## Prerequisites
1. Install Python dependencies

   ```bash
   make dev-deps
   ```

2. Copy configurations

   ```bash
   cp .example.env .env
   ```

3. Setup AWS for development
* Obtain an AWS account and setup admin credentials locally
  * Go to [Add user UI on IAM Dashboard](https://us-east-1.console.aws.amazon.com/iam/home#/users$new?step=details)
  * Enter `PillCityDevTerraform` for `User name`
  * Select `Programmatic access` in `Access type`
  * Click `Next: Permissions`
  * Select `Attach existing policies directly` in `Set permissions`
  * Search for `AdministratorAccess` and select it
  * Click `Next: Tags`
  * Click `Next: Review`
  * Click `Create user`
  * Copy the `Access key ID` and `Secret access key` to your clipboard
  * Edit (if does not exist create) `.aws/credentials` on your local machine and append in the following
    
```
[PillCityDevTerraform]
aws_access_key_id=<Access key ID>
aws_secret_access_key=<Secret access key>
region=us-west-2
```

  * Run `make dev-aws-setup` to provision AWS resources on LocalStack Pro
  * Follow the instructions in the output to update variables in `.env`

## Run
``` shell
up  # saturn alias
```
The API will be running at `localhost:5000`

See client repos on how to run a graphical interface

* [Flutter](https://github.com/pill-city/flutter)
* [Web](https://github.com/pill-city/web)

## Dump dummy data into server
Make sure you have the server running
``` shell
make dev-dump
```
Use ID `kt` and password `1234` to log in

## Run unit tests
``` shell
make test
```

## Run API database schema migration
Make sure you have the API running
``` shell
make dev-release
```

## Start API on LAN
1. Figure out your LAN IP. You can do this by running `ifconfig | grep 192` and find your LAN IP
2. Update `.env`
   1. Replace `localhost` in `CDN_URL`, `S3_ENDPOINT_URL` and `STS_ENDPOINT_URL` with your LAN IP
3. Rerun `up`

## Security
Please send security findings to [`admin@ktachibana.party`](mailto:admin@ktachibana.party).
