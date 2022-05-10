# server
The OpenAPI spec, server and official web frontend for Pill City

## Video demo
Here is a video demo for some of its features such as circle management, emoji reactions and post formatting

https://user-images.githubusercontent.com/3515852/132497391-32cb728b-ff70-478a-a0cd-e97aa57106f1.mp4

## Development
The project consists of an API server written in Python/Flask, and a web frontend written in JavaScript/React

The API server stores information in a MongoDB database, and it uses S3 additionally to store images and other types of media

### Prerequisites
* Python 3.7+
* Node.js v14 and Yarn
* Docker and docker-compose
* Heroku CLI (used for running Procfile locally)

### Start API and web development
``` shell
make
```
You will see the web frontend at [localhost:3000](http://localhost:3000)

The API will be running at `localhost:5000`

### Dump dummy data into API
Make sure you have the API running
``` shell
make dev-dump
```
Use ID `ika` and password `1234` to log in

### Start API development
``` shell
make dev-api
```

### Start web development
``` shell
make dev-web
```

### Start API and web development on LAN (e.g. Android simulator or iOS device)
1. Figure out your LAN IP. You can do this by running `make dev-web` and inspect the `On Your Network` IP printed by `create-react-app`
2. Stop `make dev-web`
3. Temporarily update `.example.env`
   1. Replace `localhost` in `CDN_URL` with your LAN IP
4. Temporarily update `web/.example.env`
   1. Replace `lcoalhost` in `REACT_APP_API_ENDPOINT` with your LAN IP
5. Run `make dev-api` and `make dev-web` as usual
6. Do not forget to revert `.example.env` and `web/.example.env` when done

### Run API unit tests
``` shell
make test
```

## Security
Please send security findings to [`security@pill.city`](mailto:security@pill.city).
