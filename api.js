import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
const API_KEY = process.env.RETRO_KEY;
app.get("/games", async (req, res) => {
  const page = req.query.page || 1;
  const search = req.query.search || "";

  const url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}&search=${search}`;

  const response = await fetch(url);
  const data = await response.json();

  res.json(data);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
