# server
The OpenAPI spec, server and official web frontend for Pill City

## Video demo
Here is a video demo for some of its features such as circle management, emoji reactions and post formatting

https://user-images.githubusercontent.com/3515852/132497391-32cb728b-ff70-478a-a0cd-e97aa57106f1.mp4

## Architecture
The project consists of an API server written in Python/Flask, and a web frontend written in JavaScript/React

The API server stores information in a MongoDB database, and it uses S3 to store images and other types of media

### Software prerequisites
* `Python 3.9` and [`virtualenv`](http://packaging.python.org/guides/installing-using-pip-and-virtualenv/)
* Node.js v16 and Yarn
* [python-devkit](https://github.com/k-t-corp/python-devkit)

### API development

#### Prerequisite
Run `cp .example.env .env` and `make dev-deps`

#### Run API locally
``` shell
up  # python-devkit alias
```
You will see the web frontend at [localhost:3000](http://localhost:3000)

The API will be running at `localhost:5000`

### Run API unit tests
``` shell
make test
```

#### Dump dummy data into server
Make sure you have the API running
``` shell
make dev-dump
```
Use ID `ika` and password `1234` to log in

#### Run API database schema migration
Make sure you have the API running
``` shell
make dev-release
```

### Web frontend development

#### Prerequisite
Run `cp web/.example.env web/.env` and `cd web && yarn install`

### Run web frontend locally
```shell
cd web && yarn start
```

### Start API and web frontend on LAN (e.g. Android emulator or iOS device)
1. Figure out your LAN IP. You can do this by running `cd web && yarn start` and inspect the `On Your Network` IP printed by `create-react-app`
2. Stop `yarn start`
3. Update `.env`
   1. Replace `localhost` in `CDN_URL` with your LAN IP
4. Update `web/.example.env`
   2. Replace `localhost` in `REACT_APP_API_ENDPOINT` with your LAN IP
5. Run `up` and `cd web && yarn start` as usual

## Security
Please send security findings to [`security@pill.city`](mailto:security@pill.city).
