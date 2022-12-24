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
* `jq`
* [`terraform`](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
* [`tflocal`](https://docs.localstack.cloud/user-guide/integrations/terraform/#using-the-tflocal-script) from `LocalStack`
* [`saturn`, a development CLI for my Python stacks](https://github.com/k-t-corp/saturn)

## Prerequisites
1. Install Python dependencies

   ```bash
   make dev-deps
   ```

2. Copy configurations

   ```bash
   cp .example.env .env
   ```

3. Setup LocalStack Pro
  * Obtain an trial LocalStack Pro license key and place it in `.env` (the `LOCALSTACK_API_KEY` variable)
  * Run `docker compose run localstack-pro` to start LocalStack Pro
  * Run `make dev-localstack-setup` to provision AWS resources on LocalStack Pro
  * Follow the instructions in the output to update the `AWS_ACCESS_KEY` and `AWS_SECRET_KEY` variables in `.env`
  * Stop the process started by `docker compose run localstack-pro`

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
Please send security findings to [`security@pill.city`](mailto:security@pill.city).
