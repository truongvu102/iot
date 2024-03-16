const mqtt = require('mqtt');
const WebSocket = require('ws');

const mqttBroker = 'mqtt://192.168.43.63';


const mqttTopic = 'DHT';

const mqttClient = mqtt.connect(mqttBroker);

const wss = new WebSocket.Server({ port: 3000 }); 

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  mqttClient.subscribe(mqttTopic);

  mqttClient.on('message', (topic, message) => {
    if (topic === mqttTopic) {
      const data = message.toString();
      console.log(`MQTT sub: ${data}`);
      ws.send(data);
    }
  });



  ws.on('message', (message) => {
    console.log(`Nhận từ client WebSocket: ${message}`);
  
    try {
      const jsonData = JSON.parse(message);
  
      
      if (jsonData.action && jsonData.deviceId) {
       
        mqttClient.publish(jsonData.action, jsonData.deviceId);
      
      } else {
        console.log('Định dạng JSON không hợp lệ. Cần có các thuộc tính: action, deviceId');
      }
    } catch (error) {
      console.error('Lỗi khi phân tích JSON:', error);
    }
  });
  
  



  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    mqttClient.unsubscribe(mqttTopic);
  });
});

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('offline', () => {
  console.log('Disconnected from MQTT broker');
});

mqttClient.on('error', (error) => {
  console.error('MQTT error:', error);
});

process.stdin.resume();

process.on('SIGINT', () => {
  console.log('Disconnecting from MQTT broker');
  mqttClient.end();
  wss.close();
  process.exit();
});
