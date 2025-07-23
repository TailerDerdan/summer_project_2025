class Vertex
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    isPointConcerns(container, xView, yView)
    {
        const sinAngle = Math.sin(-container.dir * Math.PI / 180);
        const cosAngle = Math.cos(-container.dir * Math.PI / 180);

        const localX = (container.x - this.x) * cosAngle - (container.y - this.y) * sinAngle;
        const localY = (container.x - this.x) * sinAngle + (container.y - this.y) * cosAngle;

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
        this.x = xCoord;
        this.y = yCoord;
        this.dir = dir;
        this.vertices = [];

        this.fillVertices();
    }

    updateX(x) { this.x = x; };
    updateY(y) { this.y = y; };
    updateDir(dir) { this.dir = dir; };

    getCenterX() { return this.x + this.width / 2; }
    getCenterY() { return this.y + this.height / 2; }

    fillVertices()
    {
        const vertexLeftTop = new Vertex(this.x, this.y);
        const vertexLeftBottom = new Vertex(this.x, this.y + this.height);
        
        const vertexRightTop = new Vertex(this.x + this.width, this.y);
        const vertexRightBottom = new Vertex(this.x + this.width, this.y + this.height);

        this.vertices.push(vertexLeftTop);
        this.vertices.push(vertexLeftBottom);
        this.vertices.push(vertexRightTop);
        this.vertices.push(vertexRightBottom);

        const countVertexOnSide = 6;

        for (let iterSide = 1; iterSide < countVertexOnSide; iterSide++)
        {
            const vertexTopSide = new Vertex(this.x + this.width / countVertexOnSide * iterSide, this.y);
            this.vertices.push(vertexTopSide);

            const vertexRightSide = new Vertex(this.x + this.width, this.y + this.height / countVertexOnSide * iterSide);
            this.vertices.push(vertexRightSide);

            const vertexBottomSide = new Vertex(this.x + this.width / countVertexOnSide * iterSide, this.y + this.height);
            this.vertices.push(vertexBottomSide);

            const vertexLeftSide = new Vertex(this.x, this.y + this.height / countVertexOnSide * iterSide);
            this.vertices.push(vertexLeftSide);
        }
    }

    deleteVertices()
    {
        this.vertices.splice(0, this.vertices.length - 1);
    }
    
    isTwoContainerConcerns(container, xView, yView)
    {
        
        for (const vertex of this.vertices)
        {
            if (vertex.isPointConcerns(container, xView, yView))
            {
                return true;
            }
        }

        for (const vertex of container.vertices)
        {
            if (vertex.isPointConcerns(this, xView, yView))
            {
                return true;
            }
        }
    }

    drawContainer(ctx, x = -this.width / 2, y = -this.height / 2)
    {
        ctx.strokeStyle = 'rgba(9, 255, 0, 1)';
        ctx.strokeRect(x, y, this.width, this.height);
    }
}