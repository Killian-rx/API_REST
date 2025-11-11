import pkg from '@prisma/client';
import { NotFoundError, AuthorizationError } from '../middlewares/errorHandler.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Récupère toutes les annonces avec pagination et filtres
 * @param {Object} filters - Les filtres (q, categoryId, minPrice, maxPrice)
 * @param {number} page - Le numéro de page
 * @param {number} pageSize - Le nombre d'éléments par page
 * @returns {Promise<Object>} Les annonces avec métadonnées de pagination
 */
export const getAllListings = async (filters = {}, page = 1, pageSize = 10) => {
  try {
    // S'assurer que page et pageSize sont des nombres
    const pageNum = parseInt(page, 10) || 1;
    const pageSizeNum = parseInt(pageSize, 10) || 10;

    // Construction des conditions de filtrage
    const where = {
      status: 'ACTIVE' // Ne récupérer que les annonces actives
    };

    // Filtre de recherche textuelle
    if (filters.q) {
      where.OR = [
        { title: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    // Filtre par catégorie
    if (filters.categoryId) {
      where.categoryId = parseInt(filters.categoryId);
    }

    // Filtres par prix
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = parseFloat(filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = parseFloat(filters.maxPrice);
      }
    }

    // Calcul de l'offset pour la pagination
    const skip = (pageNum - 1) * pageSizeNum;

    // Récupération des annonces avec comptage
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        skip,
        take: pageSizeNum,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.listing.count({ where })
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(total / pageSizeNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return {
      data: listings,
      meta: {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    throw error;
  }
};

/**
 * Récupère une annonce par son ID avec ses relations
 * @param {number} id - L'ID de l'annonce
 * @returns {Promise<Object|null>} L'annonce avec catégorie et infos vendeur ou null
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
        category: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        }
      }
    });

    return listing;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'annonce:', error);
    throw error;
  }
};

/**
 * Crée une nouvelle annonce
 * @param {Object} data - Les données de l'annonce
 * @param {number} userId - L'ID de l'utilisateur propriétaire
 * @returns {Promise<Object>} L'annonce créée avec ses relations
 */
export const createListing = async (data, userId) => {
  try {
    const listing = await prisma.listing.create({
      data: {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        location: data.location,
        categoryId: parseInt(data.categoryId),
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
        category: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return listing;
  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    throw error;
  }
};

/**
 * Met à jour une annonce (vérifie que l'utilisateur est le propriétaire)
 * @param {number} id - L'ID de l'annonce
 * @param {number} userId - L'ID de l'utilisateur
 * @param {Object} data - Les nouvelles données
 * @returns {Promise<Object|null>} L'annonce mise à jour ou null
 */
export const updateListing = async (id, userId, data) => {
  try {
    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const existingListing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, userId: true }
    });

    if (!existingListing) {
      return null; // Annonce non trouvée
    }

    if (existingListing.userId !== parseInt(userId)) {
      throw new Error('FORBIDDEN'); // L'utilisateur n'est pas le propriétaire
    }

    // Préparer les données à mettre à jour
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.categoryId !== undefined) updateData.categoryId = parseInt(data.categoryId);
    if (data.status !== undefined) updateData.status = data.status;

    const updatedListing = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return updatedListing;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'annonce:', error);
    throw error;
  }
};

/**
 * Supprime une annonce (vérifie que l'utilisateur est le propriétaire)
 * @param {number} id - L'ID de l'annonce
 * @param {number} userId - L'ID de l'utilisateur
 * @returns {Promise<boolean>} true si supprimée, false si non trouvée, erreur si pas propriétaire
 */
export const deleteListing = async (id, userId) => {
  try {
    // Vérifier que l'annonce existe et appartient à l'utilisateur
    const existingListing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, userId: true }
    });

    if (!existingListing) {
      return false; // Annonce non trouvée
    }

    if (existingListing.userId !== parseInt(userId)) {
      throw new Error('FORBIDDEN'); // L'utilisateur n'est pas le propriétaire
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) }
    });

    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'annonce:', error);
    throw error;
  }
};