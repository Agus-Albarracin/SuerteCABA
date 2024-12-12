const redis = require('redis');
const cache = require('express-redis-cache');

// Configurar el cliente de Redis
const redisClient = redis.createClient({
    host: '127.0.0.1', // Cambia a 'redis_container' si tienes problemas de conexión
    port: 6379,
});

redisClient.on('connect', () => {
    console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
    console.error('Error de Redis:', err);
});

// Manejar errores de conexión
redisClient.on('error', (err) => {
    console.error('Error al conectar con Redis:', err);
});


// Crear el middleware de caché
const redisCache = cache({
    client: redisClient,
    prefix: 'movimientos', // Prefijo para las claves
});

redisCache.on('message', (message) => {
    console.log('Redis cache message:', message);
});

redisCache.on('error', (error) => {
    console.error('Redis cache error:', error);
});
module.exports = redisCache;