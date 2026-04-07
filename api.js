import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET"]
}));

const API_KEY = process.env.RETRO_KEY;
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.get("/games", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const search = req.query.search || "";
    const ordering = req.query.ordering || "";
    const platforms = req.query.platforms || "";
    const dates = req.query.dates || "";
    let url = `https://api.rawg.io/api/games?key=${API_KEY}&page=${page}`;
    
    if (search) {
      url += `&search=${encodeURIComponent(search)}&search_precise=true`;
    }
    if (ordering) url += `&ordering=${ordering}`;
    if (platforms) url += `&platforms=${platforms}`;
    if (dates) {url += `&dates=${dates}`;}

    console.log("FINAL URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: "RAWG API error",
        status: response.status
      });
    }

    const data = await response.json();

    res.json(data);

  } catch (err) {
    console.error("ERROR:", err.message);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});