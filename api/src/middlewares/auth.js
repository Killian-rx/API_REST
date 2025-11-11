import jwt from 'jsonwebtoken';
import { AuthenticationError } from './errorHandler.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Token manquant ou format invalide');
    }

    // Extraire le token
    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajouter l'userId à la requête pour compatibilité
    req.userId = decoded.userId;
    // Ajouter l'objet user à la requête
    req.user = { id: decoded.userId };
    
    next();
  } catch (error) {
    next(error);
  }
};