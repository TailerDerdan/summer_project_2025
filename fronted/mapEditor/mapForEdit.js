import { COUNT_TILE_X, COUNT_TILE_Y } from "../sizes";

class MapEditor
{
    constructor(width, height)
    {
        this.width = width;
        this.height = height;
        this.tileMap = new Array(COUNT_TILE_X * COUNT_TILE_Y).fill(0);
    }
}