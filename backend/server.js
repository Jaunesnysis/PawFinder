const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5050;

const recommendationsController = require("./src/Modules/Recommendations/API/recommendations.controller");
const animalsController = require("./src/Modules/Animals/API/animals.controller");

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend veikia" });
});

app.post("/api/recommendations", recommendationsController.submitQuestionnaire);

app.listen(PORT, () => {
  console.log(`Serveris paleistas ant porto ${PORT}`);
});

app.post(
  "/api/animals/generate-description",
  animalsController.generateDescription,
);
