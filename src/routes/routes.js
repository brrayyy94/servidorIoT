const nodos = require("./nodos/network.js");
const user = require('./user/network'); // Importa el network de usuario

// Función para configurar las rutas del servidor
const routes = (server) => {
    server.use('/user', user); // Configura las rutas del network de usuario bajo la ruta '/user'
    server.use('/nodos', nodos); // Configura las rutas del network de tareas bajo la ruta '/tasks'
};


module.exports = routes; // Exporta la función de configuración de rutas