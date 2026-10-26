# LU48 — Session Authentication

## Setup

```bash
npm install
```

Copy `.env.example` to `.env`, then replace `COOKIE_SECRET` with a random secret
(for example, generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
Keep `.env` out of version control. Use `COOKIE_SECURE=false` for local HTTP;
production always enables `Secure` and must be served over HTTPS.

```bash
npm run setup
npm run dev
```

Seeded demo account: `sam@example.com` / `SessionDemo!48`.

## API verification

Use Postman or curl's cookie jar to preserve the signed cookie:

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d "{\"email\":\"sam@example.com\",\"password\":\"SessionDemo!48\"}" \
  http://localhost:3000/auth/login
curl -i -b cookies.txt http://localhost:3000/auth/me
curl -i -b cookies.txt -c cookies.txt -X POST http://localhost:3000/auth/logout
curl -i -b cookies.txt http://localhost:3000/auth/me
```

The final request should return `401 AUTH_REQUIRED`. Login sets an `HttpOnly`,
`SameSite=Lax` signed `sid` cookie; `Secure` is enabled in production or when
`COOKIE_SECURE=true`. Invalid credentials use the same generic response whether
the email is unknown or the password is incorrect.

## Session storage

The in-memory session store is for learning and local execution only. It loses
all sessions on restart and is not shared across server processes. Production
requires a shared expiring store such as Redis, while preserving the same
create/resolve/destroy contract.

Use Postman cookie jar or curl `-c cookies.txt` and `-b cookies.txt` to preserve the cookie between requests.
