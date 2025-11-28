let express = require("express");
const { type } = require("os");
let app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);

let connections = [];
let rooms = new Map();

io.on("connect", function (socket) {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.on("clear", () => {
    const roomData = rooms.get(socket.roomId);
    if (roomData) {
      roomData.history = [];
      io.to(socket.roomId).emit("clear");
    }
  });

  socket.on("undo", () => {
    const roomData = rooms.get(socket.roomId);
    if (roomData && roomData.history.length > 0) {
      while (roomData.history.at(roomData.history.length - 1).type !== "start") {
        roomData.history.pop();
      }
      roomData.history.pop();

      io.to(socket.roomId).emit("clear");
      io.to(socket.roomId).emit("loadHistory", roomData.history);
    }
  })

  socket.on("draw", (data) => {
    const roomData = rooms.get(socket.roomId);
    if (roomData) {
      const historyItem = {
        type: "draw",
        startX: data.startX,
        startY: data.startY,
        endX: data.endX,
        endY: data.endY,
        color: data.color,
        stroke: data.stroke,
      };
      roomData.history.push(historyItem);
      socket.to(socket.roomId).emit("draw", data);
    }
  });

  socket.on("mousedown", (data) => {
    const roomData = rooms.get(socket.roomId);
    if (roomData) {
      const historyItem = { type: "start", x: data.x, y: data.y, color: data.color, stroke: data.stroke };
      roomData.history.push(historyItem);
      socket.to(socket.roomId).emit("mousedown", data);
    }
  });

  socket.on("createRoom", (data) => {
    const roomId = data.roomId;
    rooms.set(roomId, {
      participants: 1,
      history: []
    });
    socket.roomId = roomId;
    socket.join(roomId);
    socket.emit("createRoom", data);
  });

  socket.on("joinRoom", (data) => {
    const roomId = data.roomId;

    var isValidRoom = false;
    if (rooms.has(roomId)) {
      isValidRoom = true;
    }

    if (isValidRoom) {
      socket.join(roomId);
      socket.roomId = roomId;

      let roomData = rooms.get(roomId);
      roomData.participants += 1;
      rooms.set(roomId, roomData);

      socket.emit("joinRoom", data);

      socket.emit("loadHistory", roomData.history);
    } else {
      socket.emit("error", "Room ID invalid");
    }
  });

  socket.on("disconnect", () => {
    connections = connections.filter((s) => s !== socket);
    console.log(`${socket.id} has disconnected`);

    if (rooms.has(socket.roomId)) {
      const roomsData = rooms.get(socket.roomId);
      roomsData.participants -= 1;

      if (roomsData.participants == 0) {
        rooms.delete(socket.roomId);
      } else {
        rooms.set(socket.roomId, roomsData);
      }
    }

  });
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;

http.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
