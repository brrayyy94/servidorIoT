const nodoUltrasonido = require("./nodos/networkUltrasonido.js");
const nodoInfrarrojo = require("./nodos/networkInfrarrojo.js");
const nodoPeso = require("./nodos/networkPeso.js");
const user = require('./user/networkUser.js'); // Importa el network de usuario

// Función para configurar las rutas del servidor
const routes = (server) => {
    server.use('/user', user); // Configura las rutas del network de usuario bajo la ruta '/user'
    server.use('/nodos', nodoUltrasonido); // Configura las rutas del network de tareas bajo la ruta '/tasks'
    server.use('/nodos', nodoPeso);
    server.use('/nodos', nodoInfrarrojo);
};


module.exports = routes; // Exporta la función de configuración de rutas