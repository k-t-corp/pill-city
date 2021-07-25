# mini-gplus
A Google+ clone

## Development

### Prerequisites
* Python 3.7.0
* Node.js and Yarn
* Docker

### Run
```bash
# Run databases
docker compose up

# In another terminal, run server
pip install -r requirements.txt
FLASK_ENVIRONMENT=development python app.py

# In a third terminal, run web frontend
cd web
yarn install
yarn start
```

View web frontend at [`http://localhost:3000`](http://localhost:3000/)
