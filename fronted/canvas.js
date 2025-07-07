export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

(function setFullscreen() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}());