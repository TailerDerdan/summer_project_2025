class Vertex
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    isPointConcerns(container)
    {
        const sinAngle = Math.sin(container.dir * Math.PI / 180);
        const cosAngle = Math.cos(container.dir * Math.PI / 180);

        const localX = (container.xCoord - this.x) * cosAngle - (container.yCoord - this.y) * sinAngle;
        const localY = (container.xCoord - this.x) * sinAngle + (container.yCoord - this.y) * cosAngle;
        
        return (
            Math.abs(localX) <= container.width &&
            Math.abs(localY) <= container.height
        );
    }
}

export class Container
{
    constructor(width, height, xCoord, yCoord, dir)
    {
        this.width = width;
        this.height = height;
        this.xCoord = xCoord;
        this.yCoord = yCoord;
        this.dir = dir;
        this.vertices = [];

        this.fillVertices();
    }

    updateX(x) { this.xCoord = x; };
    updateY(y) { this.yCoord = y; };
    updateDir(dir) { this.dir = dir; };

    getCenterX() { return this.xCoord + this.width / 2; }
    getCenterY() { return this.yCoord + this.height / 2; }

    fillVertices()
    {
        const vertexLeftTop = new Vertex(this.xCoord, this.yCoord);
        const vertexLeftBottom = new Vertex(this.xCoord, this.yCoord + this.height);
        
        const vertexRightTop = new Vertex(this.xCoord + this.width, this.yCoord);
        const vertexRightBottom = new Vertex(this.xCoord + this.width, this.yCoord + this.height);

        this.vertices.push(vertexLeftTop);
        this.vertices.push(vertexLeftBottom);
        this.vertices.push(vertexRightTop);
        this.vertices.push(vertexRightBottom);

        const countVertexOnSide = 6;

        for (let iterSide = 1; iterSide < countVertexOnSide; iterSide++)
        {
            const vertexTopSide = new Vertex(this.xCoord + this.width / countVertexOnSide * iterSide, this.yCoord);
            this.vertices.push(vertexTopSide);

            const vertexRightSide = new Vertex(this.xCoord + this.width, this.yCoord + this.height / countVertexOnSide * iterSide);
            this.vertices.push(vertexRightSide);

            const vertexBottomSide = new Vertex(this.xCoord + this.width / countVertexOnSide * iterSide, this.yCoord + this.height);
            this.vertices.push(vertexBottomSide);

            const vertexLeftSide = new Vertex(this.xCoord, this.yCoord + this.height / countVertexOnSide * iterSide);
            this.vertices.push(vertexLeftSide);
        }
    }
    
    isTwoContainerConcerns(container)
    {
        for (const vertex of this.vertices)
        {
            if (vertex.isPointConcerns(container))
            {
                return true;
            }
        }

        for (const vertex of container.vertices)
        {
            if (vertex.isPointConcerns(this))
            {
                return true;
            }
        }
    }

    drawContainer(ctx)
    {
        ctx.strokeStyle = 'rgba(9, 255, 0, 1)';
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
    }
}