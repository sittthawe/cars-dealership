# Cars Dealership Full Stack Project

This repository contains a complete full-stack capstone implementation for a U.S. car dealership platform using a microservices architecture.

## Stack

- Frontend: React + Vite + Bootstrap
- Backend orchestration/auth: Django
- Dealer/review data API: Node.js + Express + MongoDB
- Sentiment microservice: Flask
- Databases: SQLite (auth/session), MongoDB (dealers/reviews)
- DevOps: Docker, Kubernetes, GitHub Actions

## Folder Layout

- `backend/django_service`: Main backend and authentication gateway
- `backend/node_api`: Dealer and review APIs with MongoDB
- `backend/sentiment_service`: Sentiment classification microservice
- `frontend/react_app`: Single-page web client
- `deploy/k8s`: Kubernetes manifests
- `.github/workflows`: CI pipeline

## Local Run (Docker Compose)

1. Build and start all services:

```bash
docker compose up --build
```

2. Open apps:

- Frontend: http://localhost:5173
- Django API: http://localhost:8000/api/health/
- Node API: http://localhost:3001/health
- Sentiment API: http://localhost:5001/health
- Mongo Express: http://localhost:8081

## Auth and Review Flow

- Register or login in the React UI
- Browse dealers and filter by state
- Open dealer details and review list
- Submit a review (authenticated users only)
- Django sends review text to Flask sentiment API
- Django forwards enriched review to Node API
- Node API stores review in MongoDB

## Key API Endpoints (Django)

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `GET /api/me/`
- `GET /api/dealers/`
- `GET /api/dealers/<dealer_id>/`
- `GET /api/dealers/<dealer_id>/reviews/`
- `POST /api/reviews/` (requires authentication)

## Kubernetes Deployment

1. Build and push container images for:
   - django-backend
   - node-api
   - sentiment-service
   - frontend
2. Replace `your-registry/...` image names in `deploy/k8s/*.yaml`
3. Apply manifests:

```bash
kubectl apply -f deploy/k8s/mongodb.yaml
kubectl apply -f deploy/k8s/node-api.yaml
kubectl apply -f deploy/k8s/sentiment-service.yaml
kubectl apply -f deploy/k8s/django-backend.yaml
kubectl apply -f deploy/k8s/frontend.yaml
```

## Notes

- This starter includes seed dealership records in the Node API.
- Sentiment logic is keyword-based and can be replaced with a stronger NLP model.
- For production: enable secure secrets handling, CSRF hardening, and persistent MongoDB volumes.
