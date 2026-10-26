# Authentication Fundamentals Starter

## Setup

```bash
npm install
Copy-Item .env.example .env
npm run db:push
npm start
```

The SQLite datasource keeps local setup self-contained. Do not commit `.env` or `prisma/dev.db`.

## Endpoints

### `POST /auth/register`

Accepts non-empty `name`, `email`, and `password` strings. Email is trimmed and lowercased; the password is hashed with bcryptjs before storage. A successful registration returns `201` with only `id`, `name`, and `email`. A duplicate normalized email returns `409`.

### `POST /auth/login`

Accepts non-empty `email` and `password` strings. A successful login returns `200` with only `id`, `name`, and `email`. Unknown email and incorrect password both return `401` with:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

Malformed input returns `400`; unexpected server errors return a generic `500`. Prisma access is isolated in the user repository, and API responses use an explicit safe-field allowlist.
