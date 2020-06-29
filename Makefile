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
