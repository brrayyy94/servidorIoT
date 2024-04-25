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

//rutas para infrarrojo (get, post, delete, put)
router.get("/datosInfrarrojo", (req, res) => {
  var json1 = {}; //variable para almacenar cada registro que se lea, en  formato json
  var arreglo = []; //variable para almacenar todos los datos, en formato arreglo de json
  connection.getConnection(function (error, tempConn) {
    //conexion a mysql
    if (error) {
      throw error; //si no se pudo conectar
    } else {
      console.log("Conexion correcta.");
      //ejecución de la consulta
      tempConn.query("SELECT * FROM datosinfrarrojo", function (error, result) {
        var resultado = result; //se almacena el resultado de la consulta en la variable resultado
        if (error) {
          throw error;
          res.send("error en la ejecución del query");
        } else {
          tempConn.release(); //se librea la conexión
          for (i = 0; i < resultado.length; i++) {
            //se lee el resultado y se arma el json
            json1 = {
              id: resultado[i].id,
              idnodo: resultado[i].idnodo,
              actividad: resultado[i].actividad,
              fechahora: resultado[i].fechahora,
            };
            console.log(json1); //se muestra el json en la consola
            arreglo.push(json1); //se añade el json al arreglo
          }
          res.json(arreglo); //se retorna el arreglo
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
        "INSERT INTO datosinfrarrojo VALUES(null, ?, ?, now())",
        [json1.idnodo, json1.actividad],
        function (error, result) {
          //se ejecuta lainserción
          if (error) {
            throw error;
            console.log("error al ejecutar el query"); //esto no se esta ejecutando
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
            throw error;
            console.log("error al ejecutar el query"); //esto no se esta ejecutando
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
            throw error;
            console.log("error al ejecutar el query"); //esto no se esta ejecutando
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
      tempConn.query("SELECT * FROM datosUltrasonido where id = 1", function (error, result) {
        var resultado = result; //se almacena el resultado de la consulta en la variable resultado
        if (error) {
          throw error;
          res.send("error en la ejecución del query");
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
      });
    }
  });
});


module.exports = router;