AVAILABLE_LANGS=ja
RMD_DIR=rmd
RMD_FILES=$(shell find "$(RMD_DIR)" -type f)
DEST_DIR=pages
DEST_FILES=$(patsubst $(RMD_DIR)/%.rmd, $(DEST_DIR)/%.mustache, $(RMD_FILES))

PAGE_BUILDER_TAG=page-builder:latest
SASS_BUILDER_TAG=sass-builder:latest

.PHONY: all
all: docker-build build css

.PHONY: clean
clean:
	@rm -rf $(dir $(DEST_FILES))
	@docker run --rm -v $(PWD):/var/src -w /var/src nahcnuj/alpine-uzu:1.1.2 clear

.PHONY: docker-build
docker-build:
	@docker build -t $(SASS_BUILDER_TAG) --target sass-builder .
	@docker build -t $(PAGE_BUILDER_TAG) -f docker/page-builder/Dockerfile .

.PHONY: css
css:
	@docker run --rm \
		-v $(PWD)/sass:/var/src/sass \
		-v $(PWD)/build/css:/var/src/css \
		$(SASS_BUILDER_TAG)

$(DEST_DIR)/%.mustache: $(RMD_DIR)/%.rmd
	@[ -e $(dir $@) ] || mkdir -p $(dir $@)
	@docker run --rm -v $(PWD):/var/src -w /var/src $(PAGE_BUILDER_TAG) \
		bin/rmd2mustache --langs="$(AVAILABLE_LANGS)" $< $(dir $@)

.PHONY: gen-page
gen-page: $(DEST_FILES)

.PHONY: build
build: public/img/annict-logo-ver3.png gen-page
	@docker run --rm \
		-v $(PWD):/home/user \
		-e LOCAL_UID=$(shell id -u $${USER}) \
		-e LOCAL_GID=$(shell id -g $${USER}) \
		nahcnuj/alpine-uzu:1.1.2

.PHONY: rebuild
rebuild: clean all

NGINX_CONTAINER_NAME=nahcnuj-work-test
.PHONY: server-start server-stop server-restart server-log
server-start:
	@docker run --rm -v $(PWD)/build:/usr/share/nginx/html -p 3000:80 --name $(NGINX_CONTAINER_NAME) nginx >/dev/null 2>&1 &

server-stop:
	@docker stop $(NGINX_CONTAINER_NAME) >/dev/null

server-restart: server-stop server-start

server-log:
	@docker logs -f --tail 10 $(NGINX_CONTAINER_NAME)


.PHONY: html-lint
html-lint: bin/html5check.py
	@find build -name '*.html' \
		| xargs -n1 $<

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@

public/img/annict-logo-ver3.png:
	@curl -L 'https://github.com/annict/annict-logo/raw/master/annict-logo-ver3.png' \
        --create-dirs -o $@
