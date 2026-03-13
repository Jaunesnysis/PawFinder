const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Importuojame abiejų darbus
const petRoutes = require("./src/Modules/Animals/API/petRoutes");
const questionnaireRouter = require("./src/Modules/Questionnaire/API/questionnaire");

const app = express();
const PORT = process.env.PORT || 5050;

const recommendationsController = require("./src/Modules/Recommendations/API/recommendations.controller");
const animalsController = require("./src/Modules/Animals/API/animals.controller");

// Svarbu: naudojame http.createServer, kad veiktų WebSockets
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Paduodame 'io' į visus maršrutus
app.set("io", io);

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend veikia" });
});

// Registruojame abu maršrutus
app.use("/api/pets", petRoutes);
app.use("/api/questionnaire", questionnaireRouter);

io.on("connection", (socket) => {
  console.log(`Vartotojas prisijungė: ${socket.id}`);
});

// Paleidžiame per 'server', ne per 'app'!
server.listen(PORT, () => {
  console.log(`Serveris paleistas ant porto ${PORT}`);
});

app.post(
  "/api/animals/generate-description",
  animalsController.generateDescription,
);
