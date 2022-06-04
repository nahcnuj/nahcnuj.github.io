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

.PHONY: all clean build rebuild gen-page html css

all: build

clean:
	@rm -rf $(dir $(MUSTACHE_FILES)) $(DEST_DIR)/*

build: gen-page html css

rebuild: clean build

DOCKER_BUILDKIT:=1
PAGE_BUILDER:=page-builder
PAGE_BUILDER_VERSION:=1.6.0
PAGE_BUILDER_TAG:=$(PAGE_BUILDER):$(PAGE_BUILDER_VERSION)
PAGE_BUILDER_CACHE_FILE:=/tmp/$(PAGE_BUILDER).image

/tmp/%.image: docker/%/Dockerfile bin/rmd2mustache.raku
	@docker build \
	  --cache-from $@ --build-arg BUILDKIT_INLINE_CACHE=1 \
	  -t $(PAGE_BUILDER_TAG) -f $< .
	@docker save $(PAGE_BUILDER_TAG) -o $@

gen-page: $(PAGE_BUILDER_CACHE_FILE)
	@make -j $(MUSTACHE_FILES)

$(MUSTACHE_DIR)/%.mustache: $(RMD_DIR)/%.rmd
	@echo $< "->" $@
	@[ $$(docker images -q $(PAGE_BUILDER_TAG) | wc -l) -eq 0 ] && docker load -i $(PAGE_BUILDER_CACHE_FILE) || :
	@docker run --rm -i \
	  -v $(PWD)/$(RMD_DIR):/home/builder/$(RMD_DIR)/:ro \
	  -v $(PWD)/$(MUSTACHE_DIR):/home/builder/$(MUSTACHE_DIR)/ \
	  $(PAGE_BUILDER_TAG) \
	  --langs="$(AVAILABLE_LANGS)" $< $(dir $@)

html:
	@mkdir -p $(DEST_DIR)
	@docker compose run --rm uzu raku /usr/share/perl6/site/bin/uzu build

css:
	@mkdir -p $(CSS_DIR)
	@docker network inspect nahcnuj-work_network >/dev/null || docker network create nahcnuj-work_network
	@make -j $(CSS_FILES)

$(CSS_DIR)/%.css: $(SASS_DIR)/%.scss
	@echo $< "->" $@
	@docker compose run --rm -u "$(shell id -u)" sass \
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
