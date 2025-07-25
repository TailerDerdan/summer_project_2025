import { camera } from "../camera/camera.js";
import { canvas, canvasWebgl, gl, state } from "../canvas.js";
import { map } from "../map/map.js";
import { player } from "../player/player.js";
import { calculateGeometry } from "./geometry.js";

export const texture2D = gl.createTexture();

export function updateTexture()
{
    if (canvas.width === 0 || canvas.height === 0) return;

    gl.bindTexture(gl.TEXTURE_2D, texture2D);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas
    );
}

async function setup()
{
    if (!gl) 
    {
        alert("WebGL не поддерживается!");
        return;
    }
    let vertexShaderSrc, fragmentShaderSrc;
    [vertexShaderSrc, fragmentShaderSrc] = await Promise.all([
            fetch("./shadows/shaders/shadow.vert").then(res => res.text()),
            fetch("./shadows/shaders/shadow.frag").then(res => res.text()),
    ]);

    let programInfo = twgl.createProgramInfo(gl, [vertexShaderSrc, fragmentShaderSrc]);

    const arrays = {
        vertex: { 
            numComponents: 2,
            data: [],
        }
    }
    
    const shadowBuffer = twgl.createBufferInfoFromArrays(gl, arrays);

    const quadArrays = {
        vertex: {
            numComponents: 2,
            data: new Float32Array([
                -1, -1,
                -1, 1,
                1, -1,

                -1, 1,
                1, -1,
                1, 1,
            ]),
        }
    }

    const lightTexture = twgl.createTexture(gl, {
        src: "./shadows/assets/lightsource.png",
    });

    let vertexShaderSrcLight, fragmentShaderSrcLight;
    [vertexShaderSrcLight, fragmentShaderSrcLight] = await Promise.all([
            fetch("./shadows/shaders/light.vert").then(res => res.text()),
            fetch("./shadows/shaders/light.frag").then(res => res.text()),
    ]);

    const sceneTexture = texture2D;

    let vertexShaderSrcScene, fragmentShaderSrcScene;
    [vertexShaderSrcScene, fragmentShaderSrcScene] = await Promise.all([
            fetch("./shadows/shaders/scene.vert").then(res => res.text()),
            fetch("./shadows/shaders/scene.frag").then(res => res.text()),
    ]);

    const lightProgram = twgl.createProgramInfo(gl, [vertexShaderSrcLight, fragmentShaderSrcLight]);
    const sceneProgram = twgl.createProgramInfo(gl, [vertexShaderSrcScene, fragmentShaderSrcScene]);
    const quadBuffer = twgl.createBufferInfoFromArrays(gl, quadArrays);

    const attachments = [
        {
            format: gl.RGBA,
            type: gl.UNSIGNED_BYTE,
            min: gl.LINEAR,
            wrap: gl.CLAMP_TO_EDGE,
        }
    ];

    const shadowFrameBuffer = twgl.createFramebufferInfo(gl, attachments);
    const sceneFramebuffer = twgl.createFramebufferInfo(gl, attachments);

    return {
        gl,
        programInfo,
        shadowBuffer,
        quadBuffer,
        lightTexture,
        lightProgram,
        shadowFrameBuffer,
        sceneFramebuffer,
        sceneProgram,
        sceneTexture
    };
}

export function render(state)
{
    const { 
        gl,
        programInfo,
        shadowBuffer,
        lightBuffer,
        lightTexture,
        lightProgram,
        shadowFrameBuffer,
        sceneFramebuffer,
        sceneProgram,
        sceneTexture
    } = state;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    twgl.bindFramebufferInfo(gl, shadowFrameBuffer)

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const canvasToGlCoords = (canvasCoord) => ({
        x: ((canvasCoord.x) / canvasWebgl.width) * 2 - 1,
        y: -((canvasCoord.y / canvasWebgl.height) * 2 - 1),
    });

    const vertices = [];
    for (const wall of map.walls)
    {
        vertices.push(...calculateGeometry(
            {
                light: player.lightPosition,
                a: canvasToGlCoords({x: (wall.x - camera.xView), y: (wall.y - camera.yView)}),
                b: canvasToGlCoords({x: (wall.x - camera.xView) + wall.width, y: (wall.y - camera.yView)}),
                lightRadius: 3,
            }
        ));

        vertices.push(...calculateGeometry(
            {
                light: player.lightPosition,
                a: canvasToGlCoords({x: (wall.x - camera.xView) + wall.width, y: (wall.y - camera.yView)}),
                b: canvasToGlCoords({x: (wall.x - camera.xView) + wall.width, y: (wall.y - camera.yView) + wall.height}),
                lightRadius: 3,
            }
        ));

        vertices.push(...calculateGeometry(
            {
                light: player.lightPosition,
                a: canvasToGlCoords({x: (wall.x - camera.xView), y: (wall.y - camera.yView) + wall.height}),
                b: canvasToGlCoords({x: (wall.x - camera.xView) + wall.width, y: (wall.y - camera.yView) + wall.height}),
                lightRadius: 3,
            }
        ));

        vertices.push(...calculateGeometry(
            {
                light: player.lightPosition,
                a: canvasToGlCoords({x: (wall.x - camera.xView), y: (wall.y - camera.yView)}),
                b: canvasToGlCoords({x: (wall.x - camera.xView), y: (wall.y - camera.yView) + wall.height}),
                lightRadius: 3,
            }
        ));
        
    }

    twgl.setAttribInfoBufferFromArray(gl, shadowBuffer.attribs.vertex, vertices);
    shadowBuffer.numElements = vertices.length / 2;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, shadowBuffer);
    twgl.drawBufferInfo(gl, shadowBuffer);

    //Draw light
    twgl.bindFramebufferInfo(gl, sceneFramebuffer);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);

    gl.useProgram(lightProgram.program);
    twgl.setBuffersAndAttributes(gl, lightProgram, lightBuffer);
    twgl.setUniforms(lightProgram, {
        lightPosition: [player.lightPosition.x, player.lightPosition.y],
        shadowTexture: shadowFrameBuffer.attachments[0],
        lightTexture: lightTexture,
    })
    twgl.drawBufferInfo(gl, lightBuffer);

    //Draw scene
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.DST_ALPHA);

    gl.useProgram(sceneProgram.program);
    twgl.setBuffersAndAttributes(gl, sceneProgram, lightBuffer);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, sceneTexture);
    const aspect = canvas.width / canvas.height;
    twgl.setUniforms(sceneProgram, {
        lightTexture: sceneFramebuffer.attachments[0],
        sceneTexture: sceneTexture,
        canvasAspect: [aspect, 1.0],
    })
    twgl.drawBufferInfo(gl, lightBuffer);
}

export async function start()
{
    await setup().then((data) => {

        state.gl = data.gl;
        state.programInfo = data.programInfo;
        state.shadowBuffer = data.shadowBuffer;
        state.lightPosition = data.lightPosition;
        state.lightBuffer = data.quadBuffer;
        state.lightTexture = data.lightTexture;
        state.lightProgram = data.lightProgram;
        state.shadowFrameBuffer = data.shadowFrameBuffer;
        state.sceneFramebuffer = data.sceneFramebuffer;
        state.sceneProgram = data.sceneProgram;
        state.sceneTexture = data.sceneTexture;
    });
}

start();