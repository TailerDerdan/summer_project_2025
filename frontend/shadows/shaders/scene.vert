precision mediump float;

attribute vec2 vertex;

varying vec2 texCoord;

uniform vec2 canvasAspect;

void main(){
    texCoord = vertex * 0.5 + 0.5;
    gl_Position = vec4(vertex.x * canvasAspect.x, vertex.y * canvasAspect.y, 0.0, 1.0);
}