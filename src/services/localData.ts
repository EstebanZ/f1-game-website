// Servicio para manejar datos locales del juego
export interface GameScore {
  id: string;
  reactionTime: number;
  score: number;
  timestamp: string;
  lights: number; // Número de luces en la secuencia
}

export interface PlayerStats {
  email: string;
  name: string;
  totalGames: number;
  bestScore: number;
  bestReactionTime: number;
  averageReactionTime: number;
  scores: GameScore[];
  registeredAt: string;
  lastPlayed: string;
}

const STORAGE_KEY = 'f1-reflex-game-data';

// Obtener datos del jugador
export const getPlayerData = (email: string): PlayerStats | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const allPlayers: Record<string, PlayerStats> = JSON.parse(data);
    return allPlayers[email] || null;
  } catch (error) {
    console.error('Error leyendo datos locales:', error);
    return null;
  }
};

// Crear nuevo jugador
export const createPlayer = (email: string, name: string): PlayerStats => {
  const newPlayer: PlayerStats = {
    email,
    name,
    totalGames: 0,
    bestScore: 0,
    bestReactionTime: Infinity,
    averageReactionTime: 0,
    scores: [],
    registeredAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  };

  savePlayerData(newPlayer);
  return newPlayer;
};

// Guardar datos del jugador
export const savePlayerData = (playerData: PlayerStats): void => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allPlayers: Record<string, PlayerStats> = data ? JSON.parse(data) : {};
    
    allPlayers[playerData.email] = playerData;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlayers));
  } catch (error) {
    console.error('Error guardando datos locales:', error);
  }
};

// Agregar nueva puntuación
export const addGameScore = (email: string, gameScore: Omit<GameScore, 'id'>): PlayerStats | null => {
  const playerData = getPlayerData(email);
  if (!playerData) return null;

  console.log('🔍 addGameScore - Datos del jugador ANTES:', {
    bestReactionTime: playerData.bestReactionTime,
    bestScore: playerData.bestScore,
    totalGames: playerData.totalGames
  });

  console.log('🔍 addGameScore - Nuevo tiempo de reacción:', gameScore.reactionTime);

  const newScore: GameScore = {
    ...gameScore,
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  playerData.scores.push(newScore);
  playerData.totalGames++;
  playerData.lastPlayed = new Date().toISOString();

  // Actualizar estadísticas
  if (gameScore.score > playerData.bestScore) {
    playerData.bestScore = gameScore.score;
    console.log('✅ Nuevo mejor puntaje:', gameScore.score);
  }

  console.log('🔍 Comparando tiempos:', {
    nuevoTiempo: gameScore.reactionTime,
    mejorActual: playerData.bestReactionTime,
    esMenor: gameScore.reactionTime < playerData.bestReactionTime
  });

  if (gameScore.reactionTime < playerData.bestReactionTime) {
    const anteriorBest = playerData.bestReactionTime;
    playerData.bestReactionTime = gameScore.reactionTime;
    console.log('✅ Nuevo mejor tiempo:', {
      anterior: anteriorBest,
      nuevo: playerData.bestReactionTime
    });
  }

  // Calcular promedio de tiempo de reacción
  const validTimes = playerData.scores.map(s => s.reactionTime).filter(t => t > 0);
  playerData.averageReactionTime = validTimes.length > 0 
    ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length 
    : 0;

  console.log('🔍 addGameScore - Datos del jugador DESPUÉS:', {
    bestReactionTime: playerData.bestReactionTime,
    bestScore: playerData.bestScore,
    totalGames: playerData.totalGames
  });

  savePlayerData(playerData);
  return playerData;
};

// Obtener top 10 puntuaciones del jugador
export const getTopScores = (email: string, limit: number = 10): GameScore[] => {
  const playerData = getPlayerData(email);
  if (!playerData) return [];

  return playerData.scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// Obtener estadísticas generales
export const getGameStats = (email: string) => {
  const playerData = getPlayerData(email);
  if (!playerData) return null;

  console.log('🔍 getGameStats - bestReactionTime raw:', playerData.bestReactionTime);
  console.log('🔍 getGameStats - es Infinity?:', playerData.bestReactionTime === Infinity);

  const scores = playerData.scores;
  const validReactionTimes = scores.map(s => s.reactionTime).filter(t => t > 0);

  const finalBestTime = playerData.bestReactionTime === Infinity ? null : playerData.bestReactionTime;
  
  console.log('🔍 getGameStats - bestReactionTime final:', finalBestTime);

  return {
    totalGames: scores.length,
    bestScore: playerData.bestScore,
    bestReactionTime: finalBestTime,
    averageReactionTime: playerData.averageReactionTime,
    totalPlayTime: scores.length * 10, // Estimado en segundos
    improvement: calculateImprovement(validReactionTimes),
    consistency: calculateConsistency(validReactionTimes)
  };
};

// Calcular mejora en el tiempo
const calculateImprovement = (reactionTimes: number[]): number => {
  if (reactionTimes.length < 2) return 0;
  
  const firstHalf = reactionTimes.slice(0, Math.floor(reactionTimes.length / 2));
  const secondHalf = reactionTimes.slice(Math.floor(reactionTimes.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  return firstAvg - secondAvg; // Positivo = mejoró (tiempo menor)
};

// Calcular consistencia (desviación estándar)
const calculateConsistency = (reactionTimes: number[]): number => {
  if (reactionTimes.length < 2) return 0;
  
  const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
  const variance = reactionTimes.reduce((acc, time) => acc + Math.pow(time - avg, 2), 0) / reactionTimes.length;
  
  return Math.sqrt(variance);
};

// Exportar todos los datos (para backup)
export const exportAllData = (): string => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data || '{}';
};

// Importar datos (para restore)
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error importando datos:', error);
    return false;
  }
};

// Limpiar datos del jugador
export const clearPlayerData = (email: string): void => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;
    
    const allPlayers: Record<string, PlayerStats> = JSON.parse(data);
    delete allPlayers[email];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allPlayers));
  } catch (error) {
    console.error('Error limpiando datos:', error);
  }
};
