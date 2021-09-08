# pill-city
An one-of-a-kind social network

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

### Start API and web development
```
make
```
You will see the web frontend at [localhost:3000](http://localhost:3000)

The API will be running at `localhost:5000`

### Dump dummy data into API
Make sure you have the API running
```
make dev-dump
```

### Start API development alone
```
make dev-api
```

### Start web development alone
```
make dev-web
```

### Run API unit tests
```
make test
```

## Security
Please send security findings to [`security@ktachibana.party`](mailto:security@ktachibana.party). If verified I'll personally thank you and give you some rewards.
