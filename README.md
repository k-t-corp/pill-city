# pill-city
A social network reminiscent of Google+ with enhancements


## Prerequisites

0. [Open the project in VSCode using devcontainer](https://code.visualstudio.com/docs/devcontainers/containers#:~:text=Start%20VS%20Code%2C%20run%20the,set%20up%20the%20container%20for.)

1. Prepare environment files

   ```bash
   cp .example.env .env
   cp ./web/.env.development ./web/.env.development.local
   ```

2. Setup AWS for development

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
  * Edit the file `~/.aws/credentials` and fill in the `<Access key ID>` and `<Secret access key>`
  * Run `make dev-aws-setup` to provision AWS resources and add related environment variables
  * **Save the resulting `pill-city-dev-env.zip` (right click the file in VSCode and click "Download") to your host machine because there is currently no way to persist the generated files from above steps**


## Run
``` shell
overmind s
```
The API will be running at `localhost:5000`


## Dump dummy data into server
Make sure you have the server running
``` shell
make dev-dump
```
Use ID `kele` and password `1234` to log in


## Run the web UI
See [README for web](./web/README.md)


## Run unit tests
``` shell
make test
```


## Run API database schema migration
Make sure you have the API running
``` shell
make dev-release
```


## Security
Please send security findings to [`admin@ktachibana.party`](mailto:admin@ktachibana.party).
