const page = document.getElementById("page_body");
const musicMenu = document.getElementById("music_for_menu");
const volumeSlider = document.getElementsByClassName("parameters-volume-slider")[0];

musicMenu.volume = volumeSlider.value;

page.addEventListener("click", function() {
    if (musicMenu.paused) {
        musicMenu.play();
    }
});

volumeSlider.addEventListener("input", function() {
    musicMenu.volume = this.value;
});