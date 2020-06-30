HTML_BUILDER_TAG=html-builder:latest
SASS_BUILDER_TAG=sass-builder:latest

.PHONY: all
all: css build

.PHONY: clean
clean:
	@sudo rm -rf build/*

.PHONY: docker-build
docker-build:
	@docker build -t $(SASS_BUILDER_TAG) --target sass-builder .
	@docker build -t $(HTML_BUILDER_TAG) --target html-builder .

.PHONY: css
css:
	@docker run --rm \
		-v $(PWD)/sass:/var/src/sass \
		-v $(PWD)/build/css:/var/src/css \
		$(SASS_BUILDER_TAG)

.PHONY: build
build:
	@docker run --rm -v $(PWD):/var/src $(HTML_BUILDER_TAG)

.PHONY: rebuild
rebuild: clean all

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
