RUNTIME_NAME := sales-assistant
IMAGE_NAME := crpi-n68v5vsgyo3vr4da.cn-hangzhou.personal.cr.aliyuncs.com/linkedti/$(RUNTIME_NAME)
TAG := v1
PORT := 8080

# qrcode
# Please make sure to install the qrencode tool in the system. Otherwise, you can generate it using an online website.
# http://cli.im/url
LOCAL_IP := $(shell hostname -I | awk '{print $$1}')
LOCAL_URL := http://$(LOCAL_IP):$(PORT)
ONLINE_URL := http://sales.linkedti.com

build:
	docker build -t $(IMAGE_NAME):$(TAG) .

push:
	docker push $(IMAGE_NAME):$(TAG)

run: stop
	docker run -d -p $(PORT):80 --name $(RUNTIME_NAME) $(IMAGE_NAME):$(TAG)

restart:
	docker restart $(RUNTIME_NAME)

logs:
	docker logs -f $(RUNTIME_NAME)

stop:
	-docker stop $(RUNTIME_NAME)
	-docker rm $(RUNTIME_NAME)

clean-image:
	-docker rmi $(IMAGE_NAME):$(TAG)

clean: stop clean-image

release: build push

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