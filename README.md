# OctoFit Tracker

OctoFit Tracker is a three-tier fitness app for school teams. It tracks activities, manages teams, ranks teams by earned points, and recommends workouts based on a user's goal and recent activity.

## Requirements

- Node.js and npm
- MongoDB listening on port `27017`

The API uses `mongodb://localhost:27017/octofit_db` by default. Set `MONGODB_URI` to use another MongoDB connection string.

## Run locally

Install dependencies from the existing lockfiles:

```bash
npm ci --prefix octofit-tracker/backend
npm ci --prefix octofit-tracker/frontend
```

Seed the demo data once MongoDB is running:

```bash
npm run seed --prefix octofit-tracker/backend
```

Start the API and frontend in separate terminals:

```bash
npm run dev --prefix octofit-tracker/backend
```

```bash
npm run dev --prefix octofit-tracker/frontend
```

Open the frontend at [http://localhost:5173](http://localhost:5173). The API listens on port `8000`; Vite proxies `/api` requests to it. The API health check is at [http://localhost:8000/health](http://localhost:8000/health).

## Test and build

```bash
npm run test:data --prefix octofit-tracker/backend
npm run test:api --prefix octofit-tracker/backend
npm test --prefix octofit-tracker/frontend
npm run build --prefix octofit-tracker/backend
npm run build --prefix octofit-tracker/frontend
```

The backend tests use `mongodb-memory-server`, which may download a MongoDB binary on its first run.

## Exercise

This repository is part of the [Build and test a multi-tier application with GitHub Copilot exercise](https://github.com/edaltabuit/skills-build-applications-w-copilot-agent-mode/issues/1).

