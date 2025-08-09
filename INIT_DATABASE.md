# 🚨 WICHTIG: Datenbank initialisieren

Die Datenbank-Verbindung funktioniert, aber die Tabellen existieren noch nicht!

## Schnellste Lösung (Lokal):

1. **Gehe zu Vercel Dashboard:**
   - Settings → Environment Variables
   - Kopiere `POSTGRES_URL` und `POSTGRES_URL_NO_SSL`

2. **Erstelle `.env.local`:**
```bash
POSTGRES_URL="postgresql://[deine-url-von-vercel]"
POSTGRES_URL_NO_SSL="postgresql://[deine-url-no-ssl-von-vercel]"
```

3. **Führe aus:**
```bash
npx prisma db push
```

## Alternative: Direkt in Neon Console

1. **Gehe zu console.neon.tech**
2. **SQL Editor öffnen**
3. **Führe dieses SQL aus:**

```sql
-- Create BusinessCase table
CREATE TABLE "BusinessCase" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelYaml" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BusinessCase_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "BusinessCase_userId_idx" ON "BusinessCase"("userId");
CREATE INDEX "BusinessCase_createdAt_idx" ON "BusinessCase"("createdAt");
```

## Verifizierung

Nach der Initialisierung:
- Gehe zu https://summit-dubai-businesscase.vercel.app/api/init-db
- Du solltest `{"status":"success","message":"Database is already initialized"}` sehen

Dann funktioniert das Speichern!