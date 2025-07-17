export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');

(function setFullscreen() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}());

export const TILE_WIDTH = 15;
export const TILE_HEIGHT = 15;

export const COUNT_TILE_X = 334;
export const COUNT_TILE_Y = 200;

export const WIDTH_MAP = TILE_WIDTH * COUNT_TILE_X;
export const HEIGHT_MAP = TILE_HEIGHT * COUNT_TILE_Y;