# WARDROBE Frontend

React Router SPA untuk auth, onboarding, catalog, dan rekomendasi wardrobe.

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
docker build -t wardrobe-fe .
docker run -p 4173:4173 wardrobe-fe
```
