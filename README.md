# Chakyruu

B2B SaaS платформа цифровых приглашений. Монорепо: `/client` (Vite + React +
TypeScript) и `/server` (Node.js + Express + TypeScript + PostgreSQL/Prisma).

## Структура

```
/client   Vite + React + TS, react-router-dom, tailwindcss, axios
/server   Express + TS, Prisma (Postgres), JWT-аутентификация (bcrypt)
```

В production `/server` сам отдаёт собранный `/client/dist` (SPA fallback на
всё, что не начинается с `/api`).

## Локальная разработка

### Вариант 1: Docker Compose (рекомендуется — окружение как на сервере)

```bash
cp .env.example .env   # при необходимости отредактировать
docker compose up --build
```

Поднимутся Postgres и API, применятся миграции Prisma, API будет доступен на
`http://localhost:4000`, health-check — `http://localhost:4000/api/health`.

### Вариант 2: Node.js напрямую

Требуется Node.js 20+ и локальный/удалённый Postgres.

```bash
cp .env.example .env
npm install
npm run prisma:migrate:dev --workspace=server
npm run dev
```

`npm run dev` параллельно поднимает Vite dev-сервер (`client`, с прокси
`/api` → `http://localhost:4000`) и Express API (`server`).

## Переменные окружения

См. [.env.example](.env.example): `DATABASE_URL`, `JWT_SECRET`, `PORT`,
`POSTGRES_*` (для docker-compose), `VITE_API_URL` (для клиента).

## API

- `POST /api/auth/register` — регистрация (создаёт организацию + владельца)
- `POST /api/auth/login`
- `GET /api/auth/me` — защищён JWT
- `/api/events`, `/api/guests`, `/api/wishes` — защищены JWT, кроме
  `POST /api/wishes` (гость оставляет пожелание по своему `uniqueSlug`)
- `GET /api/health`

## Деплой на DigitalOcean Droplet

Деплой автоматический: пуш в `main` → GitHub Actions собирает проект и по SSH
обновляет и перезапускает приложение на droplet через pm2.

### 1. Подготовка Droplet (Ubuntu)

```bash
# Node.js 20, git, pm2, Postgres (нативно) или Docker — на выбор
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
sudo npm install -g pm2

# Postgres: либо нативно (apt install postgresql), либо через docker compose
# (сервис postgres из docker-compose.yml можно запускать отдельно от app)
```

Склонировать репозиторий на droplet и создать `.env` на основе
`.env.example` (боевые `DATABASE_URL`, `JWT_SECRET`).

Первый запуск вручную:

```bash
cd /path/to/chakyruu
npm ci
npm run build
npx prisma migrate deploy --schema=server/prisma/schema.prisma
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # чтобы pm2 поднимался после перезагрузки droplet
```

### 2. DNS

Привязать домен A-записью на публичный IP droplet.

### 3. GitHub Secrets

В настройках репозитория (`Settings → Secrets and variables → Actions`)
добавить:

- `DROPLET_HOST` — IP droplet
- `DROPLET_USER` — SSH-пользователь (например, `deploy`)
- `DROPLET_SSH_KEY` — приватный SSH-ключ этого пользователя
- `APP_DIR` — абсолютный путь до репозитория на droplet
  (например, `/home/deploy/chakyruu`)

### 4. Автодеплой

После этого каждый пуш в `main` ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
собирает проект, подключается по SSH, делает `git pull`, `npm ci`,
`npm run build`, `prisma migrate deploy` и перезапускает процесс в pm2.
