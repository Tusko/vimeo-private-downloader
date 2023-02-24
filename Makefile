DOCKER := docker
IMAGE_NAME := vimeo-private-downloader
IMAGE_VERSION := latest
CURRENT_DIR := $(shell pwd)

build:
	@$(DOCKER) build . -t $(IMAGE_NAME):$(IMAGE_VERSION)

start:
	@$(DOCKER) run --rm -it -v $(CURRENT_DIR):/src $(IMAGE_NAME):$(IMAGE_VERSION) npm run start

combine:
	@$(DOCKER) run --rm -it -v $(CURRENT_DIR):/src $(IMAGE_NAME):$(IMAGE_VERSION) npm run combine

bash:
	@$(DOCKER) run --rm -it -v $(CURRENT_DIR):/src $(IMAGE_NAME):$(IMAGE_VERSION) /bin/sh
