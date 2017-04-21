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

var PhongVertexShader = [
    'uniform vec3 lightPosition;',
    'varying vec3 wsInterpolatedView;',
    'varying vec3 wsInterpolatedNormal;',
    'varying vec3 wsInterpolatedLight;',
    '',
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
    '}',
    '',
    'void main(void) {',
    '   vec3 wsPosition = vec3( modelMatrix * vec4( position, 1.0 ) );',
    '   wsInterpolatedView = cameraPosition - wsPosition;',
    '   wsInterpolatedLight = lightPosition - wsPosition;',
    '   wsInterpolatedNormal = vec3( transpose(viewMatrix) * modelViewMatrix * vec4( normal, 0.0 ) );',
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
    '   vec3 specular = k_values.z * pow( max(dot(wsReflect, wsView), 0.0) , k_values.w )', /* * pow(, k_values.w)*/
    '         * specularColor;', /*/ pow(length(wsInterpolatedLight), 0.9)*/
    '   gl_FragColor = vec4( (ambient + diffuse + specular) * faceColor, 1.0);',
    '   } else {',
    '       gl_FragColor = vec4( ambient * faceColor, 1.0);',
    '   }',
    '}'
].join('\n');

function PhongShadingMaterial(lightGridPos, ambientIntensity, diffuseIntensity, specularIntensity, alpha) {
    return new THREE.ShaderMaterial({
        uniforms: {
            "faceColor": {
                value: new THREE.Color(Math.random(), Math.random(), Math.random())
            },
            "lightPosition": {
                value: lightGridPos.getVector3()
            },
            "k_values": {
                value: new THREE.Vector4(ambientIntensity, diffuseIntensity, specularIntensity, alpha)    /* k_a, k_d, k_s, alpha */
            },
            "ambientColor": {
                value: (new THREE.Color(0.2, 0.1, 0.3)).multiplyScalar(1.0)
            },
            "diffuseColor": {
                value: (new THREE.Color(0.2, 0.3, 0.4)).multiplyScalar(3.0)
            },
            "specularColor": {
                value: new THREE.Color(1.0, 1.0, 1.0)
            }
        },
        vertexColors: THREE.FaceColors/*THREE.VertexColors*/,
        vertexShader: PhongVertexShader,
        fragmentShader: PhongFragmentShader
    });
}

PhongParameter = {
    a : 1.0,
    d : 1.0,
    s : 0.6,
    alpha : 1.01
};

