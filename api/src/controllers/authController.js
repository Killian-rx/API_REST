import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
import { ConflictError, AuthenticationError, NotFoundError } from '../middlewares/errorHandler.js';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Fonction utilitaire pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Fonction utilitaire pour retourner un utilisateur sans le mot de passe
const sanitizeUser = (user) => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// POST /auth/register
export const register = async (req, res, next) => {
  try {
    const { email, password, name, phone } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictError('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        phone: phone || null
      }
    });

    // Générer un token
    const token = generateToken(user.id);

    // Retourner l'utilisateur et le token (sans le mot de passe)
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: sanitizeUser(user),
      token
    });

  } catch (error) {
    next(error);
  }
};

// POST /auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AuthenticationError('Identifiants invalides');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthenticationError('Identifiants invalides');
    }

    // Générer un token
    const token = generateToken(user.id);

    // Retourner l'utilisateur et le token (sans le mot de passe)
    res.status(200).json({
      message: 'Connexion réussie',
      user: sanitizeUser(user),
      token
    });

  } catch (error) {
    next(error);
  }
};

// GET /me
export const me = async (req, res, next) => {
  try {
    // req.userId est défini par le middleware d'auth
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        listings: {
          include: {
            category: true
          }
        }
      }
    });

    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }

    // Retourner l'utilisateur avec ses annonces (sans le mot de passe)
    res.status(200).json({
      user: sanitizeUser(user)
    });

  } catch (error) {
    next(error);
  }
};