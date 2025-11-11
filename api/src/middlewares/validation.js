import { z } from 'zod';
import { ValidationError } from './errorHandler.js';

/**
 * Middleware de validation pour le body des requêtes
 * @param {z.ZodSchema} schema - Schéma Zod pour valider le body
 * @returns {Function} Middleware Express
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      // Valide et parse le body avec Zod
      const validatedData = schema.parse(req.body);
      req.body = validatedData; // Remplace le body par les données validées
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Récupère le premier message d'erreur de validation
        const firstError = error.errors && error.errors.length > 0 ? error.errors[0] : null;
        const message = firstError 
          ? `${firstError.path.join('.')} ${firstError.message}`.toLowerCase()
          : 'Erreur de validation';
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware de validation pour les query parameters
 * @param {z.ZodSchema} schema - Schéma Zod pour valider la query
 * @returns {Function} Middleware Express
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      // Valide et parse les query params avec Zod
      const validatedQuery = schema.parse(req.query);
      // Remplace les propriétés individuellement plutôt que l'objet entier
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, validatedQuery);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Récupère le premier message d'erreur de validation
        const firstError = error.errors && error.errors.length > 0 ? error.errors[0] : null;
        const message = firstError 
          ? `${firstError.path.join('.')} ${firstError.message}`.toLowerCase()
          : 'Erreur de validation';
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware de validation pour les paramètres d'URL
 * @param {z.ZodSchema} schema - Schéma Zod pour valider les params
 * @returns {Function} Middleware Express
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      // Valide et parse les params avec Zod
      const validatedParams = schema.parse(req.params);
      req.params = validatedParams; // Remplace les params par les données validées
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Récupère le premier message d'erreur de validation
        const firstError = error.errors && error.errors.length > 0 ? error.errors[0] : null;
        const message = firstError 
          ? `${firstError.path.join('.')} ${firstError.message}`.toLowerCase()
          : 'Erreur de validation';
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};