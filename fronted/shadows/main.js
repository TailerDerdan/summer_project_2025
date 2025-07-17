import { canvas } from "../canvas.js";
import { calculateGeometry } from "./geometry.js";

async function setup()
{
    const gl = canvas.getContext("webgl");
    
    if (!gl) 
    {
        console.log(canvas, gl);
        // alert("WebGL не поддерживается!");
        return;
    }
    let vertexShaderSrc, fragmentShaderSrc;
    [vertexShaderSrc, fragmentShaderSrc] = await Promise.all([
            fetch("shaders/shadow.vert").then(res => res.text()),
            fetch("shaders/shadow.frag").then(res => res.text()),
    ]);

    let programInfo = twgl.createProgramInfo(gl, [vertexShaderSrc, fragmentShaderSrc]);

    const arrays = {
        vertex: { 
            numComponents: 2,
            data: [],
        }
    }
    
    const shadowBuffer = twgl.createBufferInfoFromArrays(gl, arrays);
    const lightPosition = {x: 0, y: -1};

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
        src: "./assets/lightsource.png",
    });

    let vertexShaderSrcLight, fragmentShaderSrcLight;
    [vertexShaderSrcLight, fragmentShaderSrcLight] = await Promise.all([
            fetch("shaders/light.vert").then(res => res.text()),
            fetch("shaders/light.frag").then(res => res.text()),
    ]);

    const sceneTexture = twgl.createTexture(gl, {
        src: "./assets/scene.jpg",
    });

    let vertexShaderSrcScene, fragmentShaderSrcScene;
    [vertexShaderSrcScene, fragmentShaderSrcScene] = await Promise.all([
            fetch("shaders/scene.vert").then(res => res.text()),
            fetch("shaders/scene.frag").then(res => res.text()),
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

    canvas.addEventListener("mousemove", (event) => {

        lightPosition.x = (event.offsetX / canvas.width) * 2 - 1;
        lightPosition.y = -((event.offsetY / canvas.height) * 2 - 1);

    })

    return {
        gl,
        programInfo,
        shadowBuffer,
        lightPosition,
        quadBuffer,
        lightTexture,
        lightProgram,
        shadowFrameBuffer,
        sceneFramebuffer,
        sceneProgram,
        sceneTexture
    };
}

function render(state)
{
    const { 
        gl,
        programInfo,
        shadowBuffer,
        lightPosition,
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

    const inputs = {
        light: lightPosition,
        a: {x: -0.5, y: 0},
        b: {x: 0.5, y: 0},
        lightRadius: 3,
    }

    const vertices = calculateGeometry(inputs);

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
        lightPosition: [lightPosition.x, lightPosition.y],
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
    twgl.setUniforms(sceneProgram, {
        lightTexture: sceneFramebuffer.attachments[0],
        sceneTexture: sceneTexture,
    })
    twgl.drawBufferInfo(gl, lightBuffer);
}

const state = {
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

async function start()
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
    
    const frame = () => {
        render(state);
        requestAnimationFrame(frame);
    }
    frame();
}

console.log(canvas);

start();