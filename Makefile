HTML_BUILDER_TAG=html-builder:latest
SASS_BUILDER_TAG=sass-builder:latest

.PHONY: all
all: clean build html-lint

.PHONY: clean
clean:
	@docker images -q $(HTML_BUILDER_TAG) \
		| xargs docker rmi || :

.PHONY: css
css:
	@docker build -t $(SASS_BUILDER_TAG) --target sass-builder .
	@docker run --rm \
		-v $(PWD)/sass:/var/src/sass \
		-v $(PWD)/build/css:/var/src/css \
		$(SASS_BUILDER_TAG)

.PHONY: build
build: css
	@docker build -t $(HTML_BUILDER_TAG) --target html-builder .
	@docker run --rm -v $(PWD)/build:/var/src/build $(HTML_BUILDER_TAG)


NGINX_CONTAINER_NAME=nahcnuj-work-test
.PHONY: server-start server-stop server-log
server-start:
	@docker run --rm -v $(PWD)/build:/usr/share/nginx/html -p 3000:80 --name $(NGINX_CONTAINER_NAME) nginx >/dev/null 2>&1 &

server-stop:
	@docker stop $(NGINX_CONTAINER_NAME) >/dev/null

server-log:
	@docker logs -f --tail 10 $(NGINX_CONTAINER_NAME)


.PHONY: html-lint
html-lint: bin/html5check.py
	@find build -name '*.html' \
		| xargs -n1 $<

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@
