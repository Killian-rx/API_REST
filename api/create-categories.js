import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const categories = [
  { name: 'Immobilier', slug: 'immobilier' },
  { name: 'Véhicules', slug: 'vehicules' },
  { name: 'Multimédia', slug: 'multimedia' },
  { name: 'Maison & Jardin', slug: 'maison-jardin' },
  { name: 'Emploi & Services', slug: 'emploi-services' },
  { name: 'Mode', slug: 'mode' },
  { name: 'Loisirs', slug: 'loisirs' }
];

async function createCategories() {
  console.log('Création des catégories...');

  try {
    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (!existingCategory) {
        await prisma.category.create({
          data: category,
        });
        console.log(`✅ Catégorie créée : ${category.name}`);
      } else {
        console.log(`ℹ️  Catégorie déjà existante : ${category.name}`);
      }
    }

    console.log('✅ Toutes les catégories ont été créées !');
    
    // Afficher toutes les catégories
    const allCategories = await prisma.category.findMany();
    console.log('\n📋 Catégories disponibles :');
    allCategories.forEach(cat => {
      console.log(`  - ${cat.id}: ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCategories();