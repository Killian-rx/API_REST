import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';

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
export const register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // Validation des champs requis
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password et name sont requis'
      });
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Format d\'email invalide'
      });
    }

    // Validation de la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Un utilisateur avec cet email existe déjà'
      });
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
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de l\'inscription'
    });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs requis
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et password sont requis'
      });
    }

    // Trouver l'utilisateur par email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides'
      });
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
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la connexion'
    });
  }
};

// GET /me
export const me = async (req, res) => {
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
      return res.status(404).json({
        error: 'Utilisateur non trouvé'
      });
    }

    // Retourner l'utilisateur avec ses annonces (sans le mot de passe)
    res.status(200).json({
      user: sanitizeUser(user)
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de la récupération du profil'
    });
  }
};