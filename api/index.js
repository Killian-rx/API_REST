import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import listingRoutes from "./src/routes/listingRoutes.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Leboncoin-like API",
      version: "1.0.0",
      description: "Une API REST pour une plateforme de petites annonces similaire à Leboncoin",
      contact: {
        name: "API Support",
        email: "support@leboncoin-api.com"
      }
    },
    servers: [
      {
        url: "http://localhost:" + (process.env.PORT || 4000),
        description: "Serveur de développement"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID unique de l'utilisateur" },
            email: { type: "string", format: "email", description: "Email de l'utilisateur" },
            name: { type: "string", description: "Nom de l'utilisateur" },
            phone: { type: "string", nullable: true, description: "Numéro de téléphone (optionnel)" },
            createdAt: { type: "string", format: "date-time", description: "Date de création" },
            updatedAt: { type: "string", format: "date-time", description: "Date de dernière mise à jour" }
          }
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID unique de la catégorie" },
            name: { type: "string", description: "Nom de la catégorie" },
            slug: { type: "string", description: "Slug URL-friendly de la catégorie" },
            createdAt: { type: "string", format: "date-time", description: "Date de création" },
            _count: {
              type: "object",
              properties: {
                listings: { type: "integer", description: "Nombre d'annonces dans cette catégorie" }
              }
            }
          }
        },
        Listing: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID unique de l'annonce" },
            title: { type: "string", description: "Titre de l'annonce" },
            description: { type: "string", description: "Description de l'annonce" },
            price: { type: "number", format: "decimal", description: "Prix de l'annonce" },
            location: { type: "string", description: "Localisation de l'annonce" },
            status: { 
              type: "string", 
              enum: ["ACTIVE", "SOLD", "ARCHIVED"], 
              description: "Statut de l'annonce"
            },
            userId: { type: "integer", description: "ID de l'utilisateur propriétaire" },
            categoryId: { type: "integer", description: "ID de la catégorie" },
            createdAt: { type: "string", format: "date-time", description: "Date de création" },
            updatedAt: { type: "string", format: "date-time", description: "Date de dernière mise à jour" }
          }
        },
        CreateListingInput: {
          type: "object",
          required: ["title", "description", "price", "location", "categoryId"],
          properties: {
            title: { type: "string", description: "Titre de l'annonce" },
            description: { type: "string", description: "Description de l'annonce" },
            price: { type: "number", format: "decimal", description: "Prix demandé" },
            location: { type: "string", description: "Localisation de l'annonce" },
            categoryId: { type: "integer", description: "Identifiant de la catégorie" }
          }
        },
        UpdateListingInput: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre de l'annonce" },
            description: { type: "string", description: "Description de l'annonce" },
            price: { type: "number", format: "decimal", description: "Prix demandé" },
            location: { type: "string", description: "Localisation de l'annonce" },
            categoryId: { type: "integer", description: "Identifiant de la catégorie" },
            status: {
              type: "string",
              enum: ["ACTIVE", "SOLD", "ARCHIVED"],
              description: "Statut de l'annonce"
            }
          }
        },
        Favorite: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID unique du favori" },
            userId: { type: "integer", description: "ID de l'utilisateur" },
            listingId: { type: "integer", description: "ID de l'annonce" },
            createdAt: { type: "string", format: "date-time", description: "Date d'ajout aux favoris" },
            listing: {
              allOf: [
                { $ref: "#/components/schemas/Listing" },
                {
                  type: "object",
                  properties: {
                    category: { $ref: "#/components/schemas/Category" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        name: { type: "string" }
                      }
                    }
                  }
                }
              ]
            }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", description: "Message d'erreur" }
          }
        }
      }
    }
  },
  apis: ["./src/routes/*.js"], // Chemin vers les fichiers contenant les annotations
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Leboncoin-like API Documentation"
}));

// Routes d'authentification
app.use("/auth", authRoutes);

// Routes publiques des catégories
app.use("/categories", categoryRoutes);

// Routes des annonces (listings)
app.use("/listings", listingRoutes);

// route test
app.get("/", (req, res) => {
  res.json({ 
    message: "API opérationnelle",
    documentation: "http://localhost:" + (process.env.PORT || 4000) + "/api-docs"
  });
});

// Middleware global de gestion d'erreurs (doit être en dernier)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Serveur API démarré sur http://localhost:" + PORT);
});
