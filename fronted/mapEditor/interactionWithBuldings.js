import { choosenBuilding, CountOfBuildings, imageFloor, imageWall, rectForFloor, rectForWall, stateMouseDowning, TypeBuilding } from "./fillingBuldings.js";

const spritesFloor = document.getElementsByClassName("floor")[0];
const spritesWall = document.getElementsByClassName("wall")[0];
const spritesCar = document.getElementsByClassName("car")[0];

const divSprites = document.getElementsByClassName("choosen-sprites")[0];
const canvasForSprite = document.getElementById("sprites");
const ctxForSprite = canvasForSprite.getContext('2d');

canvasForSprite.width = divSprites.clientWidth;
canvasForSprite.height = divSprites.clientHeight;

window.addEventListener("load", () => {

    canvasForSprite.width = canvasForSprite.offsetWidth;
    canvasForSprite.height = canvasForSprite.offsetHeight;
})

spritesFloor.addEventListener("mousedown", (event) => {
    
    ctxForSprite.clearRect(0, 0, canvasForSprite.width, canvasForSprite.height);

    choosenBuilding.state = TypeBuilding.Floor1;

    for (let iter = 0; iter < CountOfBuildings.Floor; iter++)
    {
        ctxForSprite.drawImage(imageFloor,
            rectForFloor[iter].sx,
            rectForFloor[iter].sy,
            rectForFloor[iter].sWidth,
            rectForFloor[iter].sHeight,
            rectForFloor[iter].dx,
            rectForFloor[iter].dy,
            rectForFloor[iter].dWidth,
            rectForFloor[iter].dHeight
        );
    }

    if (stateMouseDowning.isPressedWall)
    {
        canvasForSprite.removeEventListener('mousedown', interactionWithWall);
        stateMouseDowning.isPressedWall = false;
    }

    canvasForSprite.addEventListener('mousedown', interactionWithFloor);
    stateMouseDowning.isPressedFloor = true;
})

spritesWall.addEventListener("mousedown", (event) => {
    
    choosenBuilding.state = TypeBuilding.Wall1;

    ctxForSprite.clearRect(0, 0, canvasForSprite.width, canvasForSprite.height);

    for (let iter = 0; iter < CountOfBuildings.Wall; iter++)
    {
        ctxForSprite.drawImage(imageWall,
            rectForWall[iter].sx,
            rectForWall[iter].sy,
            rectForWall[iter].sWidth,
            rectForWall[iter].sHeight,
            rectForWall[iter].dx,
            rectForWall[iter].dy,
            rectForWall[iter].dWidth,
            rectForWall[iter].dHeight
        );
    }

    if (stateMouseDowning.isPressedFloor)
    {
        canvasForSprite.removeEventListener('mousedown', interactionWithFloor);
        stateMouseDowning.isPressedFloor = false;
    }

    canvasForSprite.addEventListener('mousedown', interactionWithWall);
    stateMouseDowning.isPressedWall = true;
})

spritesCar.addEventListener("mousedown", (event) => {
    
    choosenBuilding.state = CountOfBuildings.Floor + CountOfBuildings.Wall;
})

const interactionWithFloor = (event) => {

    const {offsetX, offsetY} = event;

    for (let iter = 0; iter < CountOfBuildings.Floor; iter++)
    {
        if (offsetX >= rectForFloor[iter].dx &&
            offsetX <= rectForFloor[iter].dx + rectForFloor[iter].dWidth &&
            offsetY >= rectForFloor[iter].dy &&
            offsetY <= rectForFloor[iter].dy + rectForFloor[iter].dHeight
        )
        {
            choosenBuilding.state = iter + 1;
            console.log(choosenBuilding);
            return;
        }
    }
}

const interactionWithWall = (event) => {

    const {offsetX, offsetY} = event;

    for (let iter = 0; iter < CountOfBuildings.Wall; iter++)
    {
        if (offsetX >= rectForWall[iter].dx &&
            offsetX <= rectForWall[iter].dx + rectForWall[iter].dWidth &&
            offsetY >= rectForWall[iter].dy &&
            offsetY <= rectForWall[iter].dy + rectForWall[iter].dHeight
        )
        {
            choosenBuilding.state = iter + 1 + CountOfBuildings.Floor;
            console.log(choosenBuilding);
            return;
        }
    }
}