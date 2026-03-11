const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const petRoutes = require('./src/Modules/Animals/API/petRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Tavo React (Vite) adresas
        methods: ["GET", "POST"]
    }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

app.set("io", io);

app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "Backend veikia" });
});

app.use('/api/pets', petRoutes);

io.on("connection", (socket) => {
    console.log(`Vartotojas prisijungė: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log("Vartotojas atsijungė");
    });
});

server.listen(PORT, () => {
    console.log(`Serveris paleistas ant porto ${PORT}`);
});