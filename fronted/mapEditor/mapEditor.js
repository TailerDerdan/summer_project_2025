import { Camera } from "../camera/camera.js";
import { Clock } from "../clock/clock.js";
import { Map2D } from "../map/map.js";
import { COUNT_TILE_Y, HEIGHT_MAP, TILE_HEIGHT, TILE_WIDTH, WIDTH_MAP } from "../sizes.js";
import { updateMovementEditor } from "./movementEditor.js";

const stateEditor = {
    canvas: null,
    ctx: null,
    map: null,
    camera: null,
    player: null,
}

const mapEditor = {
    x: 400,
    y: 400,
}

const viewportWidth = 1920;
const viewportHeight = 1080;

function setupForEditor()
{
    stateEditor.canvas = document.createElement('canvas');
    stateEditor.canvas.id = "editor";
    document.body.appendChild(stateEditor.canvas);

    stateEditor.canvas.width = WIDTH_MAP;
    stateEditor.canvas.height = HEIGHT_MAP;

    stateEditor.ctx = stateEditor.canvas.getContext('2d');

    stateEditor.ctx.canvas.width = WIDTH_MAP;
    stateEditor.ctx.canvas.height = HEIGHT_MAP;

    stateEditor.map = new Map2D();
    stateEditor.map.generate(stateEditor.ctx);

    stateEditor.player = mapEditor;

    stateEditor.camera = new Camera(0, 0, viewportWidth, viewportHeight, WIDTH_MAP, HEIGHT_MAP);
    stateEditor.camera.follow(stateEditor.player, viewportWidth / 2, viewportHeight / 2);
}

function putWall(event)
{
    const xMouse = event.clientX + stateEditor.camera.xView;
    const yMouse = event.clientY + stateEditor.camera.yView;

    const xBlock = Math.floor(xMouse / TILE_WIDTH);
    const yBlock = Math.floor(yMouse / TILE_HEIGHT);

    stateEditor.map.tileMap[yBlock * COUNT_TILE_Y + xBlock] = 1;
    stateEditor.map.putWall(xBlock, yBlock);
}

document.addEventListener('mousedown', putWall);

const clock = new Clock();

function editorLoop()
{
    let deltaTime = clock.getElapsedTime();
    clock.restart();

    console.log(deltaTime)

    stateEditor.ctx.clearRect(0, 0, stateEditor.canvas.width, stateEditor.canvas.height);

    stateEditor.map.draw(stateEditor.ctx, stateEditor.camera.xView, stateEditor.camera.yView);
    stateEditor.map.updateWalls(stateEditor.ctx, stateEditor.camera.xView, stateEditor.camera.yView);

    updateMovementEditor(stateEditor.player, stateEditor.camera);

    stateEditor.camera.update();

    window.requestAnimationFrame(editorLoop);
}

setupForEditor();
editorLoop();