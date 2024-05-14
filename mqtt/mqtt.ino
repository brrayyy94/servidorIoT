// definir librerias
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFi.h>
#include <HX711.h>
#include <Wire.h>
#include <TimeLib.h>
#include <DS3231.h> // Incluir la librería RTC DS3231
#include "time.h"
#include <ESP32Servo.h>

#define mqttUser "brayan.maca@uao.edu.co"
#define mqttPass "Megustamaqiatto09!"
#define mqttPort 1883
#define Led 2

//se define el usuario y el nodo al que se enviaran los datos
int usuario_id = 1;
int idnodo = 1;

String timeinfo;
// const char* ssid = "iPhone de Brayan";          //ssid de la red inalambrica
// const char* password = "brrayyy09";
// const char* ssid = "jhojan";                                   //ssid de la red inalambrica
// const char* password = "123456789";
const char *ssid = "MARLUGO";                                 // ssid de la red inalambrica
const char *password = "5573061m";                            // password para conectarse a la red
char mqttBroker[] = "broker.mqtt-dashboard.com";              // ip del servidor
char mqttClientId[] = "f51c28ee-515c-480d-a012-39c7b2b91fc7"; // cualquier nombre
char inTopicIR[] = "brayan.maca@uao.edu.co/SensorIR";
char inTopicUltrasonido[] = "brayan.maca@uao.edu.co/SensorUltrasonido";
char inTopicPeso[] = "brayan.maca@uao.edu.co/SensorPeso";

// HORA
const char *ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;
const int daylightOffset_sec = 3600;

// ServomMotor
#define miServo 33 // Sin punto y coma al final
Servo myServo;
// Sensor ultrasonido
#define trigPin 13
#define echoPin 12
long duration;
int distance;
// Sensor de Distancia por Infrarrojo
#define IR_PIN 14 // Pin para el sensor de infrarrojos
int irValue = 1;
int count = 0;

// Sensor de Peso (Celda de Carga)
#define LOADCELL_DOUT_PIN 26
#define LOADCELL_SCK_PIN 25
HX711 scale;

void callback(char *topic, byte *payload, unsigned int length)
{
  payload[length] = '\0'; // Asegura que el payload termina correctamente

  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  String message = String((char *)payload);
  Serial.println(message);

  StaticJsonDocument<500> doc; // Aumentar el tamaño si es necesario
  DeserializationError error = deserializeJson(doc, message);

  if (error)
  {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.c_str());
    return;
  }

  int action = doc["accionDispensador"];
  if (action == 1)
  {
    myServo.write(90); // Mueve el servo a 90 grados
    delay(10000);      // Espera 10 segundos
    myServo.write(0);  // Mueve el servo a 0 grados
  }
}

WiFiClient BClient;
PubSubClient client(BClient);

unsigned long hora()
{
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo))
  {
    Serial.println("Error al obtener la hora");
    return (0);
  }
  time(&now);
  return now;
}

void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect(mqttClientId, mqttUser, mqttPass))
    {
      Serial.println("connected"); // Once connected, publish an anouncement.
      client.subscribe("brayan.maca@uao.edu.co/topico2");
      client.subscribe("accionDispensador");

      // ... and resubscribe
      // client.subscribe("topic2");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void setup()
{
  myServo.setPeriodHertz(50); // Servo controla a 50 Hz
  myServo.attach(miServo);    // Asocia el pin del servo con el objeto Servo
  Serial.begin(9600);         // Serial connection
  setup_wifi();               // WiFi connection
  client.setServer(mqttBroker, mqttPort);
  client.setCallback(callback);
  Serial.println("Setup done");
  pinMode(Led, OUTPUT);
  delay(1500);
  // Inicializar el sensor de infrarrojos como entrada
  pinMode(IR_PIN, INPUT);

  // Configura los pines de TRIG y ECHO
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Inicializar el sensor de peso
  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  scale.set_scale(); // Necesitarás calibrar esta escala
  scale.tare();      // Resetear la escala a 0

  Serial.println("Iniciando sensores...");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
}

void setup_wifi()
{
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
void loop()
{

  if (!client.connected())
  {
    reconnect();
  }
  client.loop();
  // Crear un objeto JSON StaticJsonDocument con capacidad suficiente
  StaticJsonDocument<256> jsonIR;
  StaticJsonDocument<256> jsonWeight;
  StaticJsonDocument<256> jsonDistance;
  StaticJsonDocument<256> jsonAccionTapa;
  String variable;

  unsigned long t_unix_date1 = hora() - 18000;
  // Obtener la fecha y hora en formato legible
  String fecha_hora = String(year(t_unix_date1)) + "/" + String(month(t_unix_date1)) + "/" + String(day(t_unix_date1)) + " " + String(hour(t_unix_date1)) + ":" + String(minute(t_unix_date1)) + ":" + String(second(t_unix_date1));

  // Leer del sensor de infrarrojos
  irValue = digitalRead(IR_PIN);
  // el mensaje se envia cuando hay presencia
  if (irValue == 0)
  {
    count++;
    if (count == 3)
    {
      jsonAccionTapa["usuario_id"] = usuario_id;
      jsonAccionTapa["idnodo"] = idnodo;
      jsonAccionTapa["estadoTapa"] = 0;
      jsonAccionTapa["Fecha y Hora"] = fecha_hora;
      serializeJsonPretty(jsonAccionTapa, variable);
      int accion = variable.length() + 1;
      Serial.println(variable);
      char datojson1[accion];
      variable.toCharArray(datojson1, accion);
      client.publish("accionTapa", datojson1);
      Serial.print("Puerta abierta por 1 minuto");
      Serial.println();
      count = 0;
    }
    jsonIR["usuario_id"] = usuario_id;
    jsonIR["idnodo"] = idnodo;
    jsonIR["sensor"] = "Infrarrojo";
    jsonIR["valueInfrarrojo"] = 1;
    jsonIR["Fecha y Hora"] = fecha_hora;
    serializeJsonPretty(jsonIR, variable);
    int lonIR = variable.length() + 1;
    Serial.println(variable);
    char datojson1[lonIR];
    variable.toCharArray(datojson1, lonIR);
    client.publish(inTopicIR, datojson1);
    Serial.println();
  }
  delay(1000);

  // Leer del sensor de ultrasonido
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  int porcentajeDistancia = map(distance, 5, 30, 100, 0);
  porcentajeDistancia = constrain(porcentajeDistancia, 0, 100);

  jsonDistance["usuario_id"] = usuario_id;
  jsonDistance["idnodo"] = idnodo;
  jsonDistance["sensor"] = "Ultrasonido";
  jsonDistance["valueUltrasonido"] = porcentajeDistancia;
  jsonDistance["Fecha y Hora"] = fecha_hora;
  serializeJsonPretty(jsonDistance, variable);
  int lonUltrasonido = variable.length() + 1;
  Serial.println(variable);
  char datojson2[lonUltrasonido];
  variable.toCharArray(datojson2, lonUltrasonido);
  client.publish(inTopicUltrasonido, datojson2);
  Serial.println();
  delay(1000);

  // Leer del sensor de peso
  float weight = scale.get_units(2); // Lee el peso en unidades. Cambiar el '5' por el número de lecturas que desees promediar
                                     // if (hour(t_unix_date1) == 11 && minute(t_unix_date1) == 46 && second(t_unix_date1) == 20) {
  //  if (weight == 0){
  //  Serial.println("Plato vacio, dispensar");
  //}
  jsonWeight["usuario_id"] = usuario_id;
  jsonWeight["idnodo"] = idnodo;
  jsonWeight["sensor"] = "Peso";
  jsonWeight["valuePeso"] = weight;
  jsonWeight["Fecha y Hora"] = fecha_hora;
  serializeJsonPretty(jsonWeight, variable);
  int lonPeso = variable.length() + 1;
  Serial.println(variable);
  char datojson3[lonPeso];
  variable.toCharArray(datojson3, lonPeso);
  client.publish(inTopicPeso, datojson3);
  //}
  delay(1000);
  Serial.println();
}