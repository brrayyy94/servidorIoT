var mqtt = require('mqtt') 
const mysql = require('mysql');

//var client = mqtt.connect('mqtt://localhost) 
var client = mqtt.connect('mqtt://broker.mqtt-dashboard.com') 
// se crea la conexión a mysql 
const connection = mysql.createPool({ 
    connectionLimit: 500, 
    host: 'localhost', 
    user: 'root', 
    password: '', //el password de ingreso a mysql 
    database: 'calidatos', port: 3306 
}); 

client.on('connect', function () { 
    client.subscribe('topico1', function (err) { 
        if (err) { 
            console.log("error en la subscripcion") 
        } 
    }) 
}) 

client.on('message', function (topic, message) { 
    // message is Buffer 
    json1 = JSON.parse(message.toString()); 
    
    console.log(json1); 
    var distance = json1.valueUltrasonido; 
    
    if (distance >= 30) { 
        json2 = { "estado": "vacio" }; 
    } else { 
        json2 = { "estado": 0 }; 
    } 
    
    client.publish('topico2', JSON.stringify(json2)); 
    
    connection.getConnection(function (error, tempConn) { 
        //conexion a mysql 
        if (error) { 
            //throw error; //en caso de error en la conexion 
        } 
        else { 
            console.log('Conexion correcta.'); 
            tempConn.query('INSERT INTO datosnodo VALUES(null, ?, ?,?, now())', [json1.idnodo, json1.temperatura, json1.humedad], function (error, result) 
            { //se ejecuta lainserción 
                if (error) { throw error;
                    console.log("error al ejecutar el query"); } else { tempConn.release(); console.log("datos almacenados"); //mensaje de respuesta en consola 
                } 
                //client.end() //si se habilita esta opción el servicio termina 
            });
        }
    }); 
})