# MATCH Frontend

React Router SPA untuk auth, onboarding, catalog, dan rekomendasi match.

## Development

```bash
npm install
npm run dev
```

App tersedia di:

```txt
http://localhost:5173
```

## Environment

Buat `.env` lokal:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_REGISTER_ADMIN_USERNAME=admin
VITE_REGISTER_ADMIN_PASSWORD=admin123
```

## Build

```bash
npm run typecheck
npm run build
```

Output production ada di:

```txt
build/client
```

Project ini memakai React Router dalam SPA mode:

```ts
ssr: false
```

## Docker

```bash
docker build -t match-fe .
docker run -p 4173:4173 match-fe
```
