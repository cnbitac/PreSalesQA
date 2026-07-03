REGISTRY_URL=crpi-n68v5vsgyo3vr4da.cn-hangzhou.personal.cr.aliyuncs.com/linkedti
IMAGE_NAME := sales-assistant
TAG := v1
PORT := 8080

# qrcode
# Please make sure to install the qrencode tool in the system. Otherwise, you can generate it using an online website.
# http://cli.im/url
LOCAL_IP := $(shell hostname -I | awk '{print $$1}')
LOCAL_URL := http://$(LOCAL_IP):$(PORT)
ONLINE_URL := http://sales.linkedti.com

build:
	docker build -t $(REGISTRY_URL)/$(IMAGE_NAME):$(TAG) -f sales-assistant/docker/Dockerfile sales-assistant

run:
	docker compose -f  sales-assistant/docker/docker-compose.yaml --env-file  sales-assistant/docker/.env up -d

down:
	docker compose -f  sales-assistant/docker/docker-compose.yaml --env-file  sales-assistant/docker/.env down

push:
	docker push $(REGISTRY_URL)/$(IMAGE_NAME):$(TAG)

qr-local:
	mkdir -p output
	qrencode -o output/qrcode-local.png -s 8 $(LOCAL_URL)
	@echo "Local LAN address: $(LOCAL_URL)"
	@echo "QR code file: output/qrcode-local.png"

qr-online:
	mkdir -p output
	qrencode -o output/qrcode-online.png -s 8 $(ONLINE_URL)
	@echo "Public URL: $(ONLINE_URL)"
	@echo "QR code file: output/qrcode-online.png"

qr-term:
	qrencode -t ansiutf8 $(LOCAL_URL)

clean-qr:
	rm -rf output