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

/**
 * Registra o actualiza los datos del jugador en Google Sheets
 */
export const registerPlayerInGoogleSheets = async (playerData: PlayerData): Promise<GoogleSheetsResponse> => {
  if (!GOOGLE_SCRIPT_URL) {
    console.warn('🔧 Google Script URL not configured. Add REACT_APP_GOOGLE_SCRIPT_URL to your .env file');
    return { success: false, error: 'Google Script URL not configured' };
  }

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
 * Función para enviar solo email y nombre (registro inicial)
 */
export const registerEmailInGoogleSheets = async (email: string, name?: string): Promise<GoogleSheetsResponse> => {
  const playerData: PlayerData = {
    email,
    name: name || email.split('@')[0], // Usar parte del email como nombre por defecto
    bestScore: 0,
    gamesPlayed: 0
  };

  return registerPlayerInGoogleSheets(playerData);
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
