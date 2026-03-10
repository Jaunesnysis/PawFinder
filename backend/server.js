const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const questionnaireRouter = require("./src/routes/questionnaire");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend veikia" });
});

app.use("/api/questionnaire", questionnaireRouter);

app.listen(PORT, () => {
  console.log(`Serveris paleistas ant porto ${PORT}`);
});
