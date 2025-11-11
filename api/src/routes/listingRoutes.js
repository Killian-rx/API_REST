import express from 'express';
import { getListing, createListingHandler, updateListingHandler, deleteListingHandler } from '../controllers/listingController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateBody, validateParams } from '../middlewares/validation.js';
import { createListingSchema, updateListingSchema, idParamSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Listings
 *   description: Gestion des annonces
 */

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Récupère la liste des annonces avec filtres et pagination
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans le titre et la description
 *         example: "iPhone"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: ID de la catégorie
 *         example: 3
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Prix minimum
 *         example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Prix maximum
 *         example: 500
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'éléments par page
 *         example: 10
 *     responses:
 *       200:
 *         description: Annonces récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonces récupérées avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Listing'
 *                       - type: object
 *                         properties:
 *                           user:
 *                             type: object
 *                             properties:
 *                               id: { type: "integer" }
 *                               name: { type: "string" }
 *                           category:
 *                             $ref: '#/components/schemas/Category'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: Page actuelle
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       description: Taille de la page
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       description: Nombre total d'éléments
 *                       example: 123
 *                     totalPages:
 *                       type: integer
 *                       description: Nombre total de pages
 *                       example: 13
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Y a-t-il une page suivante
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       description: Y a-t-il une page précédente
 *                       example: false
 *       400:
 *         description: Paramètres invalides
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
// Route publique pour récupérer une annonce
router.get('/:id', validateParams(idParamSchema), getListing);

// Routes protégées (authentification requise)
router.post('/', authMiddleware, validateBody(createListingSchema), createListingHandler);
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(updateListingSchema), updateListingHandler);
router.delete('/:id', authMiddleware, validateParams(idParamSchema), deleteListingHandler);

export default router;