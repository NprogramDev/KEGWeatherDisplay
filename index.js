const MIN_TO_REFRESH = 3; // in minutes
const MIN_TO_NEW_IMG = 3; // in minutes
const IS_TEST = true;
// TOP LINE: 58°C
// BOTTOM LINE: -27°C
const TEMP_WIDTH = 50;
const TEMP_HEiGHT = 500;
const TEMP_SCALE = 7; // 10px ^= 1°C
const TEMP_ZERO_OFFSET = TEMP_HEiGHT; // 0°C = 400px
const TEMP_STEP_SIZE = 3; // 3px = Line
const TEMP_STEP_SCALE = TEMP_SCALE * TEMP_STEP_SIZE;
const TEMP_OFFSET = 30;

const tempField = document.getElementById("temp");
const thermInsert = document.getElementById("glassTemp-ThermInsert");
const therm = document.getElementById("glassTemp-Thermometer");
const pr = document.getElementById("panel-right");
const time = document.getElementById("glassTemp-time");

const bgImg = document.getElementById("bg-img");
const bgImg2 = document.getElementById("bg-img2");

function setRadius(id, value, perc) {
    document.getElementById(`${id}-text`).innerHTML = value;
    if (perc > 1) perc = 1;
    angle = perc * 252;
    const circ = document.getElementById(`${id}-rad`);
    const radius = parseInt(circ.getAttribute("r"));
    const circumference = 2 * Math.PI * radius;
    const a = (circumference * angle) / 360;
    circ.setAttribute("stroke-dasharray", `${a} ${circumference - a}`);
    circ.setAttribute("stroke-dashoffset", 1.2 * Math.PI * radius);
}
function addRadius(title, id) {
    const dv = document.createElement("div");
    dv.classList.add("glass-pane");
    const radius = 45;
    const bor = 40;
    const bir = 50;
    let angle = 252;
    const circumference = 2 * Math.PI * radius;
    const cbir = 2 * Math.PI * bir;
    const cbor = 2 * Math.PI * bor;

    const a = (circumference * angle) / 360;
    angle += 1;
    const abir = (cbir * angle) / 360;
    angle -= 1;
    const abor = (cbor * angle) / 360;
    dv.innerHTML = `
<h2 id="${id}-title">${title}</h2>

<svg viewbox="-1 0 102 100" class="roundMeter" id="${id}-svg" >
<circle cx="50" cy="54" r="45" fill="none" stroke="turquoise" stroke-width="10" stroke-dashoffset="${
        1.2 * Math.PI * radius
    }" stroke-dasharray="${a} ${circumference - a}" id="${id}-rad"/>
<circle cx="50" cy="54" r="40" fill="none" stroke="turquoise" stroke-width="1" stroke-dashoffset="${
        1.2 * Math.PI * bor
    }" stroke-dasharray="${abor} ${cbor - abor}"/>
<circle cx="50" cy="54" r="50" fill="none" stroke="turquoise" stroke-width="1" stroke-dashoffset="${
        1.2 * Math.PI * bir
    }" stroke-dasharray="${abir} ${cbir - abir}"/>
<line x1="9.5" y1="84" x2="18" y2="78" stroke="turquoise"/>
<line x1="83" y1="77.5" x2="90" y2="84" stroke="turquoise"/>
<text style="font-size: 1em" x="50" y="55" text-anchor="middle" alignment-baseline="middle" font-size="1.5em" fill="turquoise" id="${id}-text"></text>
</svg>

`;
    pr.prepend(dv);
}
function addQRCode(id) {
    const dv = document.createElement("div");
    dv.classList.add("glass-pane");
    dv.innerHTML += `<h2 id="${id}-title">Website</h2><svg viewbox="-1 0 102 100" class="roundMeter" id="${id}-svg"><image  style="/*width:90%*/" x="-1" y="0" width="100" height="100"   href="qrC.JPG"/></svg>`;
    dv.style.paddingBottom = "1.6em";
    pr.prepend(dv);
}
const preand = pr.children[0];
//pr.removeChild(preand); 
addRadius("Windgeschw.", "wind");
addRadius("Niederschlag", "rain");
addQRCode("qrCode1");
addRadius("Luftdruck", "pressure");
addRadius("Feuchtigkeit", "humidity");
//pr.prepend(preand);


function setPressure(value) {
    const MAX_PRESSURE = 1096;
    const NORMAL_PRESSURE = 1013; // NOT USED!
    const MIN_PRESSURE = 930;
    setRadius(
        "pressure",
        value + " hPa",
        (value - MIN_PRESSURE) / (MAX_PRESSURE - MIN_PRESSURE)
    );
}
function setHumidity(value) {
    setRadius("humidity", value + "%", value / 100);
}
function setWind(value) {
    const MAX_WIND = 100;
    const MIN_WIND = 0;
    setRadius(
        "wind",
        Math.round(value) + " km/h",
        (value - MIN_WIND) / (MAX_WIND - MIN_WIND)
    );
}
function setWindDir(value) {
    const angle = value;
    const arrow = document.getElementById("winddir-arrow");
    arrow.style.transform = `rotate(${angle}deg)`;
    const text = document.getElementById("winddir-text");
    text.innerHTML = `${angle}°`;
}

function setRain(value) {
    const MAX_RAIN = 50;
    const MIN_RAIN = 0;
    setRadius(
        "rain",
        value + " mm",
        (value - MIN_RAIN) / (MAX_RAIN - MIN_RAIN)
    );
}

function calcColor(temp) {
    let x = temp - 3;

    let blue = -9.5 * x + 200;
    blue = blue > 255 ? 255 : blue;
    blue = blue < 0 ? 0 : blue;
    let green = -0.35 * (x - 8.2) ** 2 + 133.5;
    green = green > 255 ? 255 : green;
    green = green < 0 ? 0 : green;
    let red = 6.2 * x;
    red = red > 255 ? 255 : red;
    red = red < 0 ? 0 : red;
    let black = 1;
    red = red * black;
    green = green * black;
    blue = blue * black;
    return `rgb(${red}, ${green}, ${blue})`;
}

let currTemp = 0;

function setTemp(temp) {
    currTemp = temp;

    let color = calcColor(temp);
    temp += TEMP_OFFSET;
    //thermContainer.style.borderColor = color;
    thermInsert.style.fill = color;

    tempField.innerText = temp - TEMP_OFFSET;
    let offset = temp < 0 ? -1 : 1;
    temp = Math.abs(temp);
    let steps = temp / TEMP_STEP_SIZE;
    thermInsert.innerHTML = "";
    for (let i = 0; i < steps; i++) {
        if (i == 0) continue;
        let newRect = `<rect width="${TEMP_WIDTH}" height="${
            TEMP_STEP_SCALE / 1.5
        }" x="0" y="${TEMP_ZERO_OFFSET - i * TEMP_STEP_SCALE * offset}"/>`;
        thermInsert.innerHTML += newRect;
    }
}
/*
setInterval(() => {
    setTemp(currTemp + 1)

}, 200);*/
setTemp(0);

function setTest() {
    setPressure(1013);
    setHumidity(80);
    setWind(100);
    setRain(20);
    setWindDir(Math.floor(Math.random() * 360));
    let a = new Date().toLocaleTimeString().toString().split(" ");
    a.pop();

    time.innerHTML =
        "<span> Daten vom: <br>" +
        a.join(" ") +
        "<br>" +
        new Date().toLocaleDateString() +
        "</span>";
}
function toDate(date) {
    let year = date.substring(0, 4);
    let month = date.substring(4, 6);
    let day = date.substring(6, 8);
    let h = date.substring(8, 10);
    let m = date.substring(10, 12);
    let s = date.substring(12, 14);
    return new Date(Date.UTC(year, month - 1, day, h, m, s));
}
async function setCurrData() {
    const rp = await fetch("/wetter/api/all.json");
    const timeFileDat = await fetch("/wetter/api/meteoware-live.json");
    const timeFile = await timeFileDat.json();
    const data = await rp.json();
    setPressure(data.pressure);
    setHumidity(data.humidity);
    setRain(data.rain);
    setWind(data.wind.speed);
    setWindDir(data.wind.direction);
    setTemp(Math.round(data.temperature));
    let timeStamp = timeFile.current.dt.utc;
    timeStamp = toDate(timeStamp);

    let a = Intl.DateTimeFormat("de-DE", {
        dateStyle: "short",
        timeStyle: "short",
    }).format(timeStamp);
    time.innerText = `Daten vom: \n ${a} `;
}

let bgImgIndex = 0;
let isFirstImg = true;
let bgData;
function setNewImage() {
    bgImgIndex++;
    if (bgImgIndex >= bgData.paths.length) bgImgIndex = 0;
    if (isFirstImg) {
        bgImg.src = bgData.paths[bgImgIndex];
        setTimeout(() => {
            bgImg.style.animationName = "bgImgIn";
            bgImg2.style.animationName = "bgImgOut";
            bgImg.style.zIndex = 1;
            bgImg2.style.zIndex = 0;
        }, 500);
    } else {
        bgImg2.src = bgData.paths[bgImgIndex];
        setTimeout(() => {
            bgImg2.style.animationName = "bgImgIn";
            bgImg.style.animationName = "bgImgOut";
            bgImg.style.zIndex = 0;
            bgImg2.style.zIndex = 1;
        }, 500);
    }
    isFirstImg = !isFirstImg;
}

async function bgImgLoad() {
    const bgConf = await fetch("bg.json");
    bgData = await bgConf.json();
    if (bgData.slide) {
        setInterval(setNewImage, 60 * MIN_TO_NEW_IMG * 1000);
    }
}
bgImgLoad();
if(!IS_TEST){
    setCurrData();
    setInterval(setCurrData, 60 * MIN_TO_REFRESH * 1000);
}else setTest();
window.onresize = () => {
    Array.from(document.getElementsByClassName("bg-stat")).forEach((el) => {
        el.style.height = document.getElementById("panel-right").offsetHeight + "px";
    });
};
Array.from(document.getElementsByClassName("bg-stat")).forEach((el) => {
    el.style.height = document.getElementById("panel-right").offsetHeight + "px";
});