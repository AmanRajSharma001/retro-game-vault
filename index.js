const txt = "PIXEL ARCADE"
let intro = document.getElementById("intro")
let title = document.getElementById("title");
let press = document.getElementById("press");
let openingvideo = document.getElementById("bg-video")
const maincontent = document.getElementById("main-content")

let i = 0;
function Type(){
    if (i<txt.length){
        title.innerHTML+=txt[i];
        i++
        time = 
        setTimeout(Type,100)
    }
  }
Type();
function remove() {
  if (i > 0) {
    clearTimeout(time)
    i--;
    title.innerHTML = txt.slice(0, i);
    setTimeout(remove, 100);
  }
}

  
const songs = ["audio/audio1.mp3","audio/audio2.mp3","audio/audio3.mp3","audio/audio4.mp3"];

let currentSong = 0;

const audio = document.getElementById("background");

function Play(index) {
  audio.src = songs[index];
  audio.play();
}

audio.addEventListener("ended", () => {
  currentSong = (currentSong + 1) % songs.length;
  Play(currentSong);
});

document.addEventListener("click", () => {
  Play(currentSong);
}, { once: true });


document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const enter = document.getElementById("enter");
    enter.muted = false;
    const press = document.getElementById("press");
    press.removeAttribute("id");
    press.classList.add("fastblink");
    setTimeout(()=>{
      press.classList.add("hide")
      const circle = document.getElementById("circle");
      circle.classList.add("expand");
    },1000)
    setTimeout(()=>{
      openingvideo.classList.add('hide')
      intro.classList.add("hide")
      circle.classList.add("hide")
      maincontent.style.display = "flex";
    },1500)
    audio.pause();
    remove()
  }
});
