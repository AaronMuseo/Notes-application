# Noted

## About me

I built this as a learning + portfolio project to practice full-stack development with Spring Boot and React.

## Local development

Prerequisites:

- Java 21+
- Node.js + npm

## How to run

1. Start backend (from project root):

```bash
./mvnw clean spring-boot:run
```

2. Start frontend (new terminal):

```bash
cd notes-frontend
npm install
npm run dev
```

3. Open app:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/notes

Frontend environment file (`notes-frontend/.env`):

```env
VITE_API_URL=http://localhost:8080
```

## Troubleshooting

- Port 8080 already in use:

```bash
./mvnw spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

- Stale build / JPA scanning issues:

```bash
./mvnw clean spring-boot:run
```

- Frontend cannot reach backend:
	- Make sure backend is running.
	- Make sure `VITE_API_URL` is correct in `notes-frontend/.env`.
