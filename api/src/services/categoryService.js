import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Récupère toutes les catégories triées par nom
 * @returns {Promise<Array>} Liste des catégories
 */
export const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            listings: true
          }
        }
      }
    });

    return categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son ID
 * @param {number} id - L'ID de la catégorie
 * @returns {Promise<Object|null>} La catégorie ou null si non trouvée
 */
export const getCategoryById = async (id) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            listings: true
          }
        }
      }
    });

    return category;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
};

/**
 * Récupère une catégorie par son slug
 * @param {string} slug - Le slug de la catégorie
 * @returns {Promise<Object|null>} La catégorie ou null si non trouvée
 */
export const getCategoryBySlug = async (slug) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            listings: true
          }
        }
      }
    });

    return category;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    throw error;
  }
};