-- Créer le nouvel enum avec INACTIVE
CREATE TYPE "ListingStatus_new" AS ENUM ('ACTIVE', 'SOLD', 'INACTIVE');

-- Mettre à jour la colonne pour utiliser le nouvel enum (convertir ARCHIVED en INACTIVE)
ALTER TABLE "listings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "listings" ALTER COLUMN "status" TYPE "ListingStatus_new" USING 
  CASE 
    WHEN "status"::text = 'ACTIVE' THEN 'ACTIVE'::"ListingStatus_new"
    WHEN "status"::text = 'SOLD' THEN 'SOLD'::"ListingStatus_new"
    WHEN "status"::text = 'ARCHIVED' THEN 'INACTIVE'::"ListingStatus_new"
    ELSE 'ACTIVE'::"ListingStatus_new"
  END;
ALTER TABLE "listings" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'::"ListingStatus_new";

-- Supprimer l'ancien enum
DROP TYPE "ListingStatus";

-- Renommer le nouvel enum
ALTER TYPE "ListingStatus_new" RENAME TO "ListingStatus";
