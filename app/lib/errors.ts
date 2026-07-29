const ERROR_MESSAGES: Record<string, string> = {
  // Réseau / API
  "Failed to fetch": "Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez dans quelques instants.",
  NetworkError: "Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez dans quelques instants.",
  AbortError: "Le serveur ne répond pas après quelques secondes. Vérifiez votre connexion ou réessayez plus tard.",

  // Auth
  auth_failed: "Connexion impossible. Vérifiez vos identifiants ou réessayez.",
  unauthorized: "Votre session a expiré ou vos identifiants sont incorrects. Veuillez vous reconnecter.",
  forbidden: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",

  // Validation / données
  "Validation failed": "Certains champs ne sont pas valides. Vérifiez les informations saisies.",
  not_found: "La page ou la ressource demandée est introuvable.",

  // Support / inconnu
  support: "Une erreur inattendue est survenue. Si le problème persiste, contactez le support.",
  default: "Une erreur est survenue. Veuillez réessayer dans quelques instants.",
};

const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Certaines informations envoyées ne sont pas valides. Vérifiez les champs et réessayez.",
  401: "Votre session a expiré ou vos identifiants sont incorrects. Veuillez vous reconnecter.",
  403: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
  404: "La page ou la ressource demandée est introuvable.",
  409: "Un conflit est survenu. Les données ont peut-être été modifiées entre-temps.",
  422: "Les données envoyées ne sont pas valides. Vérifiez les informations saisies.",
  429: "Trop de tentatives. Veuillez patienter quelques instants avant de réessayer.",
  500: "Une erreur est survenue de notre côté. Notre équipe a été notifiée. Veuillez réessayer dans quelques instants.",
  502: "Le serveur est temporairement indisponible. Veuillez réessayer dans quelques instants.",
  503: "Le service est momentanément indisponible. Veuillez réessayer plus tard.",
};

export function getErrorMessage(error: unknown): string {
  if (!error) return "";

  // String exact
  if (typeof error === "string") {
    const trimmed = error.trim();
    if (ERROR_MESSAGES[trimmed]) return ERROR_MESSAGES[trimmed];

    // Essaie de matcher un pattern "404" dans une string comme "Error 404" ou "HTTP 404"
    const httpMatch = trimmed.match(/\b(\d{3})\b/);
    if (httpMatch) {
      const code = parseInt(httpMatch[1], 10);
      if (HTTP_STATUS_MESSAGES[code]) return HTTP_STATUS_MESSAGES[code];
    }

    // Si c'est un message déjà en français et qu'il a du sens, on le garde
    if (/[éèêëàâäùûüôöîïç]/i.test(trimmed) && trimmed.length > 10) return trimmed;

    return ERROR_MESSAGES.default;
  }

  // Error object
  if (error instanceof Error) {
    const msg = error.message;

    if (ERROR_MESSAGES[msg]) return ERROR_MESSAGES[msg];

    const httpMatch = msg.match(/\b(\d{3})\b/);
    if (httpMatch) {
      const code = parseInt(httpMatch[1], 10);
      if (HTTP_STATUS_MESSAGES[code]) return HTTP_STATUS_MESSAGES[code];
    }

    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch")) {
      return ERROR_MESSAGES["Failed to fetch"];
    }

    if (msg.includes("JSON") || msg.includes("parse")) {
      return "Impossible de lire la réponse du serveur.";
    }

    if (/[éèêëàâäùûüôöîïç]/i.test(msg) && msg.length > 10) return msg;
    return ERROR_MESSAGES.default;
  }

  // Object avec propriété error, message ou status
  if (typeof error === "object" && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.error === "string") return getErrorMessage(obj.error);
    if (typeof obj.message === "string") return getErrorMessage(obj.message);
    if (typeof obj.status === "number" && HTTP_STATUS_MESSAGES[obj.status]) {
      return HTTP_STATUS_MESSAGES[obj.status];
    }
  }

  return ERROR_MESSAGES.default;
}

export function getErrorFromStatus(status: number): string {
  return HTTP_STATUS_MESSAGES[status] ?? ERROR_MESSAGES.default;
}
