# pill-city
An one-of-a-kind social network

## Development

### Prerequisites
* Python 3.7+
* Node.js and Yarn
* Docker and docker-compose

### Install dependencies
```
python3 -m venv venv
./venv/bin/pip install -r requirements.txt
```

### Prepare .env files
* Copy `.example.env` to `.env`
* Copy `./web/.example.env` to `./web/.env`

### Run API
```bash
./scripts/dev.sh
```

### Run web frontend
In another terminal
```bash
cd web
yarn install
yarn start
```

View web frontend at [`http://localhost:3000`](http://localhost:3000/)
