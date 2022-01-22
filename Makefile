DEST_DIR:=build

AVAILABLE_LANGS:=ja
RMD_DIR:=rmd
RMD_FILES:=$(shell find "$(RMD_DIR)" -type f)
MUSTACHE_DIR:=pages
MUSTACHE_FILES:=$(patsubst $(RMD_DIR)/%.rmd, $(MUSTACHE_DIR)/%.mustache, $(RMD_FILES))

SASS_DIR:=sass
SASS_FILES:=$(shell find "$(SASS_DIR)" -name "*.scss" -not -name "_*")
CSS_DIR:=$(DEST_DIR)/css
CSS_FILES:=$(patsubst $(SASS_DIR)/%.scss, $(CSS_DIR)/%.css, $(SASS_FILES))

DOCKER_BUILDKIT:=1
PAGE_BUILDER_TAG:=page-builder:1.4.0
SASS_TAG:=michalklempa/dart-sass:1.36
UZU_TAG:=nahcnuj/alpine-uzu:1.2.1

.PHONY: all clean build rebuild gen-page html css

all: build

clean:
	@rm -rf $(dir $(MUSTACHE_FILES)) $(DEST_DIR)/*

build: gen-page html css

rebuild: clean build

gen-page:
	@[ ! -z "$$(docker image ls -q $(PAGE_BUILDER_TAG))" ] \
	  || docker build \
	    --cache-from /tmp/$(PAGE_BUILDER_TAG) --build-arg BUILDKIT_INLINE_CACHE=1 \
	    -t $(PAGE_BUILDER_TAG) -f docker/page-builder/Dockerfile . \
	  && docker save $(PAGE_BUILDER_TAG) -o /tmp/$(PAGE_BUILDER_TAG)
	@make $(MUSTACHE_FILES)

$(MUSTACHE_DIR)/%.mustache: $(RMD_DIR)/%.rmd
	@echo $< "->" $@
	@docker run --rm -i \
	  -v $(PWD)/$(RMD_DIR):/home/builder/$(RMD_DIR):ro \
	  -v $(PWD)/$(MUSTACHE_DIR):/home/builder/$(MUSTACHE_DIR) \
	  --entrypoint=entrypoint.sh \
	  $(PAGE_BUILDER_TAG) \
	  ls -alR .
	@docker run --rm -i \
	  -v $(PWD)/$(RMD_DIR):/home/builder/$(RMD_DIR):ro \
	  -v $(PWD)/$(MUSTACHE_DIR):/home/builder/$(MUSTACHE_DIR) \
	  $(PAGE_BUILDER_TAG) \
	  --langs="$(AVAILABLE_LANGS)" $< $(dir $@)

html:
	@mkdir -p $(DEST_DIR)
	@mkdir -p partials  # needed by Uzu
	@docker run --rm -i \
	  -v $(PWD):/home/user \
	  -e LOCAL_UID=$(shell id -u $${USER}) \
	  -e LOCAL_GID=$(shell id -g $${USER}) \
	  $(UZU_TAG)
	@rmdir --ignore-fail-on-non-empty partials

css:
	@mkdir -p $(CSS_DIR)
	@make -j $(CSS_FILES)

$(CSS_DIR)/%.css: $(SASS_DIR)/%.scss
	@echo $< "->" $@
	@docker run --rm -i \
	  -v $(PWD)/$(SASS_DIR):/sass/ \
	  -v $(PWD)/$(CSS_DIR):/css/ \
	  -e LOCAL_UID=$(shell id -u $${USER}) \
	  -e LOCAL_GID=$(shell id -g $${USER}) \
	  $(SASS_TAG) \
	  /opt/dart-sass/sass \
	    -s compressed \
	    --no-source-map \
	    $< $(subst $(DEST_DIR)/,,$@)


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
	@find $(DEST_DIR) -name '*.html' \
	  | xargs -n1 -I% sh -c "echo %; $< %"

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@


UZU_CONTAINER_NAME:=nahcnuj-work-uzu
SASS_CONTAINER_NAME:=nahcnuj-work-sass
NGINX_CONTAINER_NAME:=nahcnuj-work-test

.PHONY: server-start server-stop server-restart server-log
server-start:
	@mkdir -p $(CSS_DIR)
	@docker run --rm -d -it \
	  -v $(PWD)/$(SASS_DIR):/$(SASS_DIR) \
	  -v $(PWD)/$(CSS_DIR):/$(CSS_DIR) \
	  -e LOCAL_UID=$(shell id -u $${USER}) \
	  -e LOCAL_GID=$(shell id -g $${USER}) \
	  --name $(SASS_CONTAINER_NAME) \
	  $(SASS_TAG) \
	  /opt/dart-sass/sass \
	    -s compressed \
	    --no-source-map \
		--watch \
	    $(SASS_DIR):$(CSS_DIR)
	@docker run --rm -d -it \
	  -v $(PWD):/home/user \
	  -v $(PWD)/themes/default/partials:/home/user/partials \
	  -e LOCAL_UID=$(shell id -u $${USER}) \
	  -e LOCAL_GID=$(shell id -g $${USER}) \
	  --name $(UZU_CONTAINER_NAME) \
	  $(UZU_TAG) watch
	@docker run --rm -d -it \
	  -v $(PWD)/$(DEST_DIR):/usr/share/nginx/html \
	  -p 3000:80 \
	  --name $(NGINX_CONTAINER_NAME) \
	  nginx

server-stop:
	@docker stop $(UZU_CONTAINER_NAME) >/dev/null || :
	@docker stop $(SASS_CONTAINER_NAME) >/dev/null || :
	@docker stop $(NGINX_CONTAINER_NAME) >/dev/null || :

server-restart: server-stop server-start
