const txt = "PIXEL ARCADE"
let title = document.getElementById("title");
let press = document.getElementById("press");

let i = 0;
function Type(){
    if (i<txt.length){
        title.innerHTML+=txt[i];
        i++
        setTimeout(Type,100)
    }
}
Type();

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
    audio.pause();
}
    document.addEventListener("click", () => {
    Play(currentSong);
    }, { once: true });
});