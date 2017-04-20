/**
 * Created by 40637 on 2017/4/13.
 */

var GradientVertexShader = [
    'uniform float width;',
    'uniform float doublePi;',
    'varying vec3 turbulence;',
    '',
    'void main(void) {',
    '   turbulence = (doublePi / width * position);',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var GradientFragmentShader = [
    'precision highp float;',
    'uniform vec3 faceColor;',
    'varying vec3 turbulence;',
    '',
    'void main(void) {',
    '   vec3 faceColor_2 = faceColor + TURBULENCE_COEFF * turbulence;',
    '   gl_FragColor = vec4(faceColor_2, 1.0);',
    '}'
].join('\n');

var PhongVertexShader = [
    'varying float gouraudFactor;',
    'uniform vec3 wsLight;',
    '',
    'void main(void) {',
    // '   vec3 wsNormal;',
    // '   wsNormal = normalize(g3d_)',
    // '   gouraudFactor = dot(wsNormal, wsLight);',
    // '   fcolor = vec3(sin(position / halfWidth) / max());',
    '   fcolor = faceColor;',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'

 /*   uniform float ambientIntensity;
uniform float specularIntensity;
uniform float diffuseIntensity;

uniform vec3 ambientColor;

// light
uniform vec3 lightPosition;
uniform vec3 lightColor;

// surface
uniform vec3 surfaceColor;		// unknown
uniform vec3 surfaceNormal;		// unknown

// viewer
uniform vec3 cameraPosition;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

void main(void) {
    //
    vec3 lightDirection = lightPosition - vertexPosition;
    vec3 reflectionDirection = 2 * dot(surfaceNormal * lightDirection) * normalize(surfaceNormal) - lightDirection;
    gl_Position = ;
}*/
].join('\n');

var PhongFragmentShader = [
    'precision highp float;',
    'varying vec3 fcolor;',
    'void main(void) {',
    //vec4(0.9, 0.9, 0.5, 1.0)
    // '   gl_FragColor = vec4(0.9, 0.9, 0.5, 1.0);',
    '   gl_FragColor = vec4(fcolor, 1.0);',
    '}'
].join('\n');