/**
 * Servicio para integración con Google Sheets
 * 
 * Para configurar:
 * 1. Usa el script en src/scripts/google-apps-script.js
 * 2. Configura REACT_APP_GOOGLE_SCRIPT_URL en tu .env
 * 3. La app enviará automáticamente los datos cuando juegues
 */

export interface PlayerData {
  email: string;
  name?: string;
  bestScore: number;
  bestReactionTime?: number;
  averageReactionTime?: number;
  gamesPlayed: number;
}

export interface GoogleSheetsResponse {
  success: boolean;
  action?: 'created' | 'updated';
  error?: string;
  email?: string;
  bestScore?: number;
  bestReactionTime?: number;
  gamesPlayed?: number;
}

// URL de tu Google Apps Script Web App
const GOOGLE_SCRIPT_URL = process.env.REACT_APP_GOOGLE_SCRIPT_URL || '';

// Cache simple para evitar envíos duplicados por React.StrictMode
const recentRequests = new Map<string, number>();
const DUPLICATE_PREVENTION_WINDOW = 2000; // 2 segundos

/**
 * Registra o actualiza los datos del jugador en Google Sheets
 */
export const registerPlayerInGoogleSheets = async (playerData: PlayerData): Promise<GoogleSheetsResponse> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('🔧 Google Script URL not configured. Add REACT_APP_GOOGLE_SCRIPT_URL to your .env file');
    return { success: false, error: 'Google Script URL not configured' };
  }

  // Crear una clave única para esta solicitud
  const requestKey = `${playerData.email}-${playerData.bestScore}-${playerData.gamesPlayed}`;
  const now = Date.now();
  
  // Verificar si ya enviamos una solicitud similar recientemente (protección React.StrictMode)
  const lastRequest = recentRequests.get(requestKey);
  if (lastRequest && (now - lastRequest) < DUPLICATE_PREVENTION_WINDOW) {
    console.log('🛡️ Evitando envío duplicado a Google Sheets para:', requestKey);
    return { 
      success: true, 
      action: 'updated',
      email: playerData.email,
      bestScore: playerData.bestScore,
      gamesPlayed: playerData.gamesPlayed
    };
  }
  
  // Registrar esta solicitud
  recentRequests.set(requestKey, now);
  
  // Limpiar solicitudes antiguas del cache
  const keysToDelete: string[] = [];
  recentRequests.forEach((timestamp, key) => {
    if (now - timestamp > DUPLICATE_PREVENTION_WINDOW) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => recentRequests.delete(key));

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Requerido para Google Apps Script
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerData)
    });

    // Con no-cors no podemos leer la respuesta completa
    // pero asumimos éxito si no hay excepción
    console.log('✅ Datos enviados a Google Sheets:', playerData);
    return { 
      success: true, 
      action: 'updated',
      email: playerData.email,
      bestScore: playerData.bestScore,
      gamesPlayed: playerData.gamesPlayed
    };

  } catch (error) {
    console.error('❌ Error enviando datos a Google Sheets:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Función legacy que mantiene compatibilidad con código existente
 */
export const sendPlayerDataToGoogleSheets = async (
  email: string, 
  bestScore: number, 
  gamesPlayed: number
): Promise<boolean> => {
  const result = await registerPlayerInGoogleSheets({
    email,
    bestScore,
    gamesPlayed
  });

  return result.success;
};
