import { getAllListings, getListingById, createListing, updateListing, deleteListing, addFavorite, removeFavorite, getFavoritesByUser } from '../services/listingService.js';
import { NotFoundError, AuthorizationError, ConflictError } from '../middlewares/errorHandler.js';

/**
 * GET / - Récupérer toutes les annonces avec pagination et filtres
 */
export const getListings = async (req, res, next) => {
  try {
    const { q, categoryId, minPrice, maxPrice, page, pageSize } = req.query;

    const filters = {};
    if (q) filters.q = q;
    if (categoryId) filters.categoryId = categoryId;
    if (minPrice !== undefined) filters.minPrice = minPrice;
    if (maxPrice !== undefined) filters.maxPrice = maxPrice;

    const result = await getAllListings(filters, page, pageSize);

    res.status(200).json({
      message: 'Annonces récupérées avec succès',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

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
    next(error);
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
    next(error);
  }
};

/**
 * POST /:id/favorite - Ajouter aux favoris (utilisateur authentifié)
 */
export const addFavoriteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const favorite = await addFavorite(id, userId);
    if (favorite === null) {
      // déjà en favori - 409 Conflict est plus approprié
      throw new ConflictError('Cette annonce est déjà dans vos favoris');
    }

    res.status(201).json({ message: 'Ajouté aux favoris' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /:id/favorite - Retirer des favoris
 */
export const removeFavoriteHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const removed = await removeFavorite(id, userId);
    if (!removed) {
      throw new NotFoundError('Favori introuvable');
    }

    res.status(200).json({ message: 'Retiré des favoris' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /favorites - Récupère les favoris de l'utilisateur courant
 */
export const getFavoritesHandler = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const favorites = await getFavoritesByUser(userId);
    res.status(200).json({
      message: 'Favoris récupérés avec succès',
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};
