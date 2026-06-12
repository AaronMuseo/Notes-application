# Notes Application

Full-stack notes app built with Spring Boot (backend) and React + Vite (frontend).

## Tech Stack

- Backend: Spring Boot, Spring Data JPA, Hibernate, H2/PostgreSQL
- Frontend: React, Vite
- Java: 21 target in build

## Project Structure

- `src/` - Spring Boot backend source
- `notes-frontend/` - React frontend

## Run Locally

### Backend

```bash
./mvnw spring-boot:run
```

Backend runs on `http://localhost:8080`.

### Frontend

```bash
cd notes-frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment Variables

Frontend API base URL:

- File: `notes-frontend/.env`
- Variable: `VITE_API_URL`
- Example: `VITE_API_URL=http://localhost:8080`

A template is provided in `notes-frontend/.env.example`.

## Build

### Backend

```bash
./mvnw clean package
```

### Frontend

```bash
cd notes-frontend
npm run build
```

## Deployment Notes

- Frontend can be deployed to Vercel.
- Set `VITE_API_URL` in Vercel environment variables to your deployed backend URL.
- Backend CORS is configured for localhost and `*.vercel.app`.
