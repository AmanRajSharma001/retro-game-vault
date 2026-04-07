const songs = ["audio/audio1.mp3","audio/audio2.mp3","audio/audio3.mp3","audio/audio4.mp3"];

let currentSong = 0;

const audio = document.getElementById("background");

function Play(index) {
  audio.src = songs[index];
  audio.play().catch(() => {
    console.log("Autoplay blocked");
  });
}

audio.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % songs.length;
  Play(currentSong);
});

window.addEventListener("load", () => {
  const shouldPlay = localStorage.getItem("playMusic");

  if (shouldPlay === "true") {
    Play(currentSong);
    localStorage.removeItem("playMusic");
  }
});


let currentPage = 1;
let totalgames = [];
let search = "";
const games = document.getElementById("games");
let input = document.getElementById("search");
let timeout;
let orderBy = "-added";
let platform = ""; 

function applyFilters(data) {
  return data.filter(game => {

    if (game.rating === 0) return false;
    if (game.ratings_count < 20) return false;

    if (platform && !game.platforms?.some(p => p.platform.id == platform)) {
      return false;
    }

    return true;
  });
}

async function getGames() {
  console.log(`URL: http://localhost:3000/games?page=${currentPage}&search=${search}&ordering=${orderBy}&platforms=${platform}`);
  const res = await fetch(
    `http://localhost:3000/games?page=${currentPage}&search=${search}&ordering=${orderBy}&platforms=${platform}`
  );
  const data = await res.json();
  return data.results;
}

function applySorting(data) {

  if (orderBy === "-rating") {
    return data.sort((a, b) => b.rating - a.rating);
  }

  if (orderBy === "-added") {
    return data.sort((a, b) => b.added - a.added);
  }

  if (orderBy === "released") {
    return data.sort((a, b) => new Date(b.released) - new Date(a.released));
  }

  if (orderBy === "name") {
    return data.sort((a, b) => a.name.localeCompare(b.name));
  }

  return data;
}

async function getGamesWithDates(from, to) {
  const fromDate = from.toISOString().split("T")[0];
  const toDate = to.toISOString().split("T")[0];

  const res = await fetch(
    `http://localhost:3000/games?page=${currentPage}&dates=${fromDate},${toDate}&ordering=${orderBy}&platforms=${platform}`
  );

  const data = await res.json();
  return data.results;
}

async function getGamesByYear(year) {
  const res = await fetch(
    `http://localhost:3000/games?page=${currentPage}&dates=${year}-01-01,${year}-12-31&ordering=-rating&platforms=${platform}`
  );

  const data = await res.json();
  return data.results;
}

function resetGames(gameList){
  games.innerHTML = "";
  if (gameList.length === 0){
    games.innerHTML = "<h1>No Games Found 💀</h1>";
    return;
  }
  gameList.forEach((values) => createCard(values));
}

function appendGames(gameList){
  gameList.forEach((values) => createCard(values));
}

function createCard(values){
  let card = document.createElement("div");
  card.classList.add("game-card");

  let img = document.createElement("img");
  img.src = values.background_image;
  img.classList.add("bgimg");

  let title = document.createElement("h3");
  title.innerText = values.name;

  let rating = document.createElement("p");
  rating.innerText = `⭐ ${values.rating}`;

  let meta = document.createElement("p");
  meta.innerText = `🔥 ${values.ratings_count} ratings`;

  let platforms = document.createElement("p");
  platforms.innerText = values.platforms
    ?.map(p => p.platform.name)
    .slice(0, 3)
    .join(", ");

  card.append(img, title, rating, meta, platforms);
  games.appendChild(card);
}

async function init(){
  games.innerHTML = "<h2>Loading...</h2>";

  const data = await getGames();

  const filtered = applyFilters(data);
  const sorted = applySorting(filtered);

  totalgames = sorted;
  resetGames(totalgames);
}
init();

const orderSelect = document.getElementById("order-by");
const platformSelect = document.getElementById("platforms");

orderSelect.addEventListener("change", async (e) => {
  orderBy = e.target.value;
  currentPage = 1;

  games.innerHTML = "<h2>Loading...</h2>";

  const data = await getGames();

  const filtered = applyFilters(data);
  const sorted = applySorting(filtered);

  totalgames = sorted;
  resetGames(totalgames);
});

platformSelect.addEventListener("change", async (e) => {
  platform = e.target.value;
  currentPage = 1;

  games.innerHTML = "<h2>Loading...</h2>";

  const data = await getGames();

  const filtered = applyFilters(data);
  const sorted = applySorting(filtered);

  totalgames = sorted;
  resetGames(totalgames);
});

async function loadMore(){
  currentPage++;

  const data = await getGames();

  const filtered = applyFilters(data);
  const sorted = applySorting(filtered);

  totalgames.push(...sorted);
  appendGames(sorted);
}
document.getElementById("loadMore").addEventListener("click", loadMore);


input.addEventListener("input",(e)=>{
  clearTimeout(timeout);

  timeout = setTimeout(async ()=>{
    search = e.target.value || "";
    currentPage = 1;

    const data = await getGames();

    const filtered = applyFilters(data);
    const sorted = applySorting(filtered);

    totalgames = sorted;
    resetGames(totalgames);

  },500);
});
  const menuBtn = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
  });


document.getElementById("last30").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-released";

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 30);

  const data = await getGamesWithDates(past, today);
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});

document.getElementById("thisWeek").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-released";

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  const data = await getGamesWithDates(past, today);
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});

document.getElementById("nextWeek").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-released";

  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 7);

  const data = await getGamesWithDates(today, future);
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});

document.getElementById("bestYear").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-rating";

  const year = new Date().getFullYear();

  const data = await getGamesByYear(year);
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});

document.getElementById("popular2025").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-rating";

  const data = await getGamesByYear(2025);
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});

document.getElementById("topAll").addEventListener("click", async (e) => {
  e.preventDefault();

  currentPage = 1;
  orderBy = "-rating";

  const data = await getGames();
  const filtered = applyFilters(data);

  totalgames = filtered;
  resetGames(totalgames);
});