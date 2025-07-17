export const TILE_WIDTH = 15;
export const TILE_HEIGHT = 15;

export const COUNT_TILE_X = 300;
export const COUNT_TILE_Y = 72;

export const WIDTH_MAP = TILE_WIDTH * COUNT_TILE_X;
export const HEIGHT_MAP = TILE_HEIGHT * COUNT_TILE_Y;

export const canvas = document.createElement('canvas');
canvas.width = WIDTH_MAP;
canvas.height = HEIGHT_MAP;
export const ctx = canvas.getContext('2d');

export const canvasWebgl = document.getElementById('webgl-display');
export const gl = canvasWebgl.getContext('webgl');

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