import * as categoryService from '../services/categoryService.js';
import { NotFoundError, ValidationError } from '../middlewares/errorHandler.js';

/**
 * GET /categories
 * Récupère toutes les catégories
 */
export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      message: 'Catégories récupérées avec succès',
      data: categories,
      count: categories.length
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /categories/:id
 * Récupère une catégorie par son ID
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validation de l'ID
    if (!id || isNaN(parseInt(id))) {
      throw new ValidationError('ID de catégorie invalide');
    }

    const category = await categoryService.getCategoryById(id);

    if (!category) {
      throw new NotFoundError('Catégorie non trouvée');
    }

    res.status(200).json({
      message: 'Catégorie récupérée avec succès',
      data: category
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /categories/slug/:slug
 * Récupère une catégorie par son slug
 */
export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    // Validation du slug
    if (!slug || slug.trim() === '') {
      throw new ValidationError('Slug de catégorie invalide');
    }

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
      throw new NotFoundError('Catégorie non trouvée');
    }

    res.status(200).json({
      message: 'Catégorie récupérée avec succès',
      data: category
    });

  } catch (error) {
    next(error);
  }
};