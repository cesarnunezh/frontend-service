.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  setup   - install dependencies"
	@echo "  lint    - run eslint placeholder"
	@echo "  test    - run tests"
	@echo "  scan    - run security scan placeholder"
	@echo "  build   - build docker image"

setup:
	npm ci

lint:
	@echo "No dedicated lint script configured for frontend-service yet"

test:
	npm test -- --watchAll=false

scan:
	@echo "No security scanner configured yet for frontend-service"

build:
	docker build --target production -t frontend-service:ci-local .
