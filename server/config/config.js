
// ===================================
// Puerto
// ===================================
process.env.PORT = process.env.PORT || 3000;

// ===================================
// Entorno
// ===================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===================================
// Base de datos
// ===================================
let urlB;

if (process.env.NODE_ENV === 'dev') {
    urlB = 'mongodb://127.0.0.1:27017/cafe'
} else {
    //urlB = `mongodb+srv://lester_marroquin96:zh79vj48yE5axajP@cluster0.idap0hd.mongodb.net/Cafe.clientes?retryWrites=true&w=majority`;
    urlB = 'mongodb+srv://lester_marroquin96:zh79vj48yE5axajP@cluster0.idap0hd.mongodb.net/cafe?retryWrites=true&w=majority';

}

process.env.URLDB = urlB;