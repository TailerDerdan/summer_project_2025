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
}