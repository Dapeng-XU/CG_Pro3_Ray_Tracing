/**
 * Created by 40637 on 2017/4/13.
 */

var OneColorVertexShader = [
    'void main(void) {',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var OneColorFragmentShader = [
    'precision highp float;',
    'uniform vec3 faceColor;',
    '',
    'void main(void) {',
    '   gl_FragColor = vec4(faceColor, 1.0);',
    '}'
].join('\n');

function OneColorShadingMaterial() {
    "use strict";
    return new THREE.ShaderMaterial({
        uniforms: {
            "faceColor": {
                value: new THREE.Color(Math.random(), Math.random(), Math.random())
            }
        },
        vertexColors: THREE.FaceColors,
        vertexShader: OneColorVertexShader,
        fragmentShader: OneColorFragmentShader
    });
}

var SimpleGradientVertexShader = [
    'uniform float width;',
    'uniform float doublePi;',
    'varying vec3 turbulence;',
    '',
    'void main(void) {',
    '   turbulence = (doublePi / width * position);',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var SimpleGradientFragmentShader = [
    'precision highp float;',
    'uniform vec3 faceColor;',
    'varying vec3 turbulence;',
    '',
    'void main(void) {',
    '   vec3 faceColor_2 = faceColor + TURBULENCE_COEFF * turbulence;',
    '   gl_FragColor = vec4(faceColor_2, 1.0);',
    '}'
].join('\n');

function SimpleGradientShadingMaterial(turbulenceCoefficient) {
    "use strict";
    return new THREE.ShaderMaterial({
        uniforms: {
            "width": {
                value: GRID_WIDTH + 0.001
            },
            "faceColor": {
                value: new THREE.Color(Math.random(), Math.random(), Math.random())
            },
            "doublePi": {
                value: 2*Math.acos(-1.0)
            }
        },
        defines: {
            TURBULENCE_COEFF: turbulenceCoefficient + 0.001
        },
        vertexColors: THREE.FaceColors,
        vertexShader: SimpleGradientVertexShader,
        fragmentShader: SimpleGradientFragmentShader
    });
}

var MatrixTransposeFunction = [
    'highp mat4 transpose(in highp mat4 inMatrix) {',
    '   highp vec4 i0 = inMatrix[0];',
    '   highp vec4 i1 = inMatrix[1];',
    '   highp vec4 i2 = inMatrix[2];',
    '   highp vec4 i3 = inMatrix[3];',
    '',
    '   highp mat4 outMatrix = mat4(',
    '               vec4(i0.x, i1.x, i2.x, i3.x),',
    '               vec4(i0.y, i1.y, i2.y, i3.y),',
    '               vec4(i0.z, i1.z, i2.z, i3.z),',
    '               vec4(i0.w, i1.w, i2.w, i3.w)',
    '               );',
    '',
    '   return outMatrix;',
    '}'
].join('\n');

var PhongVertexShader = [
    // 'ws' means the world space.
    'uniform vec3 lightPosition;',
    'varying vec3 wsInterpolatedView;',
    'varying vec3 wsInterpolatedNormal;',
    'varying vec3 wsInterpolatedLight;',
    '',
    MatrixTransposeFunction,
    '',
    'void main(void) {',
    '   vec3 wsPosition = vec3( modelMatrix * vec4( position, 1.0 ) );',
    '   wsInterpolatedView = cameraPosition - wsPosition;',
    '   wsInterpolatedLight = lightPosition - wsPosition;',
    '   wsInterpolatedNormal = vec3( transpose(viewMatrix) * vec4(normalMatrix * normal, 0.0 ) );',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    '}'
].join('\n');

var PhongFragmentShader = [
    'precision highp float;',
    'uniform vec3 faceColor;',
    'uniform vec4 k_values;',               /* k_a, k_d, k_s, alpha */
    'uniform vec3 ambientColor;',
    'uniform vec3 diffuseColor;',
    'uniform vec3 specularColor;',
    'varying vec3 wsInterpolatedView;',
    'varying vec3 wsInterpolatedNormal;',
    'varying vec3 wsInterpolatedLight;',
    'attribute vec3 lightPos;',
    '',
    'void main(void) {',
    '   vec3 wsView = normalize(wsInterpolatedView);',
    '   vec3 wsNormal = normalize(wsInterpolatedNormal);',
    '   vec3 wsLight = normalize(wsInterpolatedLight);',
    '   float dot_light_normal = dot(wsLight, wsNormal);',
    '',
    '   vec3 ambient = k_values.x * ambientColor;',
    '',
    '   vec3 wsReflect = 2.0 * dot_light_normal * wsNormal - wsLight;',
    '   if (dot_light_normal > 0.0) {',
    '       vec3 diffuse = k_values.y * dot_light_normal * diffuseColor;',
    '       vec3 specular = k_values.z * pow( max(dot(wsReflect, wsView), 0.0) , k_values.w ) * specularColor;',
    '       gl_FragColor = vec4( (ambient + diffuse + specular) , 1.0);',
    '   } else {', // color mix
    '       gl_FragColor = vec4( ambient, 1.0);',
    '   }',
    '}'
].join('\n');

function PhongShadingMaterial(lightGridPos, ambientIntensity, diffuseIntensity, specularIntensity, alpha) {
    "use strict";
    var diffuseColor = new THREE.Color(Math.random(), Math.random(), Math.random());
    var ambientColor = diffuseColor.multiplyScalar(0.5);
    return new THREE.ShaderMaterial({
        uniforms: {
            // "faceColor": {
            //     value: new THREE.Color(Math.random(), Math.random(), Math.random())
            // },
            "lightPosition": {
                value: lightGridPos.getVector3()
            },
            "k_values": {
                value: new THREE.Vector4(ambientIntensity, diffuseIntensity, specularIntensity, alpha)    /* k_a, k_d, k_s, alpha */
            },
            "ambientColor": {
                value: ambientColor.multiplyScalar(1.0)
            },
            "diffuseColor": {
                value: diffuseColor.multiplyScalar(1.0)
            },
            "specularColor": {
                value: (new THREE.Color(1.0, 1.0, 1.0)).multiplyScalar(1.0)
            }
        },
        vertexColors: THREE.FaceColors/*THREE.VertexColors*/,
        vertexShader: PhongVertexShader,
        fragmentShader: PhongFragmentShader
    });
}

var GouraudVertexShader = [
    'uniform vec3 lightPosition;',
    'varying float gouraudFactor;',
    '',
    MatrixTransposeFunction,
    '',
    'void main(void) {',
    '   vec3 wsPosition = vec3( modelMatrix * vec4(position, 1.0) );',
    '   vec3 wsLight = lightPosition - wsPosition;',
    '   vec3 wsNormal = normalize(vec3(  transpose(viewMatrix) * vec4(normalMatrix * normal, 0.0)) );',
    '   gouraudFactor = dot(wsNormal, wsLight);',
    '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
].join('\n');

var GouraudFragmentShader = [
    'uniform vec3 diffuseColor;',
    'uniform float diffuse;',
    'uniform vec3 lightColor;',
    'varying float gouraudFactor;',
    '',
    'void main(void) {',
    '   gl_FragColor = vec4( diffuse * diffuseColor * max(gouraudFactor, 0.0) * lightColor, 1.0);',
    '}'
].join('\n');

function GouraudShadingMaterial(gridLightPos, diffuse) {
    "use strict";
    var lightColor = new THREE.Color(1.0,1.0,1.0);
    var diffuseColor = (new THREE.Color(Math.random(), Math.random(), Math.random())).multiplyScalar(0.75);
    return new THREE.ShaderMaterial({
        uniforms: {
            "lightPosition": {
                value: gridLightPos.getVector3()
            },
            "diffuseColor": {
                value: diffuseColor.multiplyScalar(1.0)
            },
            "diffuse": {
                value: diffuse
            },
            "lightColor": {
                value: lightColor.multiplyScalar(1.0)
            }
        },
        vertexColors: THREE.FaceColors,
        vertexShader: GouraudVertexShader,
        fragmentShader: GouraudFragmentShader
    });
}