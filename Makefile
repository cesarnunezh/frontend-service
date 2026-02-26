.DEFAULT_GOAL := help

help:
	@echo "Available targets:"
	@echo "  setup   - install dependencies"
	@echo "  lint    - run eslint"
	@echo "  test    - run tests"
	@echo "  build   - build the app"
	@echo "  run     - run dev server"

setup:
	corepack enable && corepack prepare pnpm@9.7.1 --activate
	pnpm install

lint:
	pnpm lint

test:
	pnpm test

build:
	pnpm build

run:
	pnpm dev
