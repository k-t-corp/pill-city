dev-deps:
		python3 -m venv venv
		./venv/bin/pip install -r requirements.txt
		cp .example.env .env
		cp web/.example.env web/.env

dev-api: dev-deps
		docker-compose down
		docker-compose up -d
		set -o allexport; source .env; FLASK_ENVIRONMENT=development heroku local -f Procfile.dev
		docker-compose down

dev-release: dev-deps
		set -o allexport; source .env; ./venv/bin/python release.py

dev-web:
		cd web; yarn install; yarn start

dev-dump: dev-deps
		./venv/bin/python ./scripts/dev_dump_mock_data.py

test: dev-deps
		./venv/bin/nosetests
