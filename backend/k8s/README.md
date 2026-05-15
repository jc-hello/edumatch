# Local Kubernetes deploy

These manifests run the backend plus Postgres, Redis, and MinIO in a local Kubernetes cluster.

## 1. Build the API image

For Docker Desktop Kubernetes:

```sh
docker build -t edumatch-backend:local .
```

For minikube:

```sh
eval "$(minikube docker-env)"
docker build -t edumatch-backend:local .
```

For kind:

```sh
docker build -t edumatch-backend:local .
kind load docker-image edumatch-backend:local
```

## 2. Apply manifests

```sh
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-config.yaml
kubectl apply -f k8s/02-postgres.yaml
kubectl apply -f k8s/03-redis.yaml
kubectl apply -f k8s/04-minio.yaml
kubectl apply -f k8s/05-minio-bucket-job.yaml
kubectl apply -f k8s/06-api-migration-job.yaml
kubectl wait --for=condition=complete job/edumatch-api-migration -n edumatch --timeout=120s
kubectl apply -f k8s/07-api.yaml
```

## 3. Check status

```sh
kubectl get pods,svc,jobs -n edumatch
kubectl logs -n edumatch deploy/edumatch-api
```

API:

```sh
curl http://localhost:30080/api/docs
```

If NodePort is not exposed on `localhost`, use port-forwarding:

```sh
kubectl port-forward -n edumatch svc/edumatch-api 3000:3000
```

Then open `http://localhost:3000/api/docs`.

MinIO console is exposed on NodePort `31001`, with username `minioadmin` and password `minioadmin`.

## Rebuild after code changes

```sh
docker build -t edumatch-backend:local .
kubectl rollout restart deployment/edumatch-api -n edumatch
```

For kind, run `kind load docker-image edumatch-backend:local` again before restarting the deployment.

## Reset local data

```sh
kubectl delete namespace edumatch
```
