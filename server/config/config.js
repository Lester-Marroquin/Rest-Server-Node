
// ===================================
// Puerto
// ===================================
process.env.PORT = process.env.PORT || 3000;

// ===================================
// Entorno
// ===================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===================================
// Vencimiento del Token
// ===================================
// 60 segundos
// 60 minutos
// 24 horas
// 30 dias
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;

// ===================================
// SEED de autenticación
// ===================================
process.env.SEED = process.env.SEED || 'Seed-de-produccion';

// ===================================
// Base de datos
// ===================================
let urlB;

if (process.env.NODE_ENV === 'dev') {
    urlB = 'mongodb://127.0.0.1:27017/cafe';
} else {
    urlB = process.env.MONGO_URI;
}

process.env.URLDB = urlB;