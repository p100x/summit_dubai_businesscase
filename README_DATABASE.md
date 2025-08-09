# Database Setup - Neon Postgres

## Setup mit Neon über Vercel Marketplace

### 1. Neon Integration hinzufügen

1. **In Vercel Dashboard:**
   - Gehe zu deinem Projekt
   - Storage → Browse Marketplace
   - Wähle **Neon** (Serverless Postgres)
   - Klicke "Add Integration"

2. **Neon Account erstellen:**
   - Falls noch keinen Account: Registriere dich bei Neon
   - Verbinde Neon mit Vercel
   - Erstelle ein neues Projekt in Neon

3. **Database erstellen:**
   - Name: `fels-dashboard` (oder ähnlich)
   - Region: Wähle eine Region nahe deinem Vercel Deployment
   - Der Free Tier reicht völlig aus

### 2. Environment Variables

Neon fügt automatisch diese Variables zu deinem Vercel Projekt hinzu:
- `DATABASE_URL` - Pooled connection für Anwendung
- `DATABASE_URL_UNPOOLED` - Direct connection für Migrationen

### 3. Lokale Entwicklung

1. **Environment Variables kopieren:**
   - Gehe zu Vercel Dashboard → Settings → Environment Variables
   - Kopiere beide DATABASE URLs
   - Erstelle `.env.local`:
   ```bash
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://user:pass@host/dbname?sslmode=require"
   ```

2. **Datenbank initialisieren:**
   ```bash
   # Prisma Client generieren
   npx prisma generate
   
   # Schema zur Datenbank pushen
   npx prisma db push
   ```

3. **Testen:**
   ```bash
   # Prisma Studio öffnen
   npx prisma studio
   
   # Development Server starten
   npm run dev
   ```

### 4. Deployment

1. **Build Command ist bereits konfiguriert:**
   ```json
   "build": "prisma generate && next build"
   ```

2. **Deploy zu Vercel:**
   ```bash
   git add .
   git commit -m "Add database persistence with Neon"
   git push
   ```

3. **Nach dem Deploy:**
   - Vercel führt automatisch `prisma generate` aus
   - Die Datenbank-Verbindung wird automatisch hergestellt

### 5. Datenbank-Management

**Prisma Studio (lokal):**
```bash
npm run db:studio
```

**Neon Dashboard:**
- Gehe zu console.neon.tech
- SQL Editor für direkte Queries
- Branching für Test-Umgebungen

### Troubleshooting

**Connection Issues:**
- Stelle sicher, dass SSL aktiviert ist (`?sslmode=require`)
- Überprüfe die Environment Variables in Vercel

**Migration Errors:**
- Nutze `DATABASE_URL_UNPOOLED` für Migrationen
- Bei Problemen: `npx prisma db push --force-reset` (ACHTUNG: Löscht alle Daten!)

**Cold Starts:**
- Neon hat minimal Cold Starts (< 500ms)
- Connection Pooling ist automatisch aktiviert

### Kosten

Der **Neon Free Tier** beinhaltet:
- 0.5 GB Storage
- Unbegrenzte Branches
- Auto-suspend nach 5 Minuten Inaktivität
- Perfekt für dein Business Case Dashboard