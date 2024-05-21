const { Router } = require("express");

const routerPeso = Router();

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

// Ruta GET para obtener datos de `datosPeso` filtrados por `idnodo`
routerPeso.get("/datosPeso/:idnodo", (req, res) => {
  const { idnodo } = req.params;

  connection.getConnection((error, tempConn) => {
    if (error) {
      console.error(error.message);
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      const query = `
          SELECT * FROM datospeso
          WHERE DATE(fechahora) = CURDATE() AND idnodo = ?`;

      tempConn.query(query, [idnodo], (error, result) => {
        if (error) {
          console.error(error.message);
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release();

          if (result.length > 0) {
            res.json(result);
          } else {
            res.status(404).json({
              mensaje: "No se encontraron registros para hoy con ese idnodo.",
            });
          }
        }
      });
    }
  });
});

routerPeso.post("/datosPeso", (req, res) => {
  var json1 = req.body;
  console.log(json1);

  connection.getConnection(function (error, tempConn) {
    if (error) {
      console.error(error.message);
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");
      // Consulta para verificar si el usuario ya existe
      const checkUserQuery = `SELECT COUNT(*) AS count FROM datospeso WHERE idnodo = ?`;

      tempConn.query(checkUserQuery, [json1.idnodo], (error, result) => {
        if (error) {
          tempConn.release();
          res
            .status(500)
            .send(
              "Error en la ejecución de la consulta de verificación de usuario."
            );
        } else {
          const userCount = result[0].count;

          if (userCount > 0) {
            // Si el usuario ya existe, devuelve un mensaje de error
            tempConn.release();
            res.status(400).json({
              mensaje: "El idnodo ya existe en la base de datos.",
            });
          } else {
            tempConn.query(
              "INSERT INTO datospeso VALUES(null, ?, ?, ?, now())",
              [json1.usuario_id, json1.idnodo, json1.peso],
              function (error, result) {
                if (error) {
                  console.error(error.message);
                  res.status(500).send("Error al insertar los datos.");
                } else {
                  tempConn.release();
                  res.status(200).send("Datos almacenados correctamente.");
                }
              }
            );
          }
        }
      });
    }
  });
});

routerPeso.delete("/datosPeso", (req, res) => {
  var json1 = req.body; // Se recibe el JSON con los datos
  console.log(json1); // Se muestra en consola

  connection.getConnection(function (error, tempConn) {
    // Conexión a MySQL
    try {
      if (error) {
        throw error; // En caso de error en la conexión
      }

      console.log("Conexión correcta.");

      tempConn.query(
        "DELETE FROM datospeso WHERE idnodo = ? and usuario_id = ?",
        [json1.idnodo, json1.usuario_id],
        function (error, result) {
          // Se ejecuta la eliminación
          if (error) {
            throw error; // Lanzar error si la eliminación falla
          } else {
            // Se libera la conexión solo después de la operación exitosa
            tempConn.release();
            res.status(200).send(`Datos eliminados`);
          }
        }
      );
    } catch (error) {
      // Manejo de errores
      console.error(error.message);
      res.status(500).send(error.message); // Enviar respuesta de error al cliente
    }
  });
});

routerPeso.put("/datosPeso", (req, res) => {
  var json1 = req.body;
  console.log(json1);

  connection.getConnection(function (error, tempConn) {
    if (error) {
      console.error(error.message);
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      tempConn.query(
        "UPDATE datospeso SET peso = ? WHERE idnodo = ?",
        [json1.peso, json1.idnodo],
        function (error, result) {
          if (error) {
            console.error(error.message);
            res.status(500).send("Error al actualizar los datos.");
          } else {
            tempConn.release();
            res.status(200).send("Datos actualizados correctamente.");
          }
        }
      );
    }
  });
});

module.exports = routerPeso; // Exporta el router con las rutas configuradas
