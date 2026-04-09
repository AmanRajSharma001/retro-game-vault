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
let genre = "";
let sortDirection = "desc";
let currentExtra = "";
let profileMode = false;
let profileType = "";
let totalgames = [];

const games = document.getElementById("games");
const input = document.getElementById("search");
const orderSelect = document.getElementById("order-by");
const sortDirBtn = document.getElementById("sort-direction");
const themeToggleBtn = document.getElementById("theme-toggle");

function getLikedGames() {
  return JSON.parse(localStorage.getItem("likedGames") || "[]");
}
function getFavGames() {
  return JSON.parse(localStorage.getItem("favGames") || "[]");
}
function getLikedGameObjects() {
  return JSON.parse(localStorage.getItem("likedGameObjects") || "[]");
}
function getFavGameObjects() {
  return JSON.parse(localStorage.getItem("favGameObjects") || "[]");
}

function toggleLike(id, gameObj) {
  let liked = getLikedGames();
  let likedObjs = getLikedGameObjects();
  if (liked.includes(id)) {
    liked = liked.filter(g => g !== id);
    likedObjs = likedObjs.filter(g => g.id !== id);
  } else {
    liked.push(id);
    likedObjs.push(gameObj);
  }
  localStorage.setItem("likedGames", JSON.stringify(liked));
  localStorage.setItem("likedGameObjects", JSON.stringify(likedObjs));
  return liked.includes(id);
}
function toggleFav(id, gameObj) {
  let favs = getFavGames();
  let favObjs = getFavGameObjects();
  if (favs.includes(id)) {
    favs = favs.filter(g => g !== id);
    favObjs = favObjs.filter(g => g.id !== id);
  } else {
    favs.push(id);
    favObjs.push(gameObj);
  }
  localStorage.setItem("favGames", JSON.stringify(favs));
  localStorage.setItem("favGameObjects", JSON.stringify(favObjs));
  return favs.includes(id);
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  const icon = themeToggleBtn.querySelector("i");
  if (theme === "light") {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "dark";
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

let timeout;


async function getGames(extra = "") {
  let url = `http://localhost:3000/games?page=${currentPage}&search=${search}&platforms=${platform}`;
  if (genre) url += `&genres=${genre}`;
  url += extra;
  const res = await fetch(url);
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

    if (genre && !game.genres?.some(g => g.id == genre)) {
      return false;
    }

    return true;
  });
}

function applySorting(data) {
  let sorted = [...data];
  const dir = sortDirection === "asc" ? 1 : -1;

  if (orderBy === "-rating") {
    sorted.sort((a, b) => dir * (a.rating - b.rating));
  } else if (orderBy === "-added") {
    sorted.sort((a, b) => dir * (a.added - b.added));
  } else if (orderBy === "released") {
    sorted.sort((a, b) => dir * (new Date(a.released) - new Date(b.released)));
  } else if (orderBy === "name") {
    sorted.sort((a, b) => {
      let A = a.name.toLowerCase();
      let B = b.name.toLowerCase();
      if (A < B) return -1 * dir;
      if (A > B) return 1 * dir;
      return 0;
    });
  } else if (orderBy === "date_added") {
    sorted.sort((a, b) => dir * (new Date(a.updated) - new Date(b.updated)));
  }

  return sorted;
}

async function loadAndRender(reset = true, extra = currentExtra) {
  currentExtra = extra;
  const MIN_RESULTS = 20;
  const MAX_PAGES = 10;

  if (reset) {
    games.innerHTML = "<h2>Loading...</h2>";
  }

  let allFiltered = [];
  let pagesLoaded = 0;
  let noMoreData = false;

  while (allFiltered.length < MIN_RESULTS && pagesLoaded < MAX_PAGES) {
    const data = await getGames(extra);
    pagesLoaded++;

    if (!data || data.length === 0) {
      noMoreData = true;
      break;
    }

    let filtered = applyFilters(data);
    allFiltered.push(...filtered);

    currentPage++;
  }

  let sorted = applySorting(allFiltered);

  if (reset) {
    totalgames = sorted;
    resetGames(totalgames);
  } else {
    totalgames.push(...sorted);
    appendGames(sorted);
  }

  if (noMoreData) {
    document.getElementById("loadMore").style.display = "none";
  } else {
    document.getElementById("loadMore").style.display = "";
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
  const liked = getLikedGames();
  const favs = getFavGames();
  const isLiked = liked.includes(values.id);
  const isFav = favs.includes(values.id);

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

  let actions = document.createElement("div");
  actions.classList.add("card-actions");

  let likeBtn = document.createElement("button");
  likeBtn.classList.add("action-btn", "like-btn");
  if (isLiked) likeBtn.classList.add("active");
  likeBtn.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <span>Like</span>`;
  likeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const nowLiked = toggleLike(values.id, values);
    likeBtn.classList.toggle("active", nowLiked);
    if (profileMode && profileType === "liked") {
      card.remove();
      if (games.children.length === 0) games.innerHTML = "<h1>No Games Found 💀</h1>";
    }
  });

  let favBtn = document.createElement("button");
  favBtn.classList.add("action-btn", "fav-btn");
  if (isFav) favBtn.classList.add("active");
  favBtn.innerHTML = `<i class="fa-solid fa-heart"></i> <span>Favorite</span>`;
  favBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const nowFav = toggleFav(values.id, values);
    favBtn.classList.toggle("active", nowFav);
    if (profileMode && profileType === "favorites") {
      card.remove();
      if (games.children.length === 0) games.innerHTML = "<h1>No Games Found 💀</h1>";
    }
  });

  actions.append(likeBtn, favBtn);
  card.append(img, title, rating, meta, platforms, actions);
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
  if (profileMode) {
    let sorted = applySorting(totalgames);
    totalgames = sorted;
    resetGames(totalgames);
    return;
  }
  currentPage = 1;
  loadAndRender(true, currentExtra);
});

document.querySelectorAll("[id^='platform-']").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    profileMode = false;
    profileType = "";
    platform = link.id.split("-")[1];
    genre = "";
    currentExtra = "";
    currentPage = 1;

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    loadAndRender(true, "");
  });
});

document.querySelectorAll("[id^='genre-']").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    profileMode = false;
    profileType = "";
    genre = link.id.split("-")[1];
    platform = "";
    currentExtra = "";
    currentPage = 1;

    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    loadAndRender(true, "");
  });
});

function renderProfileGames(type) {
  profileMode = true;
  profileType = type;
  let gameObjects = type === "liked" ? getLikedGameObjects() : getFavGameObjects();

  if (gameObjects.length === 0) {
    totalgames = [];
    games.innerHTML = "<h1>No Games Found 💀</h1>";
    document.getElementById("loadMore").style.display = "none";
    return;
  }

  let sorted = applySorting(gameObjects);
  totalgames = sorted;
  resetGames(totalgames);
  document.getElementById("loadMore").style.display = "none";
}

document.getElementById("my-liked").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  e.currentTarget.classList.add("active");
  renderProfileGames("liked");
});

document.getElementById("my-favorites").addEventListener("click", (e) => {
  e.preventDefault();
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  e.currentTarget.classList.add("active");
  renderProfileGames("favorites");
});

sortDirBtn.addEventListener("click", () => {
  sortDirection = sortDirection === "desc" ? "asc" : "desc";
  const icon = sortDirBtn.querySelector("i");
  const label = sortDirBtn.querySelector("span");
  if (sortDirection === "asc") {
    icon.classList.remove("fa-arrow-down-wide-short");
    icon.classList.add("fa-arrow-up-wide-short");
    label.textContent = "ASC";
  } else {
    icon.classList.remove("fa-arrow-up-wide-short");
    icon.classList.add("fa-arrow-down-wide-short");
    label.textContent = "DESC";
  }
  if (profileMode) {
    let sorted = applySorting(totalgames);
    totalgames = sorted;
    resetGames(totalgames);
    return;
  }
  currentPage = 1;
  loadAndRender(true, currentExtra);
});

document.getElementById("loadMore").addEventListener("click", () => {
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

function updateProfileBadges() {
  document.getElementById("liked-count").textContent = getLikedGames().length;
  document.getElementById("fav-count").textContent = getFavGames().length;
}

updateProfileBadges();

const profileBtn = document.getElementById("profile-btn");
const profileDropdown = document.getElementById("profile-dropdown");

profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  updateProfileBadges();
  profileDropdown.classList.toggle("open");
});

document.addEventListener("click", (e) => {
  if (!document.getElementById("profile-menu").contains(e.target)) {
    profileDropdown.classList.remove("open");
  }
});

document.getElementById("dropdown-liked").addEventListener("click", (e) => {
  e.preventDefault();
  profileDropdown.classList.remove("open");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.getElementById("my-liked").classList.add("active");
  renderProfileGames("liked");
});

document.getElementById("dropdown-favorites").addEventListener("click", (e) => {
  e.preventDefault();
  profileDropdown.classList.remove("open");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.getElementById("my-favorites").classList.add("active");
  renderProfileGames("favorites");
});

document.getElementById("dropdown-clear").addEventListener("click", (e) => {
  e.preventDefault();
  if (confirm("Clear all liked and favorite games?")) {
    localStorage.removeItem("likedGames");
    localStorage.removeItem("likedGameObjects");
    localStorage.removeItem("favGames");
    localStorage.removeItem("favGameObjects");
    updateProfileBadges();
    profileDropdown.classList.remove("open");
    document.querySelectorAll(".like-btn.active").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".fav-btn.active").forEach(b => b.classList.remove("active"));
    if (profileMode) {
      totalgames = [];
      games.innerHTML = "<h1>No Games Found 💀</h1>";
    }
  }
});

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

function setActiveSidebarLink(el) {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  el.classList.add("active");
}

document.getElementById("last30").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 30);

  loadAndRender(true, `&dates=${formatDate(past)},${formatDate(today)}`);
};

document.getElementById("thisWeek").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;

  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 7);

  loadAndRender(true, `&dates=${formatDate(past)},${formatDate(today)}`);
};

document.getElementById("nextWeek").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;

  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + 7);

  loadAndRender(true, `&dates=${formatDate(today)},${formatDate(future)}`);
};

document.getElementById("bestYear").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;

  const year = new Date().getFullYear();
  loadAndRender(true, `&dates=${year}-01-01,${year}-12-31`);
};

document.getElementById("popular2025").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;

  loadAndRender(true, `&dates=2025-01-01,2025-12-31`);
};

document.getElementById("topAll").onclick = (e) => {
  e.preventDefault();
  profileMode = false;
  profileType = "";
  setActiveSidebarLink(e.currentTarget);
  currentPage = 1;
  orderBy = "-rating";
  loadAndRender(true);
};