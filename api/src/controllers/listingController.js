import * as listingService from '../services/listingService.js';

/**
 * GET /listings
 * Récupère la liste des annonces avec filtres et pagination
 */
export const getListings = async (req, res) => {
  try {
    const {
      q,
      categoryId,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 10
    } = req.query;

    // Validation et conversion des paramètres
    const filters = {};
    
    // Recherche textuelle
    if (q && q.trim()) {
      filters.q = q.trim();
    }

    // Catégorie
    if (categoryId) {
      const parsedCategoryId = parseInt(categoryId);
      if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
          error: 'categoryId doit être un entier positif'
        });
      }
      filters.categoryId = parsedCategoryId;
    }

    // Prix minimum
    if (minPrice !== undefined) {
      const parsedMinPrice = parseFloat(minPrice);
      if (isNaN(parsedMinPrice) || parsedMinPrice < 0) {
        return res.status(400).json({
          error: 'minPrice doit être un nombre positif ou zéro'
        });
      }
      filters.minPrice = parsedMinPrice;
    }

    // Prix maximum
    if (maxPrice !== undefined) {
      const parsedMaxPrice = parseFloat(maxPrice);
      if (isNaN(parsedMaxPrice) || parsedMaxPrice < 0) {
        return res.status(400).json({
          error: 'maxPrice doit être un nombre positif ou zéro'
        });
      }
      filters.maxPrice = parsedMaxPrice;
    }

    // Validation que minPrice <= maxPrice si les deux sont fournis
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      if (filters.minPrice > filters.maxPrice) {
        return res.status(400).json({
          error: 'minPrice doit être inférieur ou égal à maxPrice'
        });
      }
    }

    // Page
    const parsedPage = parseInt(page);
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return res.status(400).json({
        error: 'page doit être un entier positif'
      });
    }
    filters.page = parsedPage;

    // Taille de page
    const parsedPageSize = parseInt(pageSize);
    if (isNaN(parsedPageSize) || parsedPageSize <= 0 || parsedPageSize > 100) {
      return res.status(400).json({
        error: 'pageSize doit être un entier entre 1 et 100'
      });
    }
    filters.pageSize = parsedPageSize;

    // Appel du service
    const result = await listingService.listListings(filters);

    res.status(200).json({
      message: 'Annonces récupérées avec succès',
      ...result
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des annonces:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des annonces'
    });
  }
};

/**
 * GET /listings/:id
 * Récupère une annonce par son ID
 */
export const getListingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'ID d\'annonce invalide'
      });
    }

    const listing = await listingService.getListingById(id);

    if (!listing) {
      return res.status(404).json({
        error: 'Annonce non trouvée'
      });
    }

    // Vérifier que l'annonce est active (sauf pour le propriétaire)
    if (listing.status !== 'ACTIVE') {
      // Si ce n'est pas le propriétaire, on ne montre pas l'annonce inactive
      if (!req.userId || req.userId !== listing.user.id) {
        return res.status(404).json({
          error: 'Annonce non trouvée'
        });
      }
    }

    res.status(200).json({
      message: 'Annonce récupérée avec succès',
      data: listing
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'annonce:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de l\'annonce'
    });
  }
};

/**
 * POST /listings
 * Créer une nouvelle annonce (route protégée)
 */
export const createListing = async (req, res) => {
  try {
    const { title, description, price, location, categoryId } = req.body;
    const userId = req.userId; // Fourni par le middleware d'auth

    // Validation des champs requis
    if (!title || !description || !price || !location || !categoryId) {
      return res.status(400).json({
        error: 'Tous les champs sont requis: title, description, price, location, categoryId'
      });
    }

    // Validation du prix
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: 'Le prix doit être un nombre positif ou zéro'
      });
    }

    // Validation de la catégorie
    const parsedCategoryId = parseInt(categoryId);
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({
        error: 'categoryId doit être un entier positif'
      });
    }

    // Validation des longueurs
    if (title.length < 3 || title.length > 100) {
      return res.status(400).json({
        error: 'Le titre doit contenir entre 3 et 100 caractères'
      });
    }

    if (description.length < 10 || description.length > 2000) {
      return res.status(400).json({
        error: 'La description doit contenir entre 10 et 2000 caractères'
      });
    }

    const listingData = {
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      location: location.trim(),
      categoryId: parsedCategoryId
    };

    const listing = await listingService.createListing(listingData, userId);

    res.status(201).json({
      message: 'Annonce créée avec succès',
      data: listing
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'annonce:', error);
    
    // Gestion des erreurs Prisma spécifiques
    if (error.code === 'P2003') {
      return res.status(400).json({
        error: 'Catégorie inexistante'
      });
    }

    res.status(500).json({
      error: 'Erreur serveur lors de la création de l\'annonce'
    });
  }
};