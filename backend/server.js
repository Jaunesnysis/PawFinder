const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const petRoutes = require('./src/Modules/Pets/API/petRoutes');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Backend veikia" });
});

app.listen(PORT, () => {
  console.log(`Serveris paleistas ant porto ${PORT}`);
});

app.use('/api/pets', petRoutes);
