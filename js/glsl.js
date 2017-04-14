/**
 * Created by 40637 on 2017/4/13.
 */

var cuboidsVertexShader = [
    // 'varying float gouraudFactor;',
    // 'uniform vec3 wsLight;',
    'uniform float halfWidth;',
    'uniform vec3 faceColor;',
    'varying vec3 fcolor;',
    // 'attribute vec3 faceColor;',
    'void main(void) {',
    // '   vec3 wsNormal;',
    // '   wsNormal = normalize(g3d_)',
    // '   gouraudFactor = dot(wsNormal, wsLight);',
    // '   fcolor = vec3(sin(position / halfWidth) / max());',
    '   fcolor = faceColor;',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var cuboidsFragmentShader = [
    'precision highp float;',
    'varying vec3 fcolor;',
    'void main(void) {',
    //vec4(0.9, 0.9, 0.5, 1.0)
    // '   gl_FragColor = vec4(0.9, 0.9, 0.5, 1.0);',
    '   gl_FragColor = vec4(fcolor, 1.0);',
    '}'
].join('\n');