import dotenv from 'dotenv';
import pkg from '@prisma/client';

// Charger les variables d'environnement
dotenv.config();

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const categories = [
  { name: 'Immobilier', slug: 'immobilier' },
  { name: 'Véhicules', slug: 'vehicules' },
  { name: 'Multimédia', slug: 'multimedia' },
  { name: 'Maison', slug: 'maison' },
  { name: 'Emploi', slug: 'emploi' },
];

async function main() {
  console.log('Début du seed...');

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existingCategory) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Catégorie créée : ${category.name}`);
    } else {
      console.log(`Catégorie déjà existante : ${category.name}`);
    }
  }

  console.log('Seed terminé !');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

