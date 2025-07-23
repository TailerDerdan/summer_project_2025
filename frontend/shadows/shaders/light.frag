precision mediump float;

varying vec2 lightTexCoord;
varying vec2 shadowTexCoord;

uniform sampler2D lightTexture;
uniform sampler2D shadowTexture;

void main(){
    vec4 lightColor = texture2D(lightTexture, lightTexCoord);
    vec4 shadowColor = texture2D(shadowTexture, shadowTexCoord);

    float lightIntensity = 1.0 - shadowColor.r;

    gl_FragColor = vec4(lightColor.rgb, lightIntensity);
}