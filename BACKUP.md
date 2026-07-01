# Sauvegarde & Restauration de la base (siyaqi)

## Ce qui est en place

Une sauvegarde **automatique quotidienne** de la base Neon vers **Cloudflare R2**.

- **Quand** : chaque jour à 02:17 UTC (~03:17 Casablanca) — workflow `.github/workflows/db-backup.yml`
- **Quoi** : `pg_dump` complet (format custom compressé) de la base Neon
- **Où** : bucket R2 `siyaqi-db`, dossier `daily/`, fichiers `siyaqi-db-<horodatage>.dump`
- **Rétention** : 30 jours (les plus vieilles sont purgées automatiquement)
- **Lancement manuel** : onglet *Actions* du repo → *Daily DB Backup to R2* → *Run workflow*

### Secrets GitHub utilisés (repo → Settings → Secrets → Actions)
`DATABASE_URL`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

---

## Restauration (si la base Neon est perdue)

> Nécessite le client PostgreSQL **18** (`pg_restore`) et les identifiants R2.

**1. Créer une nouvelle base** (nouveau projet Neon ou tout Postgres 18) et récupérer sa
   chaîne de connexion → on l'appelle `NEW_DATABASE_URL`.

**2. Télécharger la dernière sauvegarde** depuis R2 :
   - soit via le dashboard Cloudflare : R2 → `siyaqi-db` → `daily/` → télécharger le `.dump` le plus récent
   - soit en ligne de commande (avec les clés R2) :
     ```bash
     export AWS_ACCESS_KEY_ID=<R2_ACCESS_KEY_ID>
     export AWS_SECRET_ACCESS_KEY=<R2_SECRET_ACCESS_KEY>
     aws s3 cp s3://siyaqi-db/daily/ . --recursive \
       --endpoint-url https://4d60cee7201f3b31ad98cf47d8ac7922.r2.cloudflarestorage.com
     ```

**3. Restaurer dans la nouvelle base** :
   ```bash
   pg_restore --no-owner --no-privileges --clean --if-exists \
     -d "$NEW_DATABASE_URL" siyaqi-db-<horodatage>.dump
   ```

**4. Rebrancher l'app** : mettre à jour `DATABASE_URL` dans Vercel (Production) avec
   `NEW_DATABASE_URL`, puis redéployer.

Le dump étant du PostgreSQL standard, il se restaure dans **n'importe quel** Postgres
(nouveau Neon, Supabase, serveur perso…). Aucune dépendance à un fournisseur.
