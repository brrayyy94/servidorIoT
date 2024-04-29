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

      // Consulta para obtener el usuario con el email y password proporcionados
      const query = `
          SELECT * FROM usuarios
          WHERE user = ? AND password = ?`;

      tempConn.query(query, [user, password], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release(); // Liberar la conexión

          if (result.length > 0) {
            res.json(result); // Devolver los registros como respuesta JSON
          } else {
            res.status(404).json({
              mensaje: "No se encontraron registros con ese email y password.",
            });
          }
        }
      });
    }
  });
});

// router.get("/:id", (req, res) => {
//   var { id } = req.params;
//   console.log(id);
//   var arreglo = []; //variable para almacenar todos los datos, en formato arreglo de json
//   connection.getConnection(function (error, tempConn) {
//     //conexion a mysql
//     if (error) {
//       throw error; //si no se pudo conectar
//     } else {
//       console.log("Conexion correcta.");
//       //ejecución de la consulta
//       const query = `SELECT
//       du.id AS ultrasonido_id, du.idnodo AS ultrasonido_idnodo, du.distancia AS ultrasonido_distancia,
//       du.fechahora AS ultrasonido_fechahora,
//       dp.id AS peso_id, dp.idnodo AS peso_idnodo, dp.peso AS peso_peso,
//       dp.fechahora AS peso_fechahora,
//       di.id AS infrarrojo_id, di.idnodo AS infrarrojo_idnodo, di.actividad AS infrarrojo_actividad,
//       di.fechahora AS infrarrojo_fechahora
//   FROM
//       usuarios u
//   LEFT JOIN
//       datosultrasonido du ON u.id = du.usuario_id
//   LEFT JOIN
//       datospeso dp ON u.id = dp.usuario_id
//   LEFT JOIN
//       datosinfrarrojo di ON u.id = di.usuario_id
//   WHERE
//       u.id = ?`;
//       tempConn.query(query, [id], function (error, result) {
//         if (error) {
//           throw error;
//         } else {
//           tempConn.release(); //se librea la conexión
//           // Iterar sobre cada fila del resultado
//           result.forEach((row) => {
//             // Construir el objeto JSON combinando los datos de las tres tablas
//             var json1 = {
//               datosultrasonido: {
//                 id: row.ultrasonido_id,
//                 idnodo: row.ultrasonido_idnodo,
//                 distancia: row.ultrasonido_distancia,
//                 fechahora: row.ultrasonido_fechahora,
//               },
//               datospeso: {
//                 id: row.peso_id,
//                 idnodo: row.peso_idnodo,
//                 peso: row.peso_peso,
//                 fechahora: row.peso_fechahora,
//               },
//               datosinfrarrojo: {
//                 id: row.infrarrojo_id,
//                 idnodo: row.infrarrojo_idnodo,
//                 actividad: row.infrarrojo_actividad,
//                 fechahora: row.infrarrojo_fechahora,
//               },
//             };
//             arreglo.push(json1); // Añadir el objeto JSON al arreglo
//           });
//           res.json(arreglo); // retornar el arreglo como respuesta
//         }
//       });
//     }
//   });
// });

router.get("/:id", (req, res) => {
  var { id } = req.params;
  console.log(id);

  // Objeto para almacenar los resultados finales
  var resultado_final = {};

  // Función para realizar consultas SQL
  function realizarConsulta(query, params, callback) {
    connection.getConnection(function (error, tempConn) {
      if (error) {
        throw error;
      } else {
        tempConn.query(query, params, function (error, result) {
          if (error) {
            throw error;
          } else {
            tempConn.release();
            callback(result);
          }
        });
      }
    });
  }

  // Consulta para obtener datos del usuario
  const queryUsuario = `SELECT id, user, password FROM usuarios WHERE id = ?`;
  realizarConsulta(queryUsuario, [id], function (resultUsuario) {
    resultado_final.usuario = resultUsuario[0];

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
    realizarConsulta(queryNodos, [id, id, id], function (resultNodos) {
      resultado_final.nodos = resultNodos.map(nodo => ({ idnodo: nodo.idnodo }));

      // Retornar el objeto final como respuesta
      res.json(resultado_final);
    });
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
