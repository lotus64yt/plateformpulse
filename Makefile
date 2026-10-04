.PHONY: dev backend frontend install

dev:
	$(MAKE) backend & \
	$(MAKE) frontend & \
	wait

backend:
	cd backend && go run main.go

frontend:
	cd frontend && pnpm run dev

install:
	cd backend && go mod tidy
	cd frontend && pnpm install