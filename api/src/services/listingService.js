import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Liste les annonces avec filtres et pagination façon Leboncoin
 * @param {Object} filters - Les filtres à appliquer
 * @param {string} filters.q - Recherche texte dans title + description
 * @param {number} filters.categoryId - ID de la catégorie
 * @param {number} filters.minPrice - Prix minimum
 * @param {number} filters.maxPrice - Prix maximum  
 * @param {number} filters.page - Numéro de page (défaut: 1)
 * @param {number} filters.pageSize - Taille de page (défaut: 10)
 * @returns {Promise<Object>} Résultats paginés avec métadonnées
 */
export const listListings = async (filters = {}) => {
  try {
    const {
      q,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 10
    } = filters;

    // Construction du where clause dynamique
    const where = {
      status: 'ACTIVE' // On ne montre que les annonces actives
    };

    // Recherche textuelle dans title et description
    if (q && q.trim()) {
      where.OR = [
        {
          title: {
            contains: q.trim(),
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: q.trim(),
            mode: 'insensitive'
          }
        }
      ];
    }

    // Filtre par catégorie
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    // Filtre par prix
    if (minPrice !== undefined && minPrice !== null) {
      where.price = { ...where.price, gte: parseFloat(minPrice) };
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      where.price = { ...where.price, lte: parseFloat(maxPrice) };
    }

    // Calcul de pagination
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    // Requête pour récupérer les listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc' // Tri par date de création décroissante
        },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      // Compter le total d'éléments pour la pagination
      prisma.listing.count({ where })
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      data: listings,
      meta: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    };

  } catch (error) {
    console.error('Erreur lors de la récupération des listings:', error);
    throw error;
  }
};

/**
 * Récupère un listing par son ID
 * @param {number} id - L'ID du listing
 * @returns {Promise<Object|null>} Le listing ou null si non trouvé
 */
export const getListingById = async (id) => {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return listing;
  } catch (error) {
    console.error('Erreur lors de la récupération du listing:', error);
    throw error;
  }
};

/**
 * Créer un nouveau listing
 * @param {Object} listingData - Les données du listing
 * @param {number} userId - L'ID de l'utilisateur propriétaire
 * @returns {Promise<Object>} Le listing créé
 */
export const createListing = async (listingData, userId) => {
  try {
    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        price: parseFloat(listingData.price),
        categoryId: parseInt(listingData.categoryId),
        userId: parseInt(userId)
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    return listing;
  } catch (error) {
    console.error('Erreur lors de la création du listing:', error);
    throw error;
  }
};