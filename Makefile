.PHONY: build create-configmap create-secrets deploy delete

LOG_LEVEL ?= info

create-configmap:  ## Create Kubernetes ConfigMap
	kubectl create configmap slack-king-of-time-config \
		--from-file=config-json=config.json \
		--dry-run=client -o yaml | kubectl apply -f -

create-secrets:  ## Create Secrets from .env file
	kubectl create secret generic slack-king-of-time-secrets \
		--from-env-file=.env \
		--dry-run=client -o yaml | kubectl apply -f -

deploy:  ## Deploy Kubernetes resources
	kubectl apply -f ./kubernetes/

delete:  ## Delete Kubernetes resources
	kubectl delete -f ./kubernetes/
