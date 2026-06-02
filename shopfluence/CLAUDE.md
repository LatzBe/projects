# Shopfluence

Angular 17 + NestJS influencer shopping app with PostgreSQL (Prisma) and Redis.

## Stack
- **Frontend**: Angular 17 (standalone components, Angular Material), runs on port 4200
- **Backend**: NestJS 10, Prisma ORM, JWT auth, runs on port 3000
- **DB/Cache**: PostgreSQL 16 + Redis 7 (via Docker Compose)

## Quick start

```bash
# 1. Start infrastructure
docker compose up -d

# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed        # creates demo user + 8 influencers + products
npm run start:dev   # http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
npm install
npm start           # http://localhost:4200
```

## Demo credentials
- Email: `demo@shopfluence.com`
- Password: `demo123`

## Environment variables (backend)
| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://shopfluence:shopfluence@localhost:5432/shopfluence` | Postgres connection string |
| `JWT_SECRET` | `secret` | JWT signing secret (change in production!) |
| `PORT` | `3000` | Backend port |
