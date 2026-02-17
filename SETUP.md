# Motion Booster — Project Setup Guide

## Prerequisites

- **Node.js** v18+ (recommended: v20+)
- **npm** (comes with Node.js)
- **Git**
- **Ubuntu/Debian** (commands below are for apt-based systems)

---

## 1. Clone the Project

```bash
git clone https://github.com/0xzahed/motion-booster.git
cd motion-booster
```

---

## 2. Install Node Dependencies

```bash
npm install
```

---

## 3. Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
```

Start and enable the service:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 4. Create Database & Set Password

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_password_here';"
sudo -u postgres psql -c "CREATE DATABASE motionbooster;"
```

> Replace `your_password_here` with a password of your choice. You'll use this in the `.env` file.

---

## 5. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Or create it manually:

```env
# Database
DATABASE_URL="postgresql://postgres:your_password_here@localhost:5432/motionbooster?schema=public"

# JWT Secrets (generate your own)
JWT_ACCESS_SECRET="run-openssl-rand-base64-32"
JWT_REFRESH_SECRET="run-openssl-rand-base64-32"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

To generate secure JWT secrets:

```bash
openssl rand -base64 32
```

Run this twice — once for each secret.

---

## 6. Generate Prisma Client

```bash
npx prisma generate
```

---

## 7. Run Database Migration

```bash
npx prisma migrate dev
```

This creates all the tables in your database.

---

## 8. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## After Changing Prisma Schema

Whenever you edit `prisma/schema.prisma`:

```bash
# 1. Create and apply the migration
npx prisma migrate dev --name describe_your_change

# 2. Prisma client is auto-regenerated after migrate
#    But if you need to regenerate manually:
npx prisma generate
```

**Examples:**

```bash
npx prisma migrate dev --name add_projects_table
npx prisma migrate dev --name add_avatar_to_user
```

---

## Useful Prisma Commands

| Command | What it does |
|---|---|
| `npx prisma studio` | Opens visual database browser at localhost:5555 |
| `npx prisma migrate dev` | Creates & applies new migration |
| `npx prisma migrate reset` | Drops DB, re-applies all migrations (⚠️ deletes data) |
| `npx prisma generate` | Regenerates the Prisma client |
| `npx prisma db push` | Push schema changes without creating migration files |

---

## Troubleshooting

**PostgreSQL connection refused:**
```bash
sudo systemctl status postgresql   # check if running
sudo systemctl start postgresql    # start it
```

**Authentication failed:**
- Double-check the password in `.env` matches what you set in step 4.
- Make sure the database `motionbooster` exists:
  ```bash
  sudo -u postgres psql -c "\l"
  ```

**Module not found after pulling new changes:**
```bash
npm install
npx prisma generate
npx prisma migrate dev
```
