# Noted - Full-Stack Notes Application

A clean, portfolio-ready notes app with a Spring Boot REST API and a React + Vite frontend.

The app focuses on simplicity: create notes, list notes, and delete notes through a lightweight API.

## Demo Highlights

- Full-stack architecture (Java backend + React frontend)
- RESTful endpoints for note management
- Responsive UI with search, sorting, and API status indicator
- Vercel-friendly frontend configuration using environment variables
- CORS configured for localhost and Vercel domains

## Tech Stack

### Backend

- Java 21 (project target)
- Spring Boot 4.1.0
- Spring Data JPA
- Hibernate ORM
- H2 (in-memory, default)
- PostgreSQL driver included for production use

### Frontend

- React 19
- Vite 8
- ESLint

## Project Structure

```text
.
|- src/
|  |- main/
|  |  |- java/com/example/Notes/
|  |  |  |- application/        # Spring Boot app + Note entity
|  |  |  |- controller/         # REST controller
|  |  |  |- repository/         # JPA repository
|  |  |  \- service/            # Business logic
|  |  \- resources/
|  |     \- application.properties
|  \- test/
|     \- java/com/example/Notes/application/
|- notes-frontend/              # React app (Vite)
|- pom.xml
\- README.md
```

## Architecture Overview

1. Frontend sends requests to `VITE_API_URL/api/notes`.
2. `NoteController` exposes REST endpoints.
3. `NoteService` applies business logic (for example, fallback title).
4. `NoteRepository` persists `Note` entities via JPA.

## Features

- Create a note with title and content
- Auto-fallback title to `Untitled Note` when title is empty
- List all notes
- Delete note by id
- Search and sort notes in the UI
- API online/offline status indicator

## REST API

Base URL (local): `http://localhost:8080`

### Get all notes

```http
GET /api/notes
```

Response example:

```json
[
	{
		"id": 1,
		"title": "Shopping",
		"content": "Milk, eggs, bread"
	}
]
```

### Create note

```http
POST /api/notes
Content-Type: application/json
```

Request example:

```json
{
	"title": "Plan",
	"content": "Finish portfolio updates"
}
```

### Delete note

```http
DELETE /api/notes/{id}
```

## Local Development

## Prerequisites

- Java 21+ installed
- Node.js 20+ and npm

## 1) Run backend

From project root:

```bash
./mvnw clean spring-boot:run
```

Backend runs at `http://localhost:8080`.

## 2) Run frontend

In a second terminal:

```bash
cd notes-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

Frontend reads API URL from `notes-frontend/.env`.

Example:

```env
VITE_API_URL=http://localhost:8080
```

Template file: `notes-frontend/.env.example`

## Build and Test

### Backend

```bash
./mvnw clean package
```

### Frontend

```bash
cd notes-frontend
npm run build
```

## Deployment

### Frontend on Vercel

1. Import `notes-frontend` into Vercel.
2. Set environment variable:
	 - `VITE_API_URL=https://your-backend-domain`
3. Deploy.

### Backend deployment notes

- Deploy backend separately (any Java/Spring-compatible host).
- Ensure CORS allows your frontend domain.
- Replace H2 with PostgreSQL for persistent production data.

## Troubleshooting

### Port 8080 already in use

Stop the process using port 8080, or run on another port:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### JPA repository/entity scanning issues

If you see repository/entity startup errors after package refactors, do a clean build to remove stale classes:

```bash
./mvnw clean spring-boot:run
```

### Frontend cannot reach backend

- Confirm backend is running.
- Confirm `VITE_API_URL` points to the backend origin.
- Confirm browser requests target `/api/notes`.

## Future Improvements

- Add update endpoint (`PUT /api/notes/{id}`)
- Add validation and structured error responses
- Add integration tests for API endpoints
- Add authentication for private notes

## License

This project is currently for learning and portfolio use.
