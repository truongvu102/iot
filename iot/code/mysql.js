const WebSocket = require('ws');
const mysql = require('mysql2');


const dbConnection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sensor_data'
});


dbConnection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});


const socket = new WebSocket('ws://localhost:3000');


socket.addEventListener('open', (event) => {
  console.log('WebSocket connected');
});


socket.addEventListener('message', (event) => {
  try {
    
    const data = JSON.parse(event.data);

    
    if (data && data.temperature_C !== undefined && data.humidity_percent !== undefined && data.light_lux !== undefined) {
     
      const nhietDo = data.temperature_C;
      const doAm = data.humidity_percent;
      const anhSang = data.light_lux;

     
      const sql = "INSERT INTO dhtlight (temperature, humidity, light) VALUES (?, ?, ?)";
      const values = [nhietDo, doAm, anhSang];

      dbConnection.query(sql, values, (err, result) => {
        if (err) {
          console.error('Error inserting data into MySQL:', err);
        } else {
          console.log('Data inserted into MySQL');
        }
      });
    } else {
      
      console.error('Invalid data format:', data);
    }
  } catch (error) {
    
    console.error('Error parsing JSON data:', event.data);
  }
});


socket.addEventListener('close', (event) => {
  console.log('WebSocket disconnected');
});
