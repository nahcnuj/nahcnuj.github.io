HTML_BUILDER_TAG=html-builder:latest

.PHONY: all
all: clean build html-lint preview

.PHONY: clean
clean:
	@docker images -q $(HTML_BUILDER_TAG) \
		| xargs docker rmi || :

.PHONY: docker-build
docker-build:
	@docker build --no-cache -t $(HTML_BUILDER_TAG) .

.PHONY: build
build: docker-build
	@docker run --rm -v $(PWD)/build:/var/src/build $(HTML_BUILDER_TAG)

.PHONY: preview
preview:
	@docker run --rm -v $(PWD):/var/src -p 3000:3000 -it $(HTML_BUILDER_TAG) watch || :

.PHONY: html-lint
html-lint: bin/html5check.py
	@find build -name '*.html' \
		| xargs -n1 $<

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@
