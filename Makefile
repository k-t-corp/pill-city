dev-deps:
		python3 -m venv venv
		./venv/bin/pip install -r requirements.txt
		cp .example.env .env
		cp web/.example.env web/.env

dev-api: dev-deps
		docker-compose down
		docker-compose up -d
		set -o allexport; source .env; FLASK_ENVIRONMENT=development ./venv/bin/python app.py
		docker-compose down

dev-web:
		cd web; yarn install; yarn start

dev-dump: dev-deps
		./venv/bin/python ./scripts/dev_dump_mock_data.py

test: dev-deps
		nosetests
