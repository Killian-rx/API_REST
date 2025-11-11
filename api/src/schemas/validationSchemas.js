import { z } from 'zod';

/**
 * Schémas de validation pour l'authentification
 */
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .trim(),
  email: z.string()
    .email('Format d\'email invalide')
    .max(255, 'L\'email ne peut pas dépasser 255 caractères')
    .toLowerCase(),
  password: z.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères')
    .max(15, 'Le numéro de téléphone ne peut pas dépasser 15 caractères')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Le numéro de téléphone contient des caractères invalides')
    .optional()
});

export const loginSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Le mot de passe est requis')
});

/**
 * Schémas de validation pour les annonces
 */
export const createListingSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim(),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim(),
  price: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val) && val >= 0, 'Le prix doit être un nombre positif ou nul')
    .refine((val) => val <= 999999.99, 'Le prix ne peut pas dépasser 999,999.99'),
  location: z.string()
    .min(2, 'La localisation doit contenir au moins 2 caractères')
    .max(100, 'La localisation ne peut pas dépasser 100 caractères')
    .trim(),
  categoryId: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10))
  ])
    .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 1, 'L\'ID de catégorie doit être un entier positif')
});

export const updateListingSchema = z.object({
  title: z.string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim()
    .optional(),
  price: z.union([
    z.number(),
    z.string().transform((val) => parseFloat(val))
  ])
    .refine((val) => !isNaN(val) && val >= 0, 'Le prix doit être un nombre positif ou nul')
    .refine((val) => val <= 999999.99, 'Le prix ne peut pas dépasser 999,999.99')
    .optional(),
  location: z.string()
    .min(2, 'La localisation doit contenir au moins 2 caractères')
    .max(100, 'La localisation ne peut pas dépasser 100 caractères')
    .trim()
    .optional(),
  categoryId: z.union([
    z.number(),
    z.string().transform((val) => parseInt(val, 10))
  ])
    .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 1, 'L\'ID de catégorie doit être un entier positif')
    .optional(),
  status: z.enum(['ACTIVE', 'SOLD', 'INACTIVE'], {
    errorMap: () => ({ message: 'Le statut doit être ACTIVE, SOLD ou INACTIVE' })
  })
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Au moins un champ doit être fourni pour la mise à jour' }
);

/**
 * Schémas de validation pour les query parameters
 */
export const getListingsQuerySchema = z.object({
  q: z.string()
    .min(1, 'La recherche ne peut pas être vide')
    .max(100, 'La recherche ne peut pas dépasser 100 caractères')
    .optional(),
  categoryId: z.string()
    .regex(/^\d+$/, 'L\'ID de catégorie doit être un nombre')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'L\'ID de catégorie doit être positif')
    .optional(),
  minPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Le prix minimum doit être un nombre valide')
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, 'Le prix minimum doit être positif ou nul')
    .optional(),
  maxPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Le prix maximum doit être un nombre valide')
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 0, 'Le prix maximum doit être positif ou nul')
    .optional(),
  page: z.string()
    .regex(/^\d+$/, 'Le numéro de page doit être un nombre')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'Le numéro de page doit être positif')
    .default('1'),
  pageSize: z.string()
    .regex(/^\d+$/, 'La taille de page doit être un nombre')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 100, 'La taille de page doit être entre 1 et 100')
    .default('10')
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'Le prix minimum ne peut pas être supérieur au prix maximum',
    path: ['minPrice']
  }
);

/**
 * Schémas de validation pour les paramètres d'URL
 */
export const idParamSchema = z.object({
  id: z.string()
    .regex(/^\d+$/, 'L\'ID doit être un nombre')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, 'L\'ID doit être positif')
});