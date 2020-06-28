.PHONY: docker-build
docker-build:
	@docker build -t html-builder:latest .

.PHONY: build
build: docker-build
	@docker run --rm -v $(PWD)/build:/var/src/build html-builder:latest

.PHONY: preview
preview: docker-build
	@docker run --rm -v $(PWD)/build:/var/src/build -p 3000:3000 -it html-builder:latest watch || :

.PHONY: html-lint
html-lint: bin/html5check.py
	@find build -name '*.html' \
		| xargs -n1 $<

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@
