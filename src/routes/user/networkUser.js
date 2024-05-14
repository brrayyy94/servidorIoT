const { Router, json } = require("express");
const mqtt = require("mqtt");

const router = Router();

const mysql = require("mysql");

var client = mqtt.connect("mqtt://broker.mqtt-dashboard.com");

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
  res.status(200).send("Todo correcto en /user");
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

router.post("/dispensar", (req, res) => {
  const json1 = req.body;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `INSERT INTO accionesDispensador VALUES(null, ?, ?, now())`;

      tempConn.query(query, [json1.idnodo, json1.accionDispensador], (error, result) => {
        if (error) {
          tempConn.release();
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();
          res.status(200).json(json1);
          client.publish("accionDispensador", JSON.stringify(json1));
        }
      });
    }
  });
});

router.get("/accion/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;
  connection.getConnection((error, tempConn) => {
    if (error) {
      console.error(error.message);
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          SELECT * FROM accionesTapa
          WHERE DATE(fechahora) = CURDATE() AND usuario_id = ?`;

      tempConn.query(query, [usuario_id], (error, result) => {
        if (error) {
          console.error(error.message);
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();

          if (result.length > 0) {
            res.json(result);
          } else {
            res.status(404).json({
              mensaje: "No se encontraron registros para hoy",
            });
          }
        }
      });
    }
  });
});

router.post("/tienda", (req, res) => {
  const json1 = req.body;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          INSERT INTO notificacionTienda VALUES (null, ?, ?, ?, now())`;

      tempConn.query(
        query,
        [json1.mensaje, json1.usuario_id, json1.direccion],
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
