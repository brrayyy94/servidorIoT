const { Router } = require("express");

const router = Router();

const mysql = require("mysql");

// se crea la conexión a mysql
const connection = mysql.createPool({
  connectionLimit: 500,
  host: "localhost",
  user: "root",
  password: "", //el password de ingreso a mysql
  database: "calidatos",
  port: 3306,
});

// Ruta para el método GET en /user/login
router.get("/", (req, res) => {
  success(res, "Todo correcto en /login", 200); // Responde con un mensaje de éxito
});

router.post("/login", (req, res) => {
  const { user, password } = req.body; // Obtiene los datos del cuerpo de la petición

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      // Consulta para obtener los usuarios con el email y password proporcionados
      const query = `
          SELECT * FROM usuarios
          WHERE user = ? AND password = ?`;

      tempConn.query(query, [user, password], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release(); // Liberar la conexión

          const responseData = {}; // Objeto JSON para almacenar los resultados

          if (result.length > 0) {
            result.forEach((row, index) => {
              responseData[`user${index + 1}`] = row; // Almacena cada registro en el objeto JSON
            });
            res.json(responseData); // Devolver los registros como respuesta JSON
          } else {
            res.status(404).json({
              mensaje: "No se encontraron registros con ese user y password.",
            });
          }
        }
      });
    }
  });
});

router.get("/:id", (req, res) => {
  const { id } = req.params;

  // Función para realizar consultas SQL
  function realizarConsulta(query, params) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Consulta para obtener datos del usuario
  const queryUsuario = `SELECT id, user, password FROM usuarios WHERE id = ?`;
  realizarConsulta(queryUsuario, [id])
    .then((resultUsuario) => {
      const usuario = resultUsuario[0];

      // Consulta para obtener nodos asociados al usuario
      const queryNodos = `
        SELECT idnodo 
        FROM (
          SELECT idnodo FROM datosultrasonido WHERE usuario_id = ?
          UNION
          SELECT idnodo FROM datospeso WHERE usuario_id = ?
          UNION
          SELECT idnodo FROM datosinfrarrojo WHERE usuario_id = ?
        ) AS nodos_unicos`;
      return realizarConsulta(queryNodos, [id, id, id])
        .then((resultNodos) => {
          const nodos = resultNodos.map((nodo) => ({ idnodo: nodo.idnodo }));
          return { usuario, nodos };
        });
    })
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error en la consulta:", error);
      res.status(500).json({ mensaje: "Error en la consulta SQL." });
    });
});


router.post("/register", (req, res) => {
  const { user, password } = req.body;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          INSERT INTO usuarios (user, password)
          VALUES (?, ?)`;

      tempConn.query(query, [user, password], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();

          res.json({
            mensaje: "Usuario registrado correctamente.",
          });
        }
      });
    }
  });
});

module.exports = router; // Exporta el router con las rutas configuradas
