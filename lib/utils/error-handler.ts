/**
 * Centralized Error Handling Utilities
 * 
 * Provides consistent error handling across the application
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  userMessage?: string; // User-friendly message in French
}

/**
 * Convert any error to a user-friendly message
 */
export function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    // Map common error messages to French
    const errorMap: Record<string, string> = {
      'Network request failed': 'Erreur de connexion. Vérifiez votre internet.',
      'Failed to fetch': 'Impossible de se connecter au serveur.',
      'Unauthorized': 'Vous devez être connecté pour effectuer cette action.',
      'Forbidden': 'Vous n\'avez pas la permission d\'effectuer cette action.',
      'Not found': 'Ressource introuvable.',
      'Internal server error': 'Erreur serveur. Veuillez réessayer plus tard.',
      'Validation error': 'Données invalides. Vérifiez vos informations.',
    };

    // Check if we have a mapped message
    for (const [key, value] of Object.entries(errorMap)) {
      if (error.message.includes(key)) {
        return value;
      }
    }

    // Return generic message if no mapping found
    return error.message || 'Une erreur est survenue. Veuillez réessayer.';
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Une erreur inattendue est survenue. Veuillez réessayer.';
}

/**
 * Log error (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    if (context) {
      console.error(`[${context}]`, error);
    } else {
      console.error(error);
    }
  }
  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   // Sentry.captureException(error, { tags: { context } });
  // }
}

/**
 * Create a standardized error object
 */
export function createAppError(
  message: string,
  code?: string,
  statusCode?: number,
  userMessage?: string
): AppError {
  return {
    message,
    code,
    statusCode,
    userMessage: userMessage || getUserFriendlyError(new Error(message)),
  };
}

/**
 * Handle API errors consistently
 */
export async function handleApiError(response: Response): Promise<AppError> {
  let errorData: any = {};
  
  try {
    errorData = await response.json();
  } catch {
    // If response is not JSON, use status text
    errorData = { error: response.statusText };
  }

  const statusCode = response.status;
  const message = errorData.error || errorData.message || 'Erreur API';
  
  return createAppError(
    message,
    errorData.code,
    statusCode,
    errorData.userMessage
  );
}


