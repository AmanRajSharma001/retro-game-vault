const txt = "PIXEL ARCADE"
let intro = document.getElementById("intro")
let title = document.getElementById("title");
let press = document.getElementById("press");
let openingvideo = document.getElementById("bg-video")
let entercount = 0;
let i = 0;
function Type(){
    if (i<txt.length){
        title.innerHTML+=txt[i];
        i++
        time = setTimeout(Type,100)
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

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && entercount == 0) {
    entercount++
    const enter = document.getElementById("enter");
    enter.muted = false;
    enter.play()
    const press = document.getElementById("press");
    press.removeAttribute("id");
    press.classList.add("fastblink");
    setTimeout(()=>{
      press.classList.add("hide")
      const circle = document.getElementById("circle");
      circle.classList.add("expand");
    },1000)
    setTimeout(()=>{
      intro.classList.add("fade-out");
      setTimeout(() => {
        intro.style.display = "none";
        document.getElementById("circle").style.display = "none";
        Play(currentSong);
      }, 500);
    },1500)
    remove()
  }
  setTimeout(() => {
      localStorage.setItem("playMusic", "true");
      window.location.href = "main.html";
    }, 1500);
});
