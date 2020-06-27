.PHONY: docker-build
docker-build:
	docker build -t html-builder:latest .

.PHONY: build
build: docker-build
	docker run --rm -v $(PWD)/build:/var/src/build html-builder:latest

.PHONY: preview
preview: docker-build
	docker run --rm -v $(PWD)/build:/var/src/build -p 80:3000 -it html-builder:latest watch || :
