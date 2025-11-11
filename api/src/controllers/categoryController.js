import * as categoryService from '../services/categoryService.js';

/**
 * GET /categories
 * Récupère toutes les catégories
 */
export const getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      message: 'Catégories récupérées avec succès',
      data: categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération des catégories'
    });
  }
};

/**
 * GET /categories/:id
 * Récupère une catégorie par son ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        error: 'ID de catégorie invalide'
      });
    }

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      return res.status(404).json({
        error: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      message: 'Catégorie récupérée avec succès',
      data: category
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de la catégorie'
    });
  }
};

/**
 * GET /categories/slug/:slug
 * Récupère une catégorie par son slug
 */
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Validation du slug
    if (!slug || slug.trim() === '') {
      return res.status(400).json({
        error: 'Slug de catégorie invalide'
      });
    }

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({
        error: 'Catégorie non trouvée'
      });
    }

    res.status(200).json({
      message: 'Catégorie récupérée avec succès',
      data: category
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération de la catégorie'
    });
  }
};