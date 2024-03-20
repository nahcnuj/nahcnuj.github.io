DEST_DIR:=dist

.PHONY: all clean build rebuild

all: build

clean:
	@rm -rf $(DEST_DIR)/*

build:
	@npm ci --cache ~/.npm --prefer-offline
	@npm run build

rebuild: clean build


.PHONY: external-images update-kkn

external-images: # public/img/annict-logo-ver3.png

# public/img/annict-logo-ver3.png:
# 	@mkdir -p `dirname $@`
# 	@curl -L 'https://github.com/annict/annict-logo/raw/master/annict-logo-ver3.png' -o $@


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
