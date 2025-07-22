import { HEIGHT_MAP, WIDTH_MAP } from "./sizes.js";

export const canvas = document.createElement('canvas');
canvas.width = WIDTH_MAP;
canvas.height = HEIGHT_MAP;
export const ctx = canvas.getContext('2d');

export const canvasWebgl = document.getElementById('webgl-display');
export const gl = canvasWebgl.getContext('webgl2');

export const state = {
    gl: null,
    programInfo: null,
    shadowBuffer: null,
    lightPosition: null,
    lightBuffer: null,
    lightTexture: null,
    lightProgram: null,
    shadowFrameBuffer: null,
    sceneFramebuffer: null,
    sceneProgram: null,
    sceneTexture: null,
}

function setFullscreen() {

    ctx.canvas.width = WIDTH_MAP;
    ctx.canvas.height = HEIGHT_MAP;

    gl.canvas.width = WIDTH_MAP;
    gl.canvas.height = HEIGHT_MAP;
};

setFullscreen();