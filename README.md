## Local Development

Spin up a postgres instance with Docker

```bash
# Start the database in detached mode
docker compose up -d

# Veiw logs
docker compose logs

# Stop the database (data persists in the volume)
docker compose down

# Stop the database and delete the volume/data
docker compose down -v
```

Run migrations

```bash
pnpm run db:migrate
```

Run the server

```bash
pnpm run dev
```
