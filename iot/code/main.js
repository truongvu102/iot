let nhietDo = 0;
let doAm = 0;
let anhSang = 0;
let gas = 0;

const dataND=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
const dataDA=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
const dataAS=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]


const socket = new WebSocket('ws://localhost:3000');

socket.addEventListener('open', () => {
    console.log('WebSocket connected');
});

socket.addEventListener('close', () => {
    console.log('WebSocket disconnected');
});

socket.addEventListener('message', (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data && data.temperature_C !== undefined && data.humidity_percent !== undefined && data.light_lux !== undefined && data.gas_value !== undefined) {
           
            let nhietDo = data.temperature_C.toFixed(2);
            let doAm = data.humidity_percent;
            let anhSang = data.light_lux;
            let gas = data.gas_value;

            document.getElementById("ND2").innerHTML = nhietDo + "℃";
            document.getElementById("DA2").innerHTML = doAm + "%";
            document.getElementById("AS2").innerHTML = anhSang + "lux";

            function bieuDo() {
                dataAS.push(anhSang); dataAS.shift();
                dataDA.push(doAm); dataDA.shift();
                dataND.push(nhietDo); dataND.shift();
            }
            bieuDo();

            // ...

            function KTkhigas(gas) {
                if (gas == 0) {
                    document.getElementById("myImage3").src = "baodong.gif"
                var openDoor = confirm('Bạn muốn mở cửa không?');
                if (openDoor == true) {
                    document.getElementById("myImage2").src = "opendoor.png"
                    sendWebSocketData('door', 'OPEN'); 
                    }
                }
            }


            function KTnhietdo(nhietDo) {
                if (nhietDo < 22) {
                    document.getElementById("ND").style.background = "#F8D1AF"
                } else if (nhietDo >= 22 && nhietDo <= 32) {
                    document.getElementById("ND").style.background = "#F7AD6E"
                } else if (nhietDo > 32) {
                    document.getElementById("ND").style.background = "#F37D1A"
                }
            }

            function KTdoam(doAm) {
                if (doAm < 36) {
                    document.getElementById("DA").style.background = "#D5F9F7"
                } else if (doAm >= 36 && doAm <= 70) {
                    document.getElementById("DA").style.background = "#93F6EE"
                } else if (doAm > 70) {
                    document.getElementById("DA").style.background = "#0FF2E0"
                }
            }

            function KTanhsang(anhSang) {
                if (anhSang < 400) {
                    document.getElementById("AS").style.background = "#DCC6F6"
                } else if (anhSang >= 400 && anhSang <= 1000) {
                    document.getElementById("AS").style.background = "#B67CF8"
                } else if (anhSang > 1000) {
                    document.getElementById("AS").style.background = "#8A2AF7"
                }
            }

            KTnhietdo(nhietDo);
            KTdoam(doAm);
            KTanhsang(anhSang);
            KTkhigas(gas);

            
            Highcharts.chart('container', {
                title: {
                    text: 'Biểu đồ nhiệt độ - độ ẩm - ánh sáng'
                },
                yAxis: {
                    title: {
                        text: 'Giá trị'
                    }
                },
                xAxis: {
                    accessibility: {
                        rangeDescription: 'Thời gian'
                    }
                },
                series: [{
                    name: 'Nhiệt độ',
                    data: dataND
                }, {
                    name: 'Độ ẩm',
                    data: dataDA
                }, {
                    name: 'Ánh sáng',
                    data: dataAS
                }],
            });
        } else {
            console.error('Invalid data format:', data);
        }
    } catch (error) {
        console.error('Error parsing JSON data:', event.data);
    }
});

// Gửi dữ liệu lên server khi cần
function sendWebSocketData(action, deviceId) {
    socket.send(JSON.stringify({ action, deviceId }));
}

// Các hàm xử lý sự kiện bật/tắt
function aon() {
    if (confirm("Bạn có muốn bật") == true) {
        document.getElementById("myImage").src = "bongdensang1.gif";
        document.getElementById('nutnhan').style.backgroundColor = "yellow";
        sendWebSocketData('led1', 'ON');
    }
}

function aof() {
    if (confirm("bạn có muốn tắt") == true) {
        document.getElementById("myImage").src = "bongden1.gif"
        document.getElementById('nutnhan').style.backgroundColor = "yellow"
    }
    sendWebSocketData('led1', 'OFF');
}


function bon() {
    if (confirm("bạn có muốn bật ") == true) {
        document.getElementById("myImage1").src = "bongdensang1.gif"
        document.getElementById('nutnhan2').style.backgroundColor = "yellow"
    }
    sendWebSocketData('led2', 'ON');
}

function bof() {
    if (confirm("bạn có muốn tắt") == true) {
        document.getElementById("myImage1").src = "bongden1.gif"
        document.getElementById('nutnhan2').style.backgroundColor = "yellow"
    }
    sendWebSocketData('led2', 'OFF');
}

function con() {
    if (confirm("bạn có muốn mở cửa") == true) {
        document.getElementById("myImage2").src = "opendoor.png"
        document.getElementById('cua1').style.backgroundColor = "yellow"
    }
    sendWebSocketData('door', 'OPEN');
}
function cof() {
    if (confirm("bạn có muốn đóng cửa") == true) {
        document.getElementById("myImage2").src = "closedoor.png"
        document.getElementById('cua1').style.backgroundColor = "yellow"
    }
    sendWebSocketData('door', 'CLOSE');
}

function don() {
    if (confirm("bạn có muốn bật báo động") == true) {
        document.getElementById("myImage3").src = "baodong.gif"
        document.getElementById('bd1').style.backgroundColor = "yellow"
    }
    sendWebSocketData('coi', 'ON');
}
function dof() {
    if (confirm("bạn có muốn đóng cửa") == true) {
        document.getElementById("myImage3").src = "coi2.png"
        document.getElementById('bd1').style.backgroundColor = "yellow"
    }
    sendWebSocketData('coi', 'OFF');
}
