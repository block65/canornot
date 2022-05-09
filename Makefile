
SRCS = $(wildcard lib/** bin/**)

all: dist

node_modules: yarn.lock
	yarn install

yarn.lock: package.json
	yarn install --frozen-lockfile

.PHONY: clean
clean: node_modules
	yarn tsc -b --clean 

.PHONY: test
test: node_modules
	NODE_OPTIONS=--experimental-vm-modules yarn jest 

dist: node_modules tsconfig.json $(SRCS)
	yarn tsc
	chmod +x dist/bin/*.js

.PHONY: dev
dev: node_modules dist
	yarn tsc -w