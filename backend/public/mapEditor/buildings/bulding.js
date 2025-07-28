import { COUNT_TILE_X, COUNT_TILE_Y, TILE_HEIGHT, TILE_WIDTH } from "../sizes.js";
import { choosenBuilding, TypeBuilding } from "./deterBuildings.js";

const COLOR_GOOD_PLACE_FOR_BUILDING = 'rgba(3, 205, 0, 1)';
const COLOR_BAD_PLACE_FOR_BUILDING = 'rgba(207, 0, 0, 1)';

export class Building
{
    constructor(widthSprite, heightSprite, widthOnMap, heightOnMap, countSprite, isItPutThisBuildingOnAnother, rotation, srcImage, nameOfBuilding)
    {
        this.widthSprite = widthSprite;
        this.heightSprite = heightSprite;
        this.widthOnMap = widthOnMap;
        this.heightOnMap = heightOnMap;
        this.countSprite = countSprite;
        this.isItPutThisBuildingOnAnother = isItPutThisBuildingOnAnother;
        this.rotation = rotation;
        this.image = new Image();
        this.image.src = srcImage;
        this.rectsForSprite = [];
        this.nameOfBuilding = nameOfBuilding;
    }

    fillSprite(lastTypeOfBuilding, TypeBuilding, countSpriteInLine, countSpriteInLineInCanvas)
    {
        let yCoord = 0;
        let yOnCanvas = 0;
    
        let MARGIN_TILE_FLOOR_X = 5;
        let MARGIN_TILE_FLOOR_Y = 5;

        countSpriteInLine -= 1;
    
        for (let iter = lastTypeOfBuilding, xCoord = 0, xOnCanvas = 0; iter <= lastTypeOfBuilding + this.countSprite; iter++, xCoord++, xOnCanvas++)
        {
            TypeBuilding[`${this.nameOfBuilding}${iter - lastTypeOfBuilding + 1}`] = iter;

            if (this.nameOfBuilding == "Wall")
            {
                console.log(xCoord, yCoord, xOnCanvas, yOnCanvas, countSpriteInLine, countSpriteInLineInCanvas);
            }

            this.rectsForSprite.push(
            {
                sx: xCoord * this.widthSprite,
                sy: yCoord * this.heightSprite,
                sWidth: this.widthSprite,
                sHeight: this.heightSprite,
                dx: xOnCanvas * this.widthOnMap + MARGIN_TILE_FLOOR_X,
                dy: yOnCanvas * this.heightOnMap + MARGIN_TILE_FLOOR_Y,
                dWidth: this.widthOnMap,
                dHeight: this.heightOnMap,
            });
    
            if (xCoord == countSpriteInLine)
            {
                xCoord = -1;
                yCoord++;
            }
    
            if (xOnCanvas == countSpriteInLineInCanvas)
            {
                xOnCanvas = -1;
                yOnCanvas++;
                MARGIN_TILE_FLOOR_X = 0;
                MARGIN_TILE_FLOOR_Y += 5;
            }
            MARGIN_TILE_FLOOR_X += 5;
        }
    }

    interactionWithBuilding(event)
    {
        const {offsetX, offsetY} = event;
        console.log(event, offsetX, offsetY, this)
        
        for (let iter = 0; iter < this.countSprite; iter++)
        {
            console.log(this.rectsForSprite[iter].dx, this.rectsForSprite[iter].dWidth, this.rectsForSprite[iter].dy, this.rectsForSprite[iter].dHeight);
            if (offsetX >= this.rectsForSprite[iter].dx &&
                offsetX <= this.rectsForSprite[iter].dx + this.rectsForSprite[iter].dWidth &&
                offsetY >= this.rectsForSprite[iter].dy &&
                offsetY <= this.rectsForSprite[iter].dy + this.rectsForSprite[iter].dHeight
            )
            {
                choosenBuilding.state = iter + TypeBuilding[`${this.nameOfBuilding}${1}`];
                console.log(choosenBuilding);
                return;
            }
        }
    }

    drawForCanvasForChoice(ctxForSprite, canvasForSprite)
    {
        choosenBuilding.state = TypeBuilding[`${this.nameOfBuilding}${1}`];

        ctxForSprite.clearRect(0, 0, canvasForSprite.width, canvasForSprite.height);
        
        for (let iter = 0; iter < this.countSprite; iter++)
        {
            ctxForSprite.drawImage(this.image,
                this.rectsForSprite[iter].sx,
                this.rectsForSprite[iter].sy,
                this.rectsForSprite[iter].sWidth,
                this.rectsForSprite[iter].sHeight,
                this.rectsForSprite[iter].dx,
                this.rectsForSprite[iter].dy,
                this.rectsForSprite[iter].dWidth,
                this.rectsForSprite[iter].dHeight
            );
        }
    }

    drawOnMainCanvas(tileMap, buildingsObject, buldings, mouseTileX, mouseTileY)
    {
        if (this.nameOfBuilding == "Floor")
        {
            tileMap[mouseTileY * COUNT_TILE_X + mouseTileX] = choosenBuilding.state;
            return;
        }

        let startX = 0;
        let startY = 0;

        let endX = 0;
        let endY = 0;

        switch (this.rotation) {
            case 0:
                startX = mouseTileX;
                startY = mouseTileY;
                endX = startX + Math.ceil(this.widthOnMap / TILE_WIDTH);
                endY = startY + Math.ceil(this.heightOnMap / TILE_HEIGHT);
                break;
            case 90:
                startX = mouseTileX - Math.ceil(this.heightOnMap / TILE_HEIGHT);
                startY = mouseTileY;
                endX = mouseTileX;
                endY = startY + Math.ceil(this.widthOnMap / TILE_WIDTH);
                break;
            case 180:
                startX = mouseTileX - Math.ceil(this.widthOnMap / TILE_WIDTH);
                startY = mouseTileY - Math.ceil(this.heightOnMap / TILE_HEIGHT);
                endX = mouseTileX;
                endY = mouseTileY;
                break;
            case 270:
                startX = mouseTileX;
                startY = mouseTileY - Math.ceil(this.widthOnMap / TILE_WIDTH);
                endX = startX + Math.ceil(this.heightOnMap / TILE_HEIGHT);
                endY = mouseTileY;
                break;
            default:
                startX = mouseTileX;
                startY = mouseTileY;
                endX = startX + Math.ceil(this.widthOnMap / TILE_WIDTH);
                endY = startY + Math.ceil(this.heightOnMap / TILE_HEIGHT);
                break;
        }

        if (startX < 0 || startY < 0 || endX > COUNT_TILE_X || endY > COUNT_TILE_Y) return;

        let isCanIPutBuilding = true;

        if (!this.isItPutThisBuildingOnAnother)
        {
            for (let iterY = startY; iterY < endY; iterY++)
            {
                for (let iterX = startX; iterX < endX; iterX++)
                {
                    if (buldings[iterY * COUNT_TILE_X + iterX])
                    {
                        isCanIPutBuilding = false;
                        break;
                    }
                }
            }
        }

        if (!isCanIPutBuilding && !this.isItPutThisBuildingOnAnother) return;

        for (let iterY = startY; iterY < endY; iterY++)
        {
            for (let iterX = startX; iterX < endX; iterX++)
            {
                buldings[iterY * COUNT_TILE_X + iterX] = choosenBuilding.state;
            }
        }

        buildingsObject.push({
            x: startX,
            y: startY,
            choosenBuilding: choosenBuilding.state,
            rotation: choosenBuilding.rotation,
            width: Math.ceil(this.widthOnMap / TILE_WIDTH),
            height: Math.ceil(this.heightOnMap / TILE_HEIGHT)
        });

        console.log(buildingsObject);
    }

    drawOnMap(ctx, buildingObj)
    {
        let rotation = buildingObj.rotation;

        let centerX = 0;
        let centerY = 0;

        let newWidth = this.widthOnMap;
        let newHeight = this.heightOnMap;

        switch (this.rotation) {
            case 0:
                centerX = buildingObj.x * TILE_WIDTH + buildingObj.width * TILE_WIDTH / 2;
                centerY = buildingObj.y * TILE_HEIGHT + buildingObj.height * TILE_HEIGHT / 2;
                break;
            case 90:
                newWidth = this.heightOnMap;
                newHeight = this.widthOnMap;
                centerX = buildingObj.x * TILE_WIDTH - buildingObj.height * TILE_HEIGHT / 2;
                centerY = buildingObj.y * TILE_HEIGHT + buildingObj.width * TILE_WIDTH / 2;
                break;
            case 180:
                centerX = buildingObj.x * TILE_WIDTH - buildingObj.width * TILE_WIDTH / 2;
                centerY = buildingObj.y * TILE_HEIGHT - buildingObj.height * TILE_HEIGHT / 2;
                break;
            case 270:
                newWidth = this.heightOnMap;
                newHeight = this.widthOnMap;
                centerX = buildingObj.x * TILE_WIDTH + buildingObj.height * TILE_HEIGHT / 2;
                centerY = buildingObj.y * TILE_HEIGHT - buildingObj.width * TILE_WIDTH / 2;
                break;
            default:
                centerX = buildingObj.x * TILE_WIDTH + buildingObj.width * TILE_WIDTH / 2;
                centerY = buildingObj.y * TILE_HEIGHT + buildingObj.height * TILE_HEIGHT / 2;
                break;
        }

        const iter = buildingObj.choosenBuilding - TypeBuilding[`${this.nameOfBuilding}${1}`];

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(
            this.image, 
            this.rectsForSprite[iter].sx,
            this.rectsForSprite[iter].sy,
            this.rectsForSprite[iter].sWidth,
            this.rectsForSprite[iter].sHeight,
            -newWidth / 2,
            -newHeight / 2,
            newWidth,
            newHeight
        );
        ctx.restore();
    }

    static erasingOnMainCanvas(tileMap, buildingsObject, buldings, mouseTileX, mouseTileY)
    {
        tileMap[mouseTileY * COUNT_TILE_X + mouseTileX] = 0;

        const building = buildingsObject.find((elem) => {

            if ((mouseTileX >= elem.x && mouseTileX <= elem.x + elem.width) &&
               (mouseTileY >= elem.y && mouseTileY <= elem.y + elem.height))
            {
                return true;
            }
        });

        if (!building) return;

        for (let iterY = building.y; iterY < building.y + building.height; iterY++)
        {
            for (let iterX = building.x; iterX < building.x + building.width; iterX++)
            {
                buldings[iterY * COUNT_TILE_X + iterX] = 0;
            }
        }

        const indexDeletedBuilding = buildingsObject.indexOf(building);
        buildingsObject.splice(indexDeletedBuilding, 1);
    }
}