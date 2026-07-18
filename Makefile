BINARY := reelingit
DIST := dist

.PHONY: dist frontend backend clean

dist: frontend backend

frontend:
	npm run build:app

backend:
	CGO_ENABLED=0 GOOS=$(GOOS) GOARCH=$(GOARCH) go build -trimpath -ldflags="-s -w" -o $(DIST)/$(BINARY) ./cmd/main.go

clean:
	rm -rf $(DIST)
