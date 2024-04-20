var mqtt = require("mqtt");
const mysql = require("mysql");

const express = require("express"); //se indica que se requiere express
const app = express(); // se inicia express y se instancia en una constante de  nombre app.
const morgan = require("morgan"); //se indica que se requiere morgan
// settings

app.set("port", 3000); //se define el puerto en el cual va a funcionar el servidor;
// Utilities
app.use(morgan("dev")); //se indica que se va a usar morgan en modo dev

app.use(express.json()); //se indica que se va a usar la funcionalidad para manejo de json de express

//Routes
app.use(require("./routes/datos.js"));

//var client = mqtt.connect('mqtt://localhost)
var client = mqtt.connect("mqtt://broker.mqtt-dashboard.com");

const connection = mysql.createPool({
  connectionLimit: 500,
  host: "localhost",
  user: "root",
  password: "", //el password de ingreso a mysql
  database: "calidatos",
  port: 3306,
});

client.on("connect", function () {
  client.subscribe("brayan.maca@uao.edu.co/SensorIR", function (err) {
    if (err) {
      console.log("error en la subscripcion");
    } else {
      console.log("Subscripcion exitosa");
    }
  });
  client.subscribe("brayan.maca@uao.edu.co/SensorUltrasonido", function (err) {
    if (err) {
      console.log("error en la subscripcion");
    } else {
      console.log("Subscripcion exitosa");
    }
  });
  client.subscribe("brayan.maca@uao.edu.co/SensorPeso", function (err) {
    if (err) {
      console.log("error en la subscripcion");
    } else {
      console.log("Subscripcion exitosa");
    }
  });
});

client.on("message", function (topic, message) {
  // message is Buffer
  json1 = JSON.parse(message.toString());
  console.log(json1);
  let sensor = json1.sensor;
  if (sensor == "Infrarrojo") {
    connection.getConnection(function (error, tempConn) {
      //conexion a mysql
      if (error) {
        //throw error; //en caso de error en la conexion
      } else {
        console.log("Conexion correcta.");
        tempConn.query(
          "INSERT INTO datosinfrarrojo VALUES(null, ?, ?, now())",
          [json1.id, json1.valueInfrarrojo],
          function (error, result) {
            //se ejecuta lainserción
            if (error) {
              throw error;
              console.log("error al ejecutar el query"); //esto no se esta ejecutando
            } else {
              tempConn.release();
              console.log("datos almacenados"); //mensaje de respuesta en consola
            }
            //client.end() //si se habilita esta opción el servicio termina
          }
        );
      }
    });
  } else if (sensor == "Ultrasonido") {
    connection.getConnection(function (error, tempConn) {
      //conexion a mysql
      if (error) {
        //throw error; //en caso de error en la conexion
      } else {
        console.log("Conexion correcta.");
        tempConn.query(
          "INSERT INTO datosultrasonido VALUES(null, ?, ?, now())",
          [json1.id, json1.valueUltrasonido],
          function (error, result) {
            //se ejecuta lainserción
            if (error) {
              throw error;
              console.log("error al ejecutar el query"); //esto no se esta ejecutando
            } else {
              tempConn.release();
              console.log("datos almacenados"); //mensaje de respuesta en consola
            }
            //client.end() //si se habilita esta opción el servicio termina
          }
        );
      }
    });
  } else if (sensor == "Peso") {
    connection.getConnection(function (error, tempConn) {
      //conexion a mysql
      if (error) {
        //throw error; //en caso de error en la conexion
      } else {
        console.log("Conexion correcta.");
        tempConn.query(
          "INSERT INTO datosPeso VALUES(null, ?, ?, now())",
          [json1.id, json1.valuePeso],
          function (error, result) {
            //se ejecuta lainserción
            if (error) {
              throw error;
              console.log("error al ejecutar el query"); //esto no se esta ejecutando
            } else {
              tempConn.release();
              console.log("datos almacenados"); //mensaje de respuesta en consola
            }
            //client.end() //si se habilita esta opción el servicio termina
          }
        );
      }
    });
  }
  var distance = json1.valueUltrasonido;

  if (distance >= 30) {
    json2 = { estadoVs: "vacio" };
  } else {
    json2 = { estadoVs: 0 };
  }
  //client.publish("brayan.maca@uao.edu.co/topico2", JSON.stringify(json2));

  //client.end() //si se habilita esta opción el servicio termina
});

//Start server
app.listen(app.get("port"), () => {
  console.log(`Servidor funcionando port http://localhost:${app.get("port")}`);
});
