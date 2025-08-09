# Database Setup for FELS Dashboard

## Vercel Postgres Setup

1. **Create Vercel Postgres Database**
   - Go to your Vercel dashboard
   - Navigate to the Storage tab
   - Click "Create Database" → Select "Postgres"
   - Choose a region close to your deployment
   - Name your database (e.g., "fels-dashboard-db")

2. **Connect Database to Project**
   - In Vercel dashboard, go to your project
   - Navigate to Settings → Environment Variables
   - The Postgres integration will automatically add:
     - `DATABASE_URL`: Connection string for Prisma
     - `DIRECT_URL`: Direct connection for migrations

3. **Local Development Setup**
   - Copy `.env.example` to `.env.local`
   - Add the database URLs from Vercel dashboard:
     ```bash
     DATABASE_URL="your-pooled-connection-url"
     DIRECT_URL="your-direct-connection-url"
     ```

4. **Initialize Database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Or use migrations (production)
   npx prisma migrate dev --name init
   ```

5. **Verify Setup**
   ```bash
   # Open Prisma Studio to view data
   npx prisma studio
   ```

## Database Schema

The application uses a single `BusinessCase` table to store:
- Business case configurations (YAML models)
- Metadata (name, description, timestamps)
- Future user associations

## Deployment

When deploying to Vercel:
1. The database URLs are automatically available
2. Add build command to generate Prisma client:
   ```json
   "build": "prisma generate && next build"
   ```
3. Vercel will handle the database connection pooling

## Troubleshooting

- **Connection Issues**: Ensure your IP is whitelisted in Vercel Postgres settings
- **Migration Errors**: Use `DIRECT_URL` for migrations, not the pooled connection
- **Client Generation**: Run `npx prisma generate` after schema changes