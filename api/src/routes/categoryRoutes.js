import express from 'express';
import { getCategories, getCategoryById, getCategoryBySlug } from '../controllers/categoryController.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestion des catégories d'annonces
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Récupère toutes les catégories
 *     tags: [Categories]
 *     description: Retourne la liste de toutes les catégories triées par nom avec le nombre d'annonces par catégorie
 *     responses:
 *       200:
 *         description: Liste des catégories récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Catégories récupérées avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *                 count:
 *                   type: integer
 *                   description: Nombre total de catégories
 *                   example: 5
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getCategories);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID numérique de la catégorie
 *         example: 1
 *     responses:
 *       200:
 *         description: Catégorie récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Catégorie récupérée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: ID de catégorie invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Catégorie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', getCategoryById);

/**
 * @swagger
 * /categories/slug/{slug}:
 *   get:
 *     summary: Récupère une catégorie par son slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug URL-friendly de la catégorie
 *         example: "immobilier"
 *     responses:
 *       200:
 *         description: Catégorie récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Catégorie récupérée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Slug de catégorie invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Catégorie non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', getCategoryBySlug);

export default router;