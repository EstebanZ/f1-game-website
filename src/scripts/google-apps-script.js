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
 * Función para manejar peticiones GET (opcional, para testing)
 */
function doGet(e) {
  return ContentService
    .createTextOutput('F1 Reflex Game - Google Sheets Integration API is running!')
    .setMimeType(ContentService.MimeType.TEXT);
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
    sheet.setColumnWidth(5, 120); // Partidas Jugadas
    sheet.setColumnWidth(6, 140); // Última Actualización
  }
  
  return sheet;
}

/**
 * Registra un nuevo jugador o actualiza uno existente
 */
function registerOrUpdatePlayer(sheet, data) {
  const email = data.email;
  const name = data.name || 'Jugador';
  const bestScore = data.bestScore || 0;
  const gamesPlayed = data.gamesPlayed || 0;
  const now = new Date();
  
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
    const currentGamesPlayed = currentData[4] || 0;
    
    // Solo actualizar si los nuevos datos son mejores o mayores
    const newBestScore = Math.max(currentBestScore, bestScore);
    const newGamesPlayed = Math.max(currentGamesPlayed, gamesPlayed);
    
    // Actualizar fila
    sheet.getRange(playerRow, 4).setValue(newBestScore); // Mejor Score
    sheet.getRange(playerRow, 5).setValue(newGamesPlayed); // Partidas Jugadas
    sheet.getRange(playerRow, 6).setValue(now); // Última Actualización
    
    return {
      success: true,
      action: 'updated',
      email: email,
      bestScore: newBestScore,
      gamesPlayed: newGamesPlayed
    };
    
  } else {
    // Nuevo jugador - agregar nueva fila
    const newRow = [
      email,
      name,
      now, // Fecha Registro
      bestScore,
      gamesPlayed,
      now // Última Actualización
    ];
    
    sheet.appendRow(newRow);
    
    return {
      success: true,
      action: 'created',
      email: email,
      name: name,
      bestScore: bestScore,
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
        gamesPlayed: values[i][4] || 0
      });
    }
    
    // Ordenar por mejor score
    players.sort((a, b) => b.bestScore - a.bestScore);
    
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
