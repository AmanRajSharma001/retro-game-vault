const songs = ["audio/audio1.mp3","audio/audio2.mp3","audio/audio3.mp3","audio/audio4.mp3"];
let currentSong = 0;
const audio = document.getElementById("background");

function Play(index) {
  audio.src = songs[index];
  audio.play().catch(() => console.log("Autoplay blocked"));
}

audio.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % songs.length;
  Play(currentSong);
});

window.addEventListener("load", () => {
  if (localStorage.getItem("playMusic") === "true") {
    Play(currentSong);
    localStorage.removeItem("playMusic");
  }
});

let currentPage = 1;
let search = "";
let orderBy = "-added";
let platform = "";
let totalgames = [];

const games = document.getElementById("games");
const input = document.getElementById("search");
const orderSelect = document.getElementById("order-by");
const platformSelect = document.getElementById("platforms");

let timeout;


async function getGames(extra = "") {
  const res = await fetch(
    `http://localhost:3000/games?page=${currentPage}&search=${search}&platforms=${platform}${extra}`
  );
  const data = await res.json();
  return data.results;
}

function applyFilters(data) {
  return data.filter(game => {
    if (game.rating === 0) return false;
    if (game.ratings_count < 20) return false;

    if (search && !game.name.toLowerCase().includes(search)) return false;

    if (platform && !game.platforms?.some(p => p.platform.id == platform)) {
      return false;
    }

    return true;
  });
}

function applySorting(data) {
  let sorted = [...data];

  if (orderBy === "-rating") {
    return sorted.sort((a, b) => b.rating - a.rating);
  }

  if (orderBy === "-added") {
    return sorted.sort((a, b) => b.added - a.added);
  }

  if (orderBy === "released") {
    return sorted.sort((a, b) => new Date(b.released) - new Date(a.released));
  }

  if (orderBy === "name") {
    return sorted.sort((a, b) => {
      let A = a.name.toLowerCase();
      let B = b.name.toLowerCase();
      if (A < B) return -1;
      if (A > B) return 1;
      return 0;
    });
  }

  return sorted;
}

async function loadAndRender(reset = true, extra = "") {

  if (reset) {
    games.innerHTML = "<h2>Loading...</h2>";
  }

  const data = await getGames(extra);

  let filtered = applyFilters(data);
  let sorted = applySorting(filtered);

  if (reset) {
    totalgames = sorted;
    resetGames(totalgames);
  } else {
    totalgames.push(...sorted);
    appendGames(sorted);
  }
}

function resetGames(list) {
  games.innerHTML = "";

  if (list.length === 0) {
    games.innerHTML = "<h1>No Games Found 💀</h1>";
    return;
  }

  list.forEach(createCard);
}

function appendGames(list) {
  list.forEach(createCard);
}


function createCard(values) {
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
  platforms.innerText =
    values.platforms?.map(p => p.platform.name).slice(0, 3).join(", ") || "N/A";

  card.append(img, title, rating, meta, platforms);
  games.appendChild(card);
}

loadAndRender();

input.addEventListener("input", (e) => {
  clearTimeout(timeout);

  timeout = setTimeout(() => {
    search = e.target.value.toLowerCase();
    currentPage = 1;
    loadAndRender(true);
  }, 400);
});

orderSelect.addEventListener("change", (e) => {
  orderBy = e.target.value;
  currentPage = 1;
  loadAndRender(true);
});

platformSelect.addEventListener("change", (e) => {
  platform = e.target.value;
  currentPage = 1;
  loadAndRender(true);
});

document.getElementById("loadMore").addEventListener("click", () => {
  currentPage++;
  loadAndRender(false);
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

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

document.getElementById("last30").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 30);

  loadAndRender(true, `&dates=${formatDate(past)},${formatDate(today)}`);
};

document.getElementById("thisWeek").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  loadAndRender(true, `&dates=${formatDate(past)},${formatDate(today)}`);
};

document.getElementById("nextWeek").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;

  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 7);

  loadAndRender(true, `&dates=${formatDate(today)},${formatDate(future)}`);
};

document.getElementById("bestYear").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;

  const year = new Date().getFullYear();
  loadAndRender(true, `&dates=${year}-01-01,${year}-12-31`);
};

document.getElementById("popular2025").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;

  loadAndRender(true, `&dates=2025-01-01,2025-12-31`);
};

document.getElementById("topAll").onclick = (e) => {
  e.preventDefault();
  currentPage = 1;
  orderBy = "-rating";
  loadAndRender(true);
};