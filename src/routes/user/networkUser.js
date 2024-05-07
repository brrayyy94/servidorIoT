const { Router, json } = require("express");

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

router.post("/register", (req, res) => {
  const { user, password, userType } = req.body;

  // Verificar si los campos están vacíos
  if (!user || !password) {
    return res.status(400).json({ mensaje: "Los campos usuario y contraseña son obligatorios." });
  }

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          INSERT INTO usuarios (user, password, userType)
          VALUES (?, ?, ?)`;

      tempConn.query(query, [user, password, userType], (error, result) => {
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


// Ruta para manejar la solicitud POST que recibe el JSON
router.post('/accion', (req, res) => {
  const jsonData = req.body; // El JSON recibido estará disponible en req.body
  console.log('JSON recibido:', jsonData);
  
  // Aquí se puede realizar cualquier operación con el JSON recibido, como almacenarlo en una base de datos, procesarlo, etc.

  // Envía una respuesta de éxito al cliente
  res.status(200).send(jsonData);
});

router.post("/tienda", (req, res) => {
  const json1 = req.body;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          INSERT INTO notificacionTienda VALUES (null, ?, ?, now())`;

      tempConn.query(
        query,
        [json1.mensaje, json1.usuario_id],
        (error, result) => {
          if (error) {
            res.status(500).send("Error en la ejecución del query.");
          } else {
            tempConn.release();
            res.json(json1);
          }
        }
      );
    }
  });
});

router.get('/tienda', (req, res) => {
  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          SELECT * FROM notificacionTienda WHERE DATE(fechahora) = CURDATE()`;

      tempConn.query(query, (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();
          res.json(result);
        }
      });
    }
  });
});

router.delete('/tienda/:id', (req, res) => {
  const { id } = req.params;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          DELETE FROM notificacionTienda WHERE id = ?`;

      tempConn.query(query, [id], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();
          res.json({ mensaje: "Notificación eliminada correctamente." });
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
module.exports = router; // Exporta el router con las rutas configuradas
