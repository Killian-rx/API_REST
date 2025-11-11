/**
 * Middleware global de gestion d'erreurs
 * Intercepte toutes les erreurs et renvoie une réponse JSON cohérente
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Error caught by errorHandler:', error);

  // Erreurs de validation Zod
  if (error.name === 'ZodError') {
    const message = error.errors[0]?.message || 'Données invalides';
    return res.status(400).json({
      error: 'ValidationError',
      message: message
    });
  }

  // Erreurs personnalisées avec type
  if (error.type) {
    const statusMap = {
      'ValidationError': 400,
      'AuthenticationError': 401,
      'AuthorizationError': 403,
      'NotFoundError': 404,
      'ConflictError': 409
    };

    const status = statusMap[error.type] || 500;
    return res.status(status).json({
      error: error.type,
      message: error.message
    });
  }

  // Erreurs Prisma
  if (error.code) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: 'ConflictError',
          message: 'Cette ressource existe déjà'
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          error: 'ValidationError',
          message: 'Référence invalide'
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Ressource non trouvée'
        });
      default:
        return res.status(500).json({
          error: 'DatabaseError',
          message: 'Erreur de base de données'
        });
    }
  }

  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'AuthenticationError',
      message: 'Token invalide'
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'AuthenticationError',
      message: 'Token expiré'
    });
  }

  // Erreurs génériques avec status
  if (error.status || error.statusCode) {
    return res.status(error.status || error.statusCode).json({
      error: 'Error',
      message: error.message || 'Une erreur est survenue'
    });
  }

  // Erreur 500 par défaut
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Une erreur interne est survenue'
  });
};

/**
 * Classes d'erreurs personnalisées pour un usage cohérent
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.type = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.type = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
    this.type = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.type = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
    this.type = 'ConflictError';
  }
}