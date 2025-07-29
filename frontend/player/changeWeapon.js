import { player } from "./player.js"

document.addEventListener("mousedown", (event) => {
    if (event.button == 2)
    {
        player.weapon = null;
    }
});