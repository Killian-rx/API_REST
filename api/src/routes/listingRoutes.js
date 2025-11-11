import express from 'express';
import { getListings, getListingById, createListing } from '../controllers/listingController.js';
import { authMiddleware } from '../middlewares/auth.js';

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
router.get('/', getListings);

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
 *         description: ID de l'annonce
 *         example: 1
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
 *                   allOf:
 *                     - $ref: '#/components/schemas/Listing'
 *                     - type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             id: { type: "integer" }
 *                             name: { type: "string" }
 *                             phone: { type: "string", nullable: true }
 *                         category:
 *                           $ref: '#/components/schemas/Category'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Annonce non trouvée
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
router.get('/:id', getListingById);

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Créer une nouvelle annonce
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - location
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 description: Titre de l'annonce
 *                 example: "iPhone 13 Pro Max 256GB"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 description: Description détaillée de l'annonce
 *                 example: "iPhone en excellent état, très peu utilisé..."
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Prix de l'annonce
 *                 example: 899.99
 *               location:
 *                 type: string
 *                 description: Localisation de l'annonce
 *                 example: "Paris, 75001"
 *               categoryId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la catégorie
 *                 example: 3
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
 *                   allOf:
 *                     - $ref: '#/components/schemas/Listing'
 *                     - type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             id: { type: "integer" }
 *                             name: { type: "string" }
 *                         category:
 *                           $ref: '#/components/schemas/Category'
 *       400:
 *         description: Données invalides
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
router.post('/', authMiddleware, createListing);

export default router;