import { Clock } from "./clock/clock.js";
import { HEIGHT_MAP, viewportHeight, viewportWidth, WIDTH_MAP } from "./sizes.js";
import { MapEditor } from "./mapForEdit.js";
import { stateEditor } from "./state.js";
import { applyEventsToCanvas } from "./drawing.js";
import {} from "./interactionWithBuldings.js";
import { imageFloor, imageWall } from "./fillingBuldings.js";
import { panOffset, scaleData } from "./panning.js";

function setupForEditor()
{
    stateEditor.canvas = document.getElementById('editor');

    stateEditor.canvas.width = WIDTH_MAP;
    stateEditor.canvas.height = HEIGHT_MAP;

    stateEditor.ctx = stateEditor.canvas.getContext('2d');

    stateEditor.ctx.canvas.width = WIDTH_MAP;
    stateEditor.ctx.canvas.height = HEIGHT_MAP;

    stateEditor.map = new MapEditor(WIDTH_MAP, HEIGHT_MAP, imageFloor, imageWall);
}

const clock = new Clock();

function edit()
{
    if (stateEditor.map.isSaveMap) return;

    let deltaTime = clock.getElapsedTime();
    clock.restart();
    
    stateEditor.ctx.save();

    stateEditor.ctx.translate(-panOffset.x * scaleData.scale + scaleData.scaleOffset.x,
                              -panOffset.y * scaleData.scale + scaleData.scaleOffset.y);
    stateEditor.ctx.scale(scaleData.scale, scaleData.scale);

    stateEditor.ctx.clearRect(0, 0, (stateEditor.canvas.width * scaleData.scale - scaleData.scaleOffset.x) / scaleData.scale,
                                    (stateEditor.canvas.height * scaleData.scale - scaleData.scaleOffset.y) / scaleData.scale);
    stateEditor.map.draw(stateEditor.ctx, 0, 0, viewportWidth, viewportHeight, panOffset, scaleData);

    stateEditor.ctx.restore();
    
    // console.log(deltaTime)

    requestAnimationFrame(edit);
}

setupForEditor();

const buttonSave = document.getElementsByClassName("button-saving")[0];
buttonSave.addEventListener("click", () => {
    const inputName = document.getElementById("name");
    const nameMap = inputName.value;
    console.log(nameMap);
    if (nameMap.length == 0) return;
    stateEditor.map.saveMap(nameMap, stateEditor.ctx);
});

window.addEventListener("load", () => {

    stateEditor.canvas.width = stateEditor.canvas.offsetWidth;
    stateEditor.canvas.height = stateEditor.canvas.offsetHeight;
})

applyEventsToCanvas(stateEditor.canvas);
edit();