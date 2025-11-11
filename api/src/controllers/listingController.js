import { getListingById, createListing, updateListing, deleteListing } from '../services/listingService.js';
import { NotFoundError, AuthorizationError } from '../middlewares/errorHandler.js';

/**
 * GET /:id - Récupérer une annonce par ID
 * Retourne l'annonce avec la catégorie et les infos du vendeur
 */
export const getListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await getListingById(id);

    if (!listing) {
      throw new NotFoundError('Annonce non trouvée');
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

/**
 * POST / - Créer une nouvelle annonce
 * Nécessite une authentification JWT
 */
export const createListingHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, price, location, categoryId } = req.body;

    const listing = await createListing({
      title,
      description,
      price,
      location,
      categoryId
    }, userId);

    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /:id - Modifier une annonce
 * Seul le propriétaire peut modifier son annonce
 */
export const updateListingHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const updatedListing = await updateListing(id, userId, updateData);

    if (updatedListing === null) {
      throw new NotFoundError('Annonce non trouvée');
    }

    res.status(200).json(updatedListing);
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      next(new AuthorizationError('Vous ne pouvez modifier que vos propres annonces'));
    } else {
      next(error);
    }
  }
};

/**
 * DELETE /:id - Supprimer une annonce
 * Seul le propriétaire peut supprimer son annonce
 */
export const deleteListingHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await deleteListing(id, userId);

    if (!deleted) {
      throw new NotFoundError('Annonce non trouvée');
    }

    res.status(200).json({ 
      message: 'Annonce supprimée avec succès' 
    });
  } catch (error) {
    if (error.message === 'FORBIDDEN') {
      next(new AuthorizationError('Vous ne pouvez supprimer que vos propres annonces'));
    } else {
      next(error);
    }
  }
};
