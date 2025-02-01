DEST_DIR:=dist

.PHONY: all check clean build rebuild setup

all: build

clean:
	@rm -rf $(DEST_DIR)/*

setup:
	@npm ci --cache ~/.npm --prefer-offline

build: setup
	@npm run build

check: setup
	@npm run lint

rebuild: clean build


.PHONY: html-lint
html-lint: bin/html5check.py
	@find $(DEST_DIR) -name '*.html' \
	  | xargs -n1 -I% sh -c "echo %; $< %"

bin/html5check.py:
	@curl -L https://raw.githubusercontent.com/mozilla/html5-lint/master/html5check.py -o $@
	@chmod +x $@
