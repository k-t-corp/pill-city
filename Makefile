dev-deps:
		python3 -m venv venv
		./venv/bin/pip install -r requirements.txt

dev-localstack-setup:
		./dev-localstack-setup.sh

dev-release:
		set -o allexport; source .env; ./venv/bin/python release.py

dev-dump:
		./venv/bin/python ./dev/dump_mock_data.py

test:
		./venv/bin/nosetests
