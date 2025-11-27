const socket = io();

const clearButton = document.getElementById("clearButton");
const undoButton = document.getElementById("undoButton");
const saveButton = document.getElementById("saveButton");
const colorPicker = document.getElementById("colorPicker");
const strokeWidth = document.getElementById("strokeWidth");

const roomInput = document.getElementById("roomInput");
const roomDisplay = document.getElementById("roomDisplay");
const createButton = document.getElementById("createBtn");
const joinButton = document.getElementById("joinBtn");
const login = document.getElementById("login-screen");
const whiteboard = document.getElementById("whiteboard-screen");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 0.9 * window.innerWidth;
canvas.height = 0.85 * window.innerHeight;

let x, y;
let drawing = false;

socket.on("draw", (data) => {
    ctx.lineTo(data.x, data.y);
    ctx.lineWidth = data.stroke;
    ctx.strokeStyle = data.color;
    ctx.stroke();
});

socket.on("mousedown", (data) => {
    ctx.beginPath();
    ctx.moveTo(data.x, data.y);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.stroke;
});

socket.on("createRoom", (data) => {
    login.style.display = "none";
    whiteboard.style.display = "block";
    roomDisplay.innerText = `Room ID: ${data.roomId}`;
});

socket.on("joinRoom", (data) => {
    login.style.display = "none";
    whiteboard.style.display = "block";
    roomDisplay.innerText = `Room ID: ${data.roomId}`;
});

socket.on("loadHistory", (history) => {
    history.forEach((item) => {
        if (item.type === "start") {
            ctx.beginPath();
            ctx.moveTo(item.x, item.y);
            ctx.strokeStyle = item.color;
            ctx.lineWidth = item.stroke;
        } else if (item.type === "draw") {
            ctx.lineWidth = item.stroke;
            ctx.strokeStyle = item.color;
            ctx.lineTo(item.x, item.y);
            ctx.stroke();
        }
    });
});

socket.on("clear", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
});

socket.on("error", (msg) => {
    alert(msg);
});

//DOM MANIPULATIONS...................................................................

canvas.addEventListener("mousedown", function (event) {
    x = event.clientX - canvas.offsetLeft;
    y = event.clientY - canvas.offsetTop;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = strokeWidth.value;

    socket.emit("mousedown", {
        x: x,
        y: y,
        color: colorPicker.value,
        stroke: strokeWidth.value,
    });
    drawing = true;
});

canvas.addEventListener("mouseup", function (event) {
    drawing = false;
});

canvas.addEventListener("mousemove", function (event) {
    x = event.clientX - canvas.offsetLeft;
    y = event.clientY - canvas.offsetTop;

    if (drawing) {
        ctx.lineTo(x, y);
        ctx.lineWidth = strokeWidth.value;
        ctx.strokeStyle = colorPicker.value;
        ctx.stroke();
        socket.emit("draw", {
            x: x,
            y: y,
            color: colorPicker.value,
            stroke: strokeWidth.value,
        });
    }
});

clearButton.addEventListener("click", function () {
    socket.emit("clear");
});

undoButton.addEventListener("click", function () {
    socket.emit("undo");
});

saveButton.addEventListener("click", function () {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    tempCtx.fillStyle = "#FFFFFF";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = tempCanvas.toDataURL();
    link.click();
});

createButton.addEventListener("click", function () {
    const roomId = Math.random().toString(36).substring(2, 7);
    console.log(`Created room with ID: ${roomId}`);

    socket.emit("createRoom", { roomId: roomId });
});

joinButton.addEventListener("click", function () {
    const roomId = roomInput.value;
    socket.emit("joinRoom", { roomId: roomId });
});
