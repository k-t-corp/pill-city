dev-deps:
		python3 -m venv venv
		./venv/bin/pip install -r requirements.txt

dev-api:
		docker-compose down
		docker-compose up -d
		set -o allexport; source .env; heroku local -f Procfile.dev
		docker-compose down

dev-release:
		set -o allexport; source .env; ./venv/bin/python release.py

dev-dump:
		./venv/bin/python ./scripts/dev_dump_mock_data.py

test:
		./venv/bin/nosetests
