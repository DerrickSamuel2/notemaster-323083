# NoteMaster (Fullstack Notes)

A minimal fullstack notes application:

- **Frontend**: React (port 3000)
- **Backend**: FastAPI (port 3001)
- **Database**: PostgreSQL (container port 5001; DB itself currently configured on 5000 in `notes_database/startup.sh`)

## Setup

### 1) Database schema
Start the database container, then initialize schema using `notes_database/schema.md` (run statements one at a time).

### 2) Backend
Set env vars (see `notemaster-323085/notes_backend/.env.example`), then run the backend on port 3001.

Required:
- `POSTGRES_URL`
- `JWT_SECRET`

### 3) Frontend
Optionally set:
- `REACT_APP_API_BASE_URL` (default `http://localhost:3001`)

Run the frontend on port 3000.
