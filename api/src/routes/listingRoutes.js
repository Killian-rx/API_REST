import express from 'express';
import { getListings, getListing, createListingHandler, updateListingHandler, deleteListingHandler, addFavoriteHandler, removeFavoriteHandler, getFavoritesHandler } from '../controllers/listingController.js';
import { authMiddleware } from '../middlewares/auth.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validation.js';
import { createListingSchema, updateListingSchema, idParamSchema, getListingsQuerySchema } from '../schemas/validationSchemas.js';

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
// Route publique pour récupérer toutes les annonces avec filtres et pagination
router.get('/', validateQuery(getListingsQuerySchema), getListings);

// Routes liées aux favoris (utilisateur connecté)
/**
 * @swagger
 * /listings/favorites:
 *   get:
 *     summary: Récupère les annonces favorites de l'utilisateur connecté
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoris récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Favoris récupérés avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Non authentifié
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
router.get('/favorites', authMiddleware, getFavoritesHandler);

// Route publique pour récupérer une annonce par ID
/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Récupère une annonce par son ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifiant de l'annonce
 *     responses:
 *       200:
 *         description: Annonce récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce récupérée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce introuvable
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
router.get('/:id', validateParams(idParamSchema), getListing);

// Routes protégées (authentification requise)
/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Crée une nouvelle annonce
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce créée avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Corps de requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
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
router.post('/', authMiddleware, validateBody(createListingSchema), createListingHandler);
/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Met à jour une annonce existante
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifiant de l'annonce
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateListingInput'
 *     responses:
 *       200:
 *         description: Annonce mise à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce mise à jour avec succès"
 *                 data:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Paramètres ou corps de requête invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce introuvable
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
router.put('/:id', authMiddleware, validateParams(idParamSchema), validateBody(updateListingSchema), updateListingHandler);
/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Supprime une annonce
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifiant de l'annonce
 *     responses:
 *       200:
 *         description: Annonce supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce supprimée avec succès"
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce introuvable
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
router.delete('/:id', authMiddleware, validateParams(idParamSchema), deleteListingHandler);
// Favoris
/**
 * @swagger
 * /listings/{id}/favorite:
 *   post:
 *     summary: Ajoute une annonce aux favoris de l'utilisateur connecté
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifiant de l'annonce
 *     responses:
 *       200:
 *         description: Annonce ajoutée aux favoris
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce ajoutée aux favoris"
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce introuvable
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
router.post('/:id/favorite', authMiddleware, validateParams(idParamSchema), addFavoriteHandler);
/**
 * @swagger
 * /listings/{id}/favorite:
 *   delete:
 *     summary: Retire une annonce des favoris de l'utilisateur connecté
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Identifiant de l'annonce
 *     responses:
 *       200:
 *         description: Annonce retirée des favoris
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Annonce retirée des favoris"
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce introuvable
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
router.delete('/:id/favorite', authMiddleware, validateParams(idParamSchema), removeFavoriteHandler);

export default router;