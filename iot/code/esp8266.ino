#include <ESP8266WiFi.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SH110X.h>
#include <DHT.h>
#include <Servo.h>


#define LIGHT_SENSOR_PIN A0
#define GAS_SENSOR_PIN 2
#define DHTPIN 14
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

#define wifi_ssid "Truong"
#define wifi_password "12345678a"
#define mqtt_server "192.168.43.63"

#define dht_topic "DHT"




#define led1_topic "led1"
#define led2_topic "led2"
#define door_topic "door"
#define coi_topic "coi"

Servo doorServo;
const int ledPin1 = 16;
const int ledPin2 = 0;
const int coi = 13;
const int servo = 12;

WiFiClient espClient;
PubSubClient client(espClient);

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels
#define OLED_RESET -1   //   QT-PY / XIAO
Adafruit_SH1106G display = Adafruit_SH1106G(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(115200);
  pinMode(ledPin1, OUTPUT);
  pinMode(ledPin2, OUTPUT);
  pinMode(coi, OUTPUT);
  doorServo.attach(servo);

  // Initialize the display
  if(!display.begin()) {  // No need for the SSD1306_SWITCHCAPVCC parameter
    Serial.println(F("SH110X allocation failed"));
    for(;;);
  }
  
  delay(2000);
  display.clearDisplay();
  display.setTextColor(SH110X_WHITE);
  
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(wifi_ssid);

  WiFi.begin(wifi_ssid, wifi_password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");

    if (client.connect("ESP8266Client")) {
      Serial.println("connected");
      client.subscribe(led1_topic);
      client.subscribe(led2_topic);
      client.subscribe(door_topic);
      client.subscribe(coi_topic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}



void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");

  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.println(message);

  if (String(topic) == led1_topic) {
    if (message == "ON") {
      digitalWrite(ledPin1, HIGH);
    } else if (message == "OFF") {
      digitalWrite(ledPin1, LOW);
    }
  } else if (String(topic) == led2_topic) {
    if (message == "ON") {
      digitalWrite(ledPin2, HIGH);
    }else if (message == "OFF") {
      digitalWrite(ledPin2, LOW);
    }
  }else if (String(topic) == door_topic) {
     if (message == "OPEN") {
       doorServo.write(180);
    }else if (message == "CLOSE") {
       doorServo.write(0);
    }
  }else if (String(topic) == coi_topic) {
    if (message == "ON") {
      digitalWrite(coi, HIGH);
    }else if (message == "OFF") {
      digitalWrite(coi, LOW);
    }
  }  
}



void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  delay(2000);

  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  DynamicJsonDocument jsonDocument(256);

  jsonDocument["temperature_C"] = t;
  jsonDocument["humidity_percent"] = h;

  int lightIntensity = analogRead(LIGHT_SENSOR_PIN);
  jsonDocument["light_lux"] = lightIntensity;

  int gasValue = digitalRead(GAS_SENSOR_PIN);
  jsonDocument["gas_value"] = gasValue;

  String jsonString;
  serializeJson(jsonDocument, jsonString);



  Serial.print("Humidity: ");
  Serial.print(h);
  Serial.print(" %\t");
  Serial.print("Temperature: ");
  Serial.print(t);
  Serial.print(" *C\t");
  Serial.print("Gas Value: ");
  Serial.print(gasValue);
  Serial.print("\tLight: ");
  Serial.print(lightIntensity);
  Serial.println(" lux\t");

  if (gasValue == 0) {
    canhbao();
  } else {
    tatcanhbao();
  }

  client.publish(dht_topic, jsonString.c_str(), true);
  
  display.clearDisplay();
  
  // display temperature
  display.setTextSize(1);
  display.setCursor(0,0);
  display.print("Temperature: ");
  display.print(t);
  display.print(" ");
  display.cp437(true);
  display.write(167);
  display.print("C");

  // display Humidity
  display.setTextSize(1);
  display.setCursor(0,10);
  display.print("Humidity: ");
  display.print(h);
  display.print(" %");

  // display light
  display.setTextSize(1);
  display.setCursor(0,20);
  display.print("Light: ");
  display.print(lightIntensity);
  display.print(" Lux");
  
  display.setTextSize(2);
  display.setCursor(0,30);
  display.print("Gas ");
  display.print(gasValue);
  display.print(" !!");
  
  display.display();

}
void canhbao() {
  Serial.println("Canh bao phat hien khi Gas");
  digitalWrite(coi, HIGH); 
 
}

void tatcanhbao() {
  digitalWrite(coi, LOW); // Tắt còi
}
