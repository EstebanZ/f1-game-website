/**
 * Google Apps Script para F1 Reflex Game
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 
 * 1. Ve a https://script.google.com/
 * 2. Crea un nuevo proyecto
 * 3. Pega este código en el editor
 * 4. Crea una nueva hoja de cálculo de Google Sheets
 * 5. Copia el ID de la hoja (está en la URL) y pégalo en SHEET_ID abajo
 * 6. Despliega como Web App:
 *    - Ejecutar como: Tu email
 *    - Quién tiene acceso: Cualquiera
 * 7. Autoriza los permisos cuando se solicite
 * 8. Copia la URL del Web App y ponla en tu archivo .env como REACT_APP_GOOGLE_SCRIPT_URL
 * 
 * La hoja tendrá las siguientes columnas:
 * A: Email | B: Nombre | C: Fecha Registro | D: Mejor Score | E: Partidas Jugadas | F: Última Actualización
 * 
 * IMPORTANTE: Este script funciona con src/services/googleSheets.ts del proyecto React
 */

// ⚠️ IMPORTANTE: Cambia esto por el ID de tu Google Sheet
const SHEET_ID = 'TU_SHEET_ID_AQUI'; // Reemplaza con tu ID real
const SHEET_NAME = 'F1 Reflex Players'; // Nombre de la hoja

/**
 * Función principal que maneja las peticiones POST
 */
function doPost(e) {
  try {
    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);
    
    // Obtener o crear la hoja
    const sheet = getOrCreateSheet();
    
    // Registrar o actualizar el jugador
    const result = registerOrUpdatePlayer(sheet, data);
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error en doPost:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función para manejar peticiones GET
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    switch (action) {
      case 'getGlobalStats':
        return ContentService
          .createTextOutput(JSON.stringify(getGlobalStats()))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'getTopPlayers':
        return ContentService
          .createTextOutput(JSON.stringify(getTopPlayers()))
          .setMimeType(ContentService.MimeType.JSON);
          
      default:
        return ContentService
          .createTextOutput('F1 Reflex Game - Google Sheets Integration API is running!')
          .setMimeType(ContentService.MimeType.TEXT);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Obtiene la hoja o la crea si no existe
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Crear nueva hoja
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Configurar encabezados
    const headers = [
      'Email',
      'Nombre', 
      'Fecha Registro',
      'Mejor Score',
      'Mejor Tiempo Reaccion (ms)',
      'Tiempo Promedio (ms)',
      'Partidas Jugadas',
      'Última Actualización'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formatear encabezados
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('white');
    
    // Ajustar ancho de columnas
    sheet.setColumnWidth(1, 200); // Email
    sheet.setColumnWidth(2, 150); // Nombre
    sheet.setColumnWidth(3, 120); // Fecha Registro
    sheet.setColumnWidth(4, 100); // Mejor Score
    sheet.setColumnWidth(5, 150); // Mejor Tiempo Reaccion
    sheet.setColumnWidth(6, 150); // Tiempo Promedio
    sheet.setColumnWidth(7, 120); // Partidas Jugadas
    sheet.setColumnWidth(8, 140); // Última Actualización
  }
  
  return sheet;
}

/**
 * Registra un nuevo jugador o actualiza uno existente
 */
function registerOrUpdatePlayer(sheet, data) {
  const email = data.email;
  const name = data.name || 'Usuario';
  const bestScore = data.bestScore || 0;
  const bestReactionTime = data.bestReactionTime || 0;
  const gamesPlayed = data.gamesPlayed || 0;
  const now = new Date();
  
  console.log('📊 Datos recibidos:', {
    email: email,
    bestScore: bestScore,
    bestReactionTime: bestReactionTime,
    gamesPlayed: gamesPlayed
  });
  
  // Buscar si el jugador ya existe
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  let playerRow = -1;
  
  // Buscar por email (columna 1, índice 0)
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === email) {
      playerRow = i + 1; // +1 porque getRange usa índices basados en 1
      break;
    }
  }
  
  if (playerRow > 0) {
    // Actualizar jugador existente
    const currentData = values[playerRow - 1];
    const currentBestScore = currentData[3] || 0;
    const currentBestReactionTime = currentData[4] || Infinity;
    const currentGamesPlayed = currentData[6] || 0;
    
    // Solo actualizar si los nuevos datos son mejores o mayores
    const newBestScore = Math.max(currentBestScore, bestScore);
    
    // Para tiempo de reacción: solo actualizar si el nuevo tiempo es mejor (menor) y válido
    let newBestReactionTime = currentBestReactionTime;
    if (bestReactionTime > 0 && bestReactionTime !== Infinity) {
      if (currentBestReactionTime === 0 || currentBestReactionTime === Infinity || bestReactionTime < currentBestReactionTime) {
        newBestReactionTime = bestReactionTime;
      }
    }
    
    const newGamesPlayed = Math.max(currentGamesPlayed, gamesPlayed);
    
    // Actualizar fila
    sheet.getRange(playerRow, 4).setValue(newBestScore); // Mejor Score
    sheet.getRange(playerRow, 5).setValue(newBestReactionTime === Infinity || newBestReactionTime === 0 ? 0 : newBestReactionTime); // Mejor Tiempo
    sheet.getRange(playerRow, 7).setValue(newGamesPlayed); // Partidas Jugadas
    sheet.getRange(playerRow, 8).setValue(now); // Última Actualización
    
    console.log('✅ Jugador actualizado:', {
      email: email,
      newBestScore: newBestScore,
      newBestReactionTime: newBestReactionTime,
      newGamesPlayed: newGamesPlayed
    });
    
    return {
      success: true,
      action: 'updated',
      email: email,
      bestScore: newBestScore,
      bestReactionTime: newBestReactionTime === Infinity || newBestReactionTime === 0 ? 0 : newBestReactionTime,
      gamesPlayed: newGamesPlayed
    };
    
  } else {
    // Nuevo jugador - agregar nueva fila
    const newRow = [
      email,
      name,
      now, // Fecha Registro
      bestScore,
      bestReactionTime === Infinity || bestReactionTime === 0 ? 0 : bestReactionTime, // Mejor Tiempo
      0, // Tiempo Promedio (se calcula globalmente)
      gamesPlayed,
      now // Última Actualización
    ];
    
    sheet.appendRow(newRow);
    
    console.log('✅ Nuevo jugador creado:', {
      email: email,
      name: name,
      bestScore: bestScore,
      bestReactionTime: bestReactionTime,
      gamesPlayed: gamesPlayed
    });
    
    return {
      success: true,
      action: 'created',
      email: email,
      name: name,
      bestScore: bestScore,
      bestReactionTime: bestReactionTime,
      gamesPlayed: gamesPlayed
    };
  }
}

/**
 * Función para obtener estadísticas (opcional)
 */
function getPlayerStats(email) {
  try {
    const sheet = getOrCreateSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Buscar jugador
    for (let i = 1; i < values.length; i++) {
      if (values[i][0] === email) {
        return {
          success: true,
          player: {
            email: values[i][0],
            name: values[i][1],
            registeredAt: values[i][2],
            bestScore: values[i][3],
            gamesPlayed: values[i][4],
            lastUpdated: values[i][5]
          }
        };
      }
    }
    
    return {
      success: false,
      error: 'Player not found'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Función para obtener el ranking (top 10)
 */
function getTopPlayers() {
  try {
    const sheet = getOrCreateSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Obtener datos de jugadores (saltar encabezado)
    const players = [];
    for (let i = 1; i < values.length; i++) {
      players.push({
        email: values[i][0],
        name: values[i][1],
        bestScore: values[i][3] || 0,
        bestReactionTime: values[i][4] || 0,
        averageReactionTime: values[i][5] || 0,
        gamesPlayed: values[i][6] || 0
      });
    }
    
    // Ordenar por mejor tiempo de reacción (menor es mejor)
    players.sort((a, b) => {
      // Si alguno no tiene tiempo registrado, va al final
      if (a.bestReactionTime === 0) return 1;
      if (b.bestReactionTime === 0) return -1;
      return a.bestReactionTime - b.bestReactionTime;
    });
    
    return {
      success: true,
      topPlayers: players.slice(0, 10)
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Función para obtener estadísticas globales
 */
function getGlobalStats() {
  try {
    const sheet = getOrCreateSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return {
        success: true,
        totalPlayers: 0,
        totalGames: 0,
        globalBestTime: 0,
        averageGlobalTime: 0,
        topPlayers: [],
        recentActivity: []
      };
    }
    
    // Obtener datos de jugadores (saltar encabezado)
    let totalPlayers = 0;
    let totalGames = 0;
    const allReactionTimes = [];
    const topPlayers = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      totalPlayers++;
      totalGames += row[6] || 0; // Sumar partidas jugadas
      
      const reactionTime = row[4] || 0;
      if (reactionTime > 0) {
        allReactionTimes.push(reactionTime);
      }
      
      topPlayers.push({
        name: row[1] || 'Usuario',
        email: row[0],
        bestTime: reactionTime,
        totalGames: row[6] || 0,
        averageTime: row[5] || 0
      });
    }
    
    // Calcular estadísticas globales
    const globalBestTime = allReactionTimes.length > 0 ? Math.min(...allReactionTimes) : 0;
    const averageGlobalTime = allReactionTimes.length > 0 ? 
      allReactionTimes.reduce((sum, time) => sum + time, 0) / allReactionTimes.length : 0;
    
    // Ordenar top players por mejor tiempo
    topPlayers.sort((a, b) => {
      if (a.bestTime === 0) return 1;
      if (b.bestTime === 0) return -1;
      return a.bestTime - b.bestTime;
    });
    
    // Simular actividad reciente (los últimos jugadores actualizados)
    const recentActivity = [];
    for (let i = Math.max(1, values.length - 20); i < values.length; i++) {
      const row = values[i];
      recentActivity.push({
        playerName: row[1] || 'Jugador',
        reactionTime: row[4] || 0,
        score: row[3] || 0,
        timestamp: row[7] || new Date().toISOString()
      });
    }
    
    // Ordenar actividad reciente por fecha (más reciente primero)
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return {
      success: true,
      totalPlayers: totalPlayers,
      totalGames: totalGames,
      globalBestTime: Math.round(globalBestTime),
      averageGlobalTime: Math.round(averageGlobalTime),
      topPlayers: topPlayers.slice(0, 10),
      recentActivity: recentActivity.slice(0, 20)
    };
    
  } catch (error) {
    console.error('Error in getGlobalStats:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}
