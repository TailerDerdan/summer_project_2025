export class Vec2
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}

function substract(v1, v2)
{
    return {
        x: v1.x - v2.x,
        y: v1.y - v2.y
    };
}

const distance = (vec) => Math.hypot(vec.x, vec.y);

function unitVector(vec)
{
    const diag = distance(vec);
    return {
        x: vec.x / diag,
        y: vec.y / diag,
    };
}

function multiply(vec, scalar)
{
    return {
        x: vec.x * scalar,
        y: vec.y * scalar,
    }
}

function add(vec1, vec2)
{
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y,
    }
}

export function calculateGeometry(inputs)
{
    const wa = substract(inputs.a, inputs.light);
    const sa = multiply(unitVector(wa), inputs.lightRadius);
    const ea = add(inputs.light, sa);

    const wb = substract(inputs.b, inputs.light);
    const sb = multiply(unitVector(wb), inputs.lightRadius);
    const eb = add(inputs.light, sb);

    // console.log(ea, eb)

    if (ea.y >= 0 && ea.y <= 0.75 && Math.abs(ea.x) >= 1.8)
    {
        ea.y = 0.8;
    }

    if (eb.y >= 0 && eb.y <= 0.75 && Math.abs(eb.x) >= 1.8)
    {
        eb.y = 0.8;
    }

    if (ea.y <= 0 && ea.y >= -0.75 && Math.abs(ea.x) >= 1.8)
    {
        ea.y = -0.8;
    }

    if (eb.y <= 0 && eb.y >= -0.75 && Math.abs(eb.x) >= 1.8)
    {
        eb.y = -0.8;
    }

    return new Float32Array([
        inputs.a.x,
        inputs.a.y,

        ea.x,
        ea.y,

        inputs.b.x,
        inputs.b.y,

        ea.x,
        ea.y,

        eb.x,
        eb.y,

        inputs.b.x,
        inputs.b.y
    ])
}