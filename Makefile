DEST_DIR=build

AVAILABLE_LANGS:=ja
RMD_DIR:=rmd
RMD_FILES:=$(shell find "$(RMD_DIR)" -type f)
MUSTACHE_DIR:=pages
MUSTACHE_FILES:=$(patsubst $(RMD_DIR)/%.rmd, $(MUSTACHE_DIR)/%.mustache, $(RMD_FILES))

SASS_DIR:=sass
SASS_FILES:=$(shell find "$(SASS_DIR)" -name "*.scss" -not -name "_*")
CSS_DIR:=$(DEST_DIR)/css
CSS_FILES:=$(patsubst $(SASS_DIR)/%.scss, $(CSS_DIR)/%.css, $(SASS_FILES))

PAGE_BUILDER_TAG?=page-builder:latest
SASS_TAG?=nahcnuj/alpine-sassc:3.6.1
UZU_TAG?=nahcnuj/alpine-uzu:1.2.1

.PHONY: all clean build rebuild gen-page html css

all: build

clean:
	@rm -rf $(dir $(MUSTACHE_FILES)) build/*

build: gen-page html css

rebuild: clean build

gen-page: $(MUSTACHE_FILES)

$(MUSTACHE_DIR)/%.mustache: $(RMD_DIR)/%.rmd
	@echo $< "->" $@
	@[ -e $(dir $@) ] || mkdir -p $(dir $@)
	@[ ! -z "$$(docker image ls -q $(PAGE_BUILDER_TAG))" ] || docker build -t $(PAGE_BUILDER_TAG) -f docker/page-builder/Dockerfile .
	@docker run --rm -i \
		-w /home/user \
		-v $(PWD):/home/user \
		-e LOCAL_UID=$(shell id -u $${USER}) \
		-e LOCAL_GID=$(shell id -g $${USER}) \
		$(PAGE_BUILDER_TAG) \
		bin/rmd2mustache.raku --langs="$(AVAILABLE_LANGS)" $< $(dir $@)

html:
	@mkdir -p $(DEST_DIR)
	@mkdir -p partials  # needed by Uzu
	@docker run --rm -i \
		-v $(PWD):/home/user \
		-e LOCAL_UID=$(shell id -u $${USER}) \
		-e LOCAL_GID=$(shell id -g $${USER}) \
		$(UZU_TAG)
	@rmdir --ignore-fail-on-non-empty partials

css: $(CSS_FILES)
$(CSS_DIR)/%.css: $(SASS_DIR)/%.scss
	@mkdir -p $(CSS_DIR)
	@echo $< "->" $@
	@docker run --rm -i \
		-v $(PWD)/$(SASS_DIR):/home/user/sass \
		-v $(PWD)/$(CSS_DIR):/home/user/css \
		-e LOCAL_UID=$(shell id -u $${USER}) \
		-e LOCAL_GID=$(shell id -g $${USER}) \
		$(SASS_TAG) -t compressed $< $(subst build/,,$@)


.PHONY: external-images update-kkn

external-images: public/img/annict-logo-ver3.png

public/img/annict-logo-ver3.png:
	@mkdir -p `dirname $@`
	@curl -L 'https://github.com/annict/annict-logo/raw/master/annict-logo-ver3.png' -o $@


update-kkn: public/img/kkn.svg
public/img/kkn.svg:
	@mkdir -p `dirname $@`
	@curl -L 'https://uub.jp/kkn/km_new.cgi?MAP=00410040103552000031114014554400341410040030044&CAT=%E7%94%9F%E6%B6%AF%E7%B5%8C%E7%9C%8C%E5%80%A4' \
		| tr -d '\r\n' \
		| grep -o -E '<svg.*?</svg>' >$@
	@sed -E 's,(fill="#[0-9a-fA-F]{6}")",\1,g' -i $@


.PHONY: html-lint
html-lint: bin/html5check.py
	@find build -name '*.html' \
		| xargs -n1 -I% sh -c "echo %; $< %"

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@


NGINX_CONTAINER_NAME:=nahcnuj-work-test
.PHONY: server-start server-stop server-restart server-log
server-start:
	@docker run --rm -v $(PWD)/build:/usr/share/nginx/html -p 3000:80 --name $(NGINX_CONTAINER_NAME) nginx >/dev/null 2>&1 &

server-stop:
	@docker stop $(NGINX_CONTAINER_NAME) >/dev/null

server-restart: server-stop server-start

server-log:
	@docker logs -f --tail 10 $(NGINX_CONTAINER_NAME)
