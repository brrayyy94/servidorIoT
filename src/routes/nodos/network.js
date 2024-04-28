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


//rutas para ultrasonido (get, post, delete, put)
router.get("/datosUltrasonido", (req, res) => {
  var json1 = {}; //variable para almacenar cada registro que se lea, en  formato json
  var arreglo = []; //variable para almacenar todos los datos, en formato arreglo de json
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //si no se pudo conectar
    } else {
      console.log("Conexion correcta.");
      //ejecución de la consulta
      tempConn.query(
        "SELECT * FROM datosUltrasonido where id = 1",
        function (error, result) {
          var resultado = result; //se almacena el resultado de la consulta en la variable resultado
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release(); //se librea la conexión
            for (i = 0; i < resultado.length; i++) {
              //se lee el resultado y se arma el json
              json1 = {
                id: resultado[i].id,
                idnodo: resultado[i].idnodo,
                distancia: resultado[i].distancia,
                fechahora: resultado[i].fechahora,
              };
              console.log(json1); //se muestra el json en la consola
              arreglo.push(json1); //se añade el json al arreglo
            }
            res.json(arreglo); //se retorna el arreglo
          }
        }
      );
    }
  });
});

// Ruta GET para obtener datos de `datosUltrasonido` filtrados por `idnodo`
router.get("/datosUltrasonido/:idnodo", (req, res) => {
  const { idnodo } = req.params; // Obtener el parámetro `idnodo`

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      // Consulta para obtener datos de `datosUltrasonido` filtrados por `idnodo`
      const query = `
          SELECT * FROM datosUltrasonido
          WHERE DATE(fechahora) = CURDATE() AND idnodo = ?`;

      tempConn.query(query, [idnodo], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release(); // Liberar la conexión

          if (result.length > 0) {
            res.json(result); // Devolver los registros como respuesta JSON
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

router.post("/datosUltrasonido", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "INSERT INTO datosultrasonido VALUES(null, ?, ?, ?, now())",
        [json1.usuario_id, json1.idnodo, json1.distancia],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos almacenados`); //mensaje de respuesta al cliente
});

router.delete("/datosUltrasonido", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "DELETE FROM datosultrasonido WHERE idnodo = ?",
        [json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
            res.status(500).send(error.message);
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos eliminados`); //mensaje de respuesta al cliente
});

router.put("/datosUltrasonido", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "UPDATE datosultrasonido SET distancia = ? WHERE idnodo = ?",
        [json1.distancia, json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos actualizados`); //mensaje de respuesta al cliente
});

// Ruta GET para obtener datos de `datosPeso` filtrados por `idnodo`
router.get("/datosPeso/:idnodo", (req, res) => {
  const { idnodo } = req.params;

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      // Consulta para obtener datos de `datosPeso` filtrados por `idnodo`
      const query = `
          SELECT * FROM datosPeso
          WHERE DATE(fechahora) = CURDATE() AND idnodo = ?`;

      tempConn.query(query, [idnodo], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release(); // Liberar la conexión

          if (result.length > 0) {
            res.json(result); // Devolver los registros como respuesta JSON
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

router.post("/datosPeso", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "INSERT INTO datospeso VALUES(null, ?, ?, ?, now())",
        [json1.usuario_id, json1.idnodo, json1.peso],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos almacenados`); //mensaje de respuesta al cliente
});

router.delete("/datosPeso", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "DELETE FROM datospeso WHERE idnodo = ?",
        [json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos eliminados`); //mensaje de respuesta al cliente
});

router.put("/datosPeso", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "UPDATE datospeso SET peso = ? WHERE idnodo = ?",
        [json1.peso, json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos actualizados`); //mensaje de respuesta al cliente
});


//rutas para infrarrojo (get, post, delete, put)
// router.post("/datosInfrarrojo", (req, res) => {
//   var json1 = req.body;
//   var arreglo = []; //variable para almacenar todos los datos, en formato arreglo de json
//   connection.getConnection(function (error, tempConn) {
//     //conexion a mysql
//     if (error) {
//       throw error; //si no se pudo conectar
//     } else {
//       console.log("Conexion correcta.");
//       //ejecución de la consulta
//       const query = `SELECT di.id, di.idnodo, di.actividad, di.fechahora
//       FROM usuarios u
//       JOIN datosinfrarrojo di ON u.id = di.usuario_id
//       WHERE u.id = ? AND DATE(fechahora) = CURDATE()`;
//       tempConn.query(query, [json1.userid], function (error, result) {
//         var resultado = result; //se almacena el resultado de la consulta en la variable resultado
//         if (error) {
//           throw error;
//         } else {
//           tempConn.release(); //se librea la conexión
//           for (i = 0; i < resultado.length; i++) {
//             //se lee el resultado y se arma el json
//             json1 = {
//               id: resultado[i].id,
//               idnodo: resultado[i].idnodo,
//               actividad: resultado[i].actividad,
//               fechahora: resultado[i].fechahora,
//             };
//             console.log(json1); //se muestra el json en la consola
//             arreglo.push(json1); //se añade el json al arreglo
//           }
//           res.json(arreglo); //se retorna el arreglo
//         }
//       });
//     }
//   });
// });

// Ruta GET para obtener datos de `datosInfrarrojo` filtrados por `idnodo`
router.get("/datosInfrarrojo/:idnodo", (req, res) => {
  const { idnodo } = req.params; // Obtener el parámetro `idnodo` de la solicitud

  connection.getConnection((error, tempConn) => {
    if (error) {
      res.status(500).send("Error al conectar a la base de datos.");
    } else {
      console.log("Conexión correcta.");

      // Consulta para obtener todos los datos del día actual filtrados por `idnodo`
      const query = `
          SELECT * FROM datosInfrarrojo
          WHERE DATE(fechahora) = CURDATE() AND idnodo = ?`;

      tempConn.query(query, [idnodo], (error, result) => {
        if (error) {
          res.status(500).send("Error en la ejecución del query.");
        } else {
          tempConn.release(); // Liberar la conexión

          if (result.length > 0) {
            res.json(result); // Devolver los registros filtrados como respuesta JSON
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

router.post("/datosInfrarrojo", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "INSERT INTO datosinfrarrojo VALUES(null, ?, ?, ?, now())",
        [json1.usuario_id, json1.idnodo, json1.actividad],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos almacenados`); //mensaje de respuesta al cliente
});

router.delete("/datosInfrarrojo", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "DELETE FROM datosinfrarrojo WHERE idnodo = ?",
        [json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos eliminados`); //mensaje de respuesta al cliente
});

router.put("/datosInfrarrojo", (req, res) => {
  var json1 = req.body; //se recibe el json con los datos
  console.log(json1); //se muestra en consola
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //en caso de error en la conexion
    } else {
      console.log("Conexion correcta.");
      tempConn.query(
        "UPDATE datosinfrarrojo SET actividad = ? WHERE idnodo = ?",
        [json1.actividad, json1.idnodo],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            res.status(500).send(error.message);
          } else {
            tempConn.release();
          }
          //client.end() //si se habilita esta opción el servicio termina
        }
      );
    }
  });
  res.status(200).send(`datos actualizados`); //mensaje de respuesta al cliente
});

module.exports = router;
