/*
 * Sistema de Monitoreo GPS + OBD-II
 * Hardware: Arduino Uno + ELM327 + GPS NEO-6M + SIM800L
 * Versión: 2.0
 * 
 * Características:
 * - Lectura de datos OBD-II (velocidad, RPM, temperatura, combustible)
 * - GPS con coordenadas precisas
 * - Transmisión por GSM/4G
 * - Modo de bajo consumo
 * - Manejo de errores robusto
 */

#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>

// Configuración de pines
#define OBD_RX 2
#define OBD_TX 3
#define GPS_RX 4
#define GPS_TX 5
#define GSM_RX 6
#define GSM_TX 7
#define LED_PIN 13
#define POWER_PIN 8

// Configuración del sistema
#define VEHICLE_ID "VEH001"
#define SERVER_URL "http://tu-servidor.com:3000/api/vehicle-data"
#define TRANSMISSION_INTERVAL 30000  // 30 segundos
#define GPS_TIMEOUT 10000           // 10 segundos
#define OBD_TIMEOUT 5000            // 5 segundos
#define MAX_RETRIES 3

// Objetos de comunicación
SoftwareSerial obdSerial(OBD_RX, OBD_TX);
SoftwareSerial gpsSerial(GPS_RX, GPS_TX);
SoftwareSerial gsmSerial(GSM_RX, GSM_TX);
TinyGPSPlus gps;

// Variables globales
struct VehicleData {
  float latitude = 0.0;
  float longitude = 0.0;
  float speed = 0.0;
  int rpm = 0;
  int temperature = 0;
  int fuelLevel = 0;
  float batteryVoltage = 0.0;
  int engineLoad = 0;
  int throttlePosition = 0;
  float heading = 0.0;
  float altitude = 0.0;
  int satellites = 0;
  float hdop = 0.0;
  bool isEngineOn = false;
  unsigned long timestamp = 0;
  bool gpsValid = false;
  bool obdValid = false;
};

VehicleData currentData;
unsigned long lastTransmission = 0;
unsigned long lastGpsUpdate = 0;
unsigned long lastObdUpdate = 0;
int transmissionRetries = 0;
bool systemInitialized = false;

void setup() {
  Serial.begin(9600);
  obdSerial.begin(38400);
  gpsSerial.begin(9600);
  gsmSerial.begin(9600);
  
  // Configurar pines
  pinMode(LED_PIN, OUTPUT);
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, HIGH);
  
  Serial.println("========================================");
  Serial.println("🚗 Sistema de Monitoreo GPS + OBD-II");
  Serial.println("Versión: 2.0");
  Serial.println("========================================");
  
  // Inicializar sistema
  initializeSystem();
}

void loop() {
  // Leer datos GPS
  readGPSData();
  
  // Leer datos OBD-II
  readOBDData();
  
  // Verificar estado del sistema
  checkSystemStatus();
  
  // Transmitir datos
  if (shouldTransmit()) {
    transmitData();
  }
  
  // Actualizar LED de estado
  updateStatusLED();
  
  delay(1000);
}

void initializeSystem() {
  Serial.println("🔧 Inicializando sistema...");
  
  // Inicializar GSM
  if (initializeGSM()) {
    Serial.println("✅ GSM inicializado correctamente");
  } else {
    Serial.println("❌ Error inicializando GSM");
  }
  
  // Inicializar OBD-II
  if (initializeOBD()) {
    Serial.println("✅ OBD-II inicializado correctamente");
  } else {
    Serial.println("❌ Error inicializando OBD-II");
  }
  
  // Esperar GPS
  Serial.println("🛰️ Esperando señal GPS...");
  unsigned long gpsStartTime = millis();
  while (millis() - gpsStartTime < GPS_TIMEOUT) {
    readGPSData();
    if (currentData.gpsValid) {
      Serial.println("✅ GPS inicializado correctamente");
      break;
    }
    delay(100);
  }
  
  systemInitialized = true;
  Serial.println("🎉 Sistema inicializado completamente");
}

bool initializeGSM() {
  Serial.println("📡 Inicializando GSM...");
  
  // Comandos básicos de inicialización
  const char* commands[] = {
    "AT",
    "AT+CPIN?",
    "AT+CREG?",
    "AT+CGATT?",
    "AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"",
    "AT+SAPBR=3,1,\"APN\",\"internet\"",
    "AT+SAPBR=1,1"
  };
  
  for (int i = 0; i < 7; i++) {
    gsmSerial.println(commands[i]);
    delay(2000);
    
    String response = readGSMResponse();
    if (response.indexOf("OK") == -1 && response.indexOf("ERROR") != -1) {
      Serial.println("❌ Error en comando GSM: " + String(commands[i]));
      return false;
    }
  }
  
  return true;
}

bool initializeOBD() {
  Serial.println("🔌 Inicializando OBD-II...");
  
  // Comandos de inicialización OBD-II
  const char* commands[] = {
    "ATZ",    // Reset
    "ATL0",   // Echo off
    "ATE0",   // Echo off
    "ATSP0",  // Protocolo automático
    "0100"    // Test de comunicación
  };
  
  for (int i = 0; i < 5; i++) {
    obdSerial.println(commands[i]);
    delay(2000);
    
    String response = readOBDResponse();
    if (i == 4 && response.indexOf("41 00") == -1) {
      Serial.println("❌ Error en comunicación OBD-II");
      return false;
    }
  }
  
  return true;
}

void readGPSData() {
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid()) {
        currentData.latitude = gps.location.lat();
        currentData.longitude = gps.location.lng();
        currentData.speed = gps.speed.kmph();
        currentData.heading = gps.course.deg();
        currentData.altitude = gps.altitude.meters();
        currentData.satellites = gps.satellites.value();
        currentData.hdop = gps.hdop.value();
        currentData.gpsValid = true;
        lastGpsUpdate = millis();
        
        Serial.println("🛰️ GPS: " + String(currentData.latitude, 6) + 
                      ", " + String(currentData.longitude, 6) + 
                      " (" + String(currentData.satellites) + " satélites)");
      }
    }
  }
  
  // Verificar timeout GPS
  if (millis() - lastGpsUpdate > GPS_TIMEOUT) {
    currentData.gpsValid = false;
  }
}

void readOBDData() {
  if (millis() - lastObdUpdate < 5000) return; // Leer cada 5 segundos
  
  // Leer velocidad
  currentData.speed = readOBDParameter("010D", 1.0);
  
  // Leer RPM
  currentData.rpm = readOBDParameter("010C", 4.0);
  
  // Leer temperatura del motor
  currentData.temperature = readOBDParameter("0105", 1.0) - 40;
  
  // Leer nivel de combustible
  currentData.fuelLevel = (readOBDParameter("012F", 1.0) * 100) / 255;
  
  // Leer voltaje de batería
  currentData.batteryVoltage = readOBDParameter("0142", 0.1);
  
  // Leer carga del motor
  currentData.engineLoad = (readOBDParameter("0104", 1.0) * 100) / 255;
  
  // Leer posición del acelerador
  currentData.throttlePosition = (readOBDParameter("0111", 1.0) * 100) / 255;
  
  // Determinar si el motor está encendido
  currentData.isEngineOn = currentData.rpm > 0;
  
  currentData.obdValid = true;
  lastObdUpdate = millis();
  
  Serial.println("🔧 OBD: RPM=" + String(currentData.rpm) + 
                ", Vel=" + String(currentData.speed) + 
                ", Temp=" + String(currentData.temperature) + "°C");
}

float readOBDParameter(String pid, float multiplier) {
  obdSerial.println(pid);
  delay(1000);
  
  String response = readOBDResponse();
  
  if (response.length() > 0 && response.indexOf("41 " + pid) != -1) {
    // Extraer valor hexadecimal
    String hexValue = response.substring(4, 8);
    int value = strtol(hexValue.c_str(), NULL, 16);
    return value * multiplier;
  }
  
  return 0.0;
}

String readOBDResponse() {
  String response = "";
  unsigned long startTime = millis();
  
  while (millis() - startTime < OBD_TIMEOUT) {
    if (obdSerial.available()) {
      char c = obdSerial.read();
      if (c != '\r' && c != '\n') {
        response += c;
      }
    }
  }
  
  return response;
}

String readGSMResponse() {
  String response = "";
  unsigned long startTime = millis();
  
  while (millis() - startTime < 5000) {
    if (gsmSerial.available()) {
      char c = gsmSerial.read();
      if (c != '\r' && c != '\n') {
        response += c;
      }
    }
  }
  
  return response;
}

bool shouldTransmit() {
  return (millis() - lastTransmission > TRANSMISSION_INTERVAL) && 
         (currentData.gpsValid || currentData.obdValid);
}

void transmitData() {
  if (transmissionRetries >= MAX_RETRIES) {
    Serial.println("❌ Máximo de reintentos alcanzado");
    transmissionRetries = 0;
    lastTransmission = millis();
    return;
  }
  
  Serial.println("📤 Transmitiendo datos...");
  
  // Crear JSON con los datos
  DynamicJsonDocument doc(1024);
  doc["lat"] = currentData.latitude;
  doc["lng"] = currentData.longitude;
  doc["speed"] = currentData.speed;
  doc["rpm"] = currentData.rpm;
  doc["temp"] = currentData.temperature;
  doc["fuel"] = currentData.fuelLevel;
  doc["battery"] = currentData.batteryVoltage;
  doc["engineLoad"] = currentData.engineLoad;
  doc["throttle"] = currentData.throttlePosition;
  doc["heading"] = currentData.heading;
  doc["altitude"] = currentData.altitude;
  doc["satellites"] = currentData.satellites;
  doc["hdop"] = currentData.hdop;
  doc["timestamp"] = millis();
  
  String jsonData;
  serializeJson(doc, jsonData);
  
  Serial.println("📊 Datos: " + jsonData);
  
  // Enviar por HTTP POST
  if (sendHTTPPost(jsonData)) {
    Serial.println("✅ Datos transmitidos correctamente");
    transmissionRetries = 0;
    lastTransmission = millis();
  } else {
    Serial.println("❌ Error transmitiendo datos");
    transmissionRetries++;
  }
}

bool sendHTTPPost(String data) {
  // Configurar HTTP
  gsmSerial.println("AT+HTTPINIT");
  delay(2000);
  
  gsmSerial.println("AT+HTTPPARA=\"URL\",\"" + String(SERVER_URL) + "\"");
  delay(2000);
  
  gsmSerial.println("AT+HTTPPARA=\"CONTENT\",\"application/json\"");
  delay(2000);
  
  gsmSerial.println("AT+HTTPPARA=\"USERDATA\",\"vehicle-id: " + String(VEHICLE_ID) + "\"");
  delay(2000);
  
  gsmSerial.println("AT+HTTPDATA=" + String(data.length()) + ",10000");
  delay(2000);
  
  gsmSerial.println(data);
  delay(2000);
  
  gsmSerial.println("AT+HTTPACTION=1");
  delay(5000);
  
  String response = readGSMResponse();
  Serial.println("📡 Respuesta HTTP: " + response);
  
  gsmSerial.println("AT+HTTPTERM");
  delay(1000);
  
  return response.indexOf("200") != -1;
}

void checkSystemStatus() {
  // Verificar estado GPS
  if (!currentData.gpsValid && millis() - lastGpsUpdate > GPS_TIMEOUT) {
    Serial.println("⚠️ GPS sin señal");
  }
  
  // Verificar estado OBD-II
  if (!currentData.obdValid && millis() - lastObdUpdate > OBD_TIMEOUT) {
    Serial.println("⚠️ OBD-II sin comunicación");
  }
  
  // Verificar estado del motor
  if (currentData.isEngineOn && currentData.speed == 0) {
    Serial.println("⚠️ Motor encendido sin movimiento");
  }
}

void updateStatusLED() {
  static unsigned long lastBlink = 0;
  static bool ledState = false;
  
  if (millis() - lastBlink > 1000) {
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
    lastBlink = millis();
  }
}

// Función de utilidad para debugging
void printSystemStatus() {
  Serial.println("========================================");
  Serial.println("📊 Estado del Sistema");
  Serial.println("========================================");
  Serial.println("GPS Válido: " + String(currentData.gpsValid ? "Sí" : "No"));
  Serial.println("OBD Válido: " + String(currentData.obdValid ? "Sí" : "No"));
  Serial.println("Motor: " + String(currentData.isEngineOn ? "Encendido" : "Apagado"));
  Serial.println("Satélites: " + String(currentData.satellites));
  Serial.println("Última transmisión: " + String((millis() - lastTransmission) / 1000) + "s");
  Serial.println("Reintentos: " + String(transmissionRetries));
  Serial.println("========================================");
}
