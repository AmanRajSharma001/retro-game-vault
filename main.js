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

async function getGames() {
  const res = await fetch(`http://localhost:3000/games?page=${currentPage}&search=${search}`);
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
  let title = document.createElement("h3");
  let img = document.createElement("img");
  let rate = document.createElement("p");
  let date = document.createElement("p");
  let gen = document.createElement("p");
  title.innerText = values.name;
  rate.innerText = `⭐ Rating: ${values.rating}`;
  date.innerText = `📅 Release: ${values.released}`;
  gen.innerText = `🎯 Genre: ${values.genres?.[0]?.name || "N/A"}`;
  img.src = values.background_image;
  img.classList.add("bgimg");
  card.appendChild(img);
  card.appendChild(title);
  card.appendChild(rate);
  card.appendChild(date);
  card.appendChild(gen);
  games.appendChild(card);
}

async function init(){
  const data = await getGames();
  totalgames = data;
  resetGames(totalgames);
}
init();

async function loadMore(){
  currentPage++;
  const data = await getGames();
  totalgames.push(...data);
  appendGames(data);
}
document.getElementById("loadMore").addEventListener("click", loadMore);


input.addEventListener("input",(e)=>{
  clearTimeout(timeout);

  timeout = setTimeout(async ()=>{
    search = e.target.value || "";
    currentPage = 1;

    const data = await getGames();

    totalgames = data;
    resetGames(totalgames);
  },500);
});
