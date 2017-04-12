/**
 * Created by 40637 on 2017/3/22.
 */

// 每次窗口的大小发生改变时，也改变画布的大小
window.onresize = canvasResize;

document.body.onload = function () {
    "use strict";
    redraw();
};

// var cube;
// var ball;
var wm;

// 初始化的图形绘制
var scene = new THREE.Scene();
var camera, renderer, raycaster;
var light = new THREE.Group();
scene.add(light);
var canv = document.getElementById('canvas');
// 默认背景色
var DEFAULT_BACKGROUND_COLOR = 0xDDDDDD;
function initGraphics() {
    "use strict";
    var i, j;

    // Three.js的三要素：场景、相机、渲染器。
    // 相机的初始化代码提到后面了
    // 初始化渲染器为使用WebGL的绑定到ID为“canvas”的元素，参数使用JSON表示。
    renderer = new THREE.WebGLRenderer({
        canvas: canv
    });

    // 重设渲染器的大小为窗口大小；否则，默认的渲染大小很小，在屏幕上显示出大的块状。
    // setSize()同时会改变画布大小
    renderer.setSize(canvWidth, canvHeight);
    // 设置画布默认的背景色
    renderer.setClearColor(DEFAULT_BACKGROUND_COLOR);
    if (window.devidevicePixelRatio) {
        renderer.setPixelRatio(window.devicePixelRatio);
    }
    renderer.sortObjects = false;

    drawCheckerboard();

    // 显示一个坐标轴，红色X，绿色Y，蓝色Z
    var axisHelper = new THREE.AxisHelper(2000);
    scene.add(axisHelper);

    wm = new WalkingMatch();
    wm.initialize();

    // 射线，用于拾取(pick)对象
    // raycaster = new THREE.Raycaster();

    updateLight();
    launchDefaultCamera();
    // FPS();

    render();
}

function updateLight() {
    light.add(new THREE.AmbientLight(0x888888, 0.5));
}

function drawCheckerboard() {
    var checkerboard = new THREE.Group();
    for (var i = -5; i < 15; i++) {
        for (var j = -10; j < 10; j++) {
            var geometry = new THREE.PlaneGeometry( 100, 100 );
            var material;
            if ( (i + j) % 2 === 0 ) {
                material = new THREE.MeshBasicMaterial( {color: 0xeeeeee, side: THREE.DoubleSide} );
            } else {
                material = new THREE.MeshBasicMaterial( {color: 0x111111, side: THREE.DoubleSide} );
            }
            var plane = new THREE.Mesh( geometry, material );
            plane.translateX(i * 100);
            plane.translateZ(j * 100);
            plane.rotateX(Math.PI / 2);
            //plane.matrixAutoUpdate = false;
            checkerboard.add( plane );
        }
    }
    scene.add(checkerboard);
}

var LOOKING_AT_POSITION = new THREE.Vector3(1000, 0, 0);

function launchDefaultCamera() {
    camera = new THREE.PerspectiveCamera(40, canvWidth / canvHeight, 0.1, 10000);
    // cPosition = new THREE.Vector3(10,10,10);
    var one = 300;
    camera.position.x = one;
    camera.position.y = one;
    camera.position.z = one;
    camera.lookAt(LOOKING_AT_POSITION);
    // scene.add(camera);
    camera.updateMatrixWorld();
}

function updateCamera() {
    lPosition = new THREE.Vector3(0,0,0);
    camera.lookAt(LOOKING_AT_POSITION);
    camera.updateMatrixWorld();
}

/// Camera Speed
var INCREASING_UNIT = 0.01;

var cameraEllipseAnimate = {
    theta : 0.0,
    xa : 2000,
    zb : 4000,
    yc : 200,
    x : function () {
        return this.xa * Math.cos(this.theta);
    },
    y : function () {
        return 1200 + ( (this.theta >= 0) ? (-this.yc*2/Math.PI*(this.theta - Math.PI/2)) :
            (this.yc*2/Math.PI*(this.theta + Math.PI / 2)) );
        // return 0;
    },
    z : function () {
        return this.zb * Math.sin(this.theta);
    },
    increase : function () {
        this.theta += INCREASING_UNIT;
        while (this.theta > Math.PI) {
            this.theta -= 2 * Math.PI;
        }
    }
};

var cameraAxisAnimate = {
    xPosition : 1600,
    height : 300,
    length : 1000,
    alpha : 0.0,
    x : function () {
        return this.xPosition;
    },
    y : function () {
        return this.height;
    },
    z : function () {
        return this.length / 2 - this.length * Math.abs(1 - this.alpha);
    },
    increase : function () {
        this.alpha += INCREASING_UNIT * 0.1;
        while (this.alpha > 2) {
            this.alpha -= 2;
        }
    }
};

// var period0 = 0;
// var theta = 0;

function animate() {
    // cube.position.x = Date.now() * 3 / 100 % 300 - 150;

    // line
    camera.position.x = cameraAxisAnimate.x();
    camera.position.y = cameraAxisAnimate.y();
    camera.position.z = cameraAxisAnimate.z();
    cameraAxisAnimate.increase();

    // ellipse
    // camera.position.x = cameraEllipseAnimate.x();
    // camera.position.y = cameraEllipseAnimate.y();
    // camera.position.z = cameraEllipseAnimate.z();
    // cameraEllipseAnimate.increase();

    // ball.position.x = cameraEllipseAnimate.x();
    // ball.position.y = cameraEllipseAnimate.y();
    // ball.position.z = cameraEllipseAnimate.z();
    // period0++;
    // if (period0 % 10 === 0) {
    //     errout("x = " + ball.position.x + ", y = " + ball.position.y + ", z = " + ball.position.z);
    // }
    // wm.rotate(theta, theta * 2);
    // theta += 0.16;

    wm.walk();
    wm.walkAlongCircle();
}

function render() {
    "use strict";
    requestId = requestAnimationFrame(render);

    updateCamera();

    // 用于统计帧速率
    frameCount++;

    animate();

    renderer.render(scene, camera);
}

var NORMALIZATION_COEFFICIENT= 16;

var bodyProportions = {
    head : {
        length: 180 / NORMALIZATION_COEFFICIENT,
        height: 300 / NORMALIZATION_COEFFICIENT,
        depth: 250 / NORMALIZATION_COEFFICIENT
    },
    belly : {
        length: 300 / NORMALIZATION_COEFFICIENT,
        height: 650 / NORMALIZATION_COEFFICIENT,
        depth: 300 / NORMALIZATION_COEFFICIENT
    },
    arm_central : {
        length: 115 / NORMALIZATION_COEFFICIENT,
        height: 390 / NORMALIZATION_COEFFICIENT,
        depth: 250 / NORMALIZATION_COEFFICIENT
    },
    arm_circular : {
        length: 115 / NORMALIZATION_COEFFICIENT,
        height: 460 / NORMALIZATION_COEFFICIENT,
        depth: 250 / NORMALIZATION_COEFFICIENT
    },
    leg_central : {
        length: 150 / NORMALIZATION_COEFFICIENT,
        height: 570 / NORMALIZATION_COEFFICIENT,
        depth: 200 / NORMALIZATION_COEFFICIENT
    },
    leg_circular : {
        length: 150 / NORMALIZATION_COEFFICIENT,
        height: 575 / NORMALIZATION_COEFFICIENT,
        depth: 200 / NORMALIZATION_COEFFICIENT
    }
};

var bodyFixedPoint = {
    belly : new THREE.Vector3(0,0,0),
    head : new THREE.Vector3(0,(bodyProportions.head.height + bodyProportions.belly.height) / 2,0),
    left_arm : new THREE.Vector3(-(bodyProportions.arm_central.length + bodyProportions.belly.length) / 2,
        bodyProportions.belly.height / 2, 0),
    right_arm : new THREE.Vector3(+(bodyProportions.arm_central.length + bodyProportions.belly.length) / 2,
        bodyProportions.belly.height / 2, 0),
    left_leg : new THREE.Vector3(-bodyProportions.belly.length / 4, -bodyProportions.belly.height / 2, 0),
    right_leg : new THREE.Vector3(+bodyProportions.belly.length / 4, -bodyProportions.belly.height / 2, 0)
};


function BodyPart(central, circular) {
    this.centralPart = bodyProportions[central];
    this.centralPartName = central;
    this.centralPartMesh = null;
    this.circularPart = bodyProportions[circular];
    this.circularPartName = circular;
    this.circularPartMesh = null;
    this.group = new THREE.Group();
    this.position = new THREE.Vector3(0, 0, 0);
}

BodyPart.prototype = {
    constructor : BodyPart,
    initialize : function() {
        var pos = new THREE.Vector3();
        var mat = new THREE.Matrix4();
        this.group.matrixAutoUpdate = false;

        var geometry = new THREE.BoxGeometry( this.centralPart.length,
            this.centralPart.height, this.centralPart.depth );
        for ( i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = getRandColor();
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } )
        var cube = new THREE.Mesh( geometry, material );
        cube.bodyPart = this.centralPartName;
        cube.matrixAutoUpdate = false;
        pos.y = -this.centralPart.height / 2;
        mat.setPosition(pos);
        cube.matrix.copy(mat);
        cube.keyPoint = new THREE.Vector3(0, -this.centralPart.height, 0);
        this.centralPartMesh = cube;
        this.group.add(cube);

        geometry = new THREE.BoxGeometry( this.circularPart.length,
            this.circularPart.height, this.circularPart.depth );
        for ( i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = getRandColor();
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        cube = new THREE.Mesh( geometry, material );
        cube.bodyPart = this.circularPartName;
        cube.matrixAutoUpdate = false;
        pos.x = 0;
        pos.z = 0;
        pos.y = -this.circularPart.height/ 2
            - this.centralPart.height;
        mat.setPosition(pos);
        cube.matrix.copy(mat);
        cube.keyPoint = new THREE.Vector3(0, 0, 0);
        this.circularPartMesh = cube;
        this.group.add(cube);
    },
    rotate : function(centralDegree, circularDegree) {
        // if (circularDegree < 0) {
        //     circularDegree = 0;
        // }

        var tranmat = new THREE.Matrix4();
        var curmat = new THREE.Matrix4();
        var zero = new THREE.Matrix4();
        // var original = new THREE.Vector3(0, 0, 0);
        var vec = new THREE.Vector3();

        vec.y = -bodyProportions[this.circularPartName].height / 2;
        tranmat.setPosition(vec);
        curmat.makeRotationX(degrees2radians(-circularDegree));
        tranmat.premultiply(curmat);
        curmat.copy(zero);
        curmat.setPosition(this.centralPartMesh.keyPoint);
        tranmat.premultiply(curmat);
        this.circularPartMesh.matrix.copy(tranmat);

        tranmat.copy(zero);
        tranmat.makeRotationX(degrees2radians(-centralDegree));
        curmat.copy(zero);
        curmat.setPosition(this.position);
        tranmat.premultiply(curmat);
        this.group.matrix.copy(tranmat);
    }
};

function WalkingMatch() {
    this.leftArm = new BodyPart('arm_central', 'arm_circular');
    this.rightArm = new BodyPart('arm_central', 'arm_circular');
    this.leftLeg = new BodyPart('leg_central', 'leg_circular');
    this.rightLeg = new BodyPart('leg_central', 'leg_circular');
    this.bellyMesh = null;
    this.headMesh = null;
    this.group = new THREE.Group();
    this.position = new THREE.Vector3();
    this.fixedPoint = new THREE.Vector3(0, bodyProportions.belly.height / 2 + bodyProportions.leg_central.height +
        bodyProportions.leg_circular.height );
    this.walkingCycle = 0.0;
    this.walkingAlongCircleParameter = {
        radius : 500,
        theta : 0.0
    }
}

/// Walking Speed
var WALKING_INCREASING_UNIT = 0.1;

WalkingMatch.prototype = {
    constructor : WalkingMatch,
    initialize: function () {
        this.leftArm.initialize();
        this.rightArm.initialize();
        this.leftLeg.initialize();
        this.rightLeg.initialize();
        this.group.add(this.leftArm.group);
        this.group.add(this.rightArm.group);
        this.group.add(this.leftLeg.group);
        this.group.add(this.rightLeg.group);

        this.group.matrixAutoUpdate = false;

        var mat = new THREE.Matrix4();
        this.group.matrixAutoUpdate = false;
        this.leftArm.position = bodyFixedPoint.left_arm;
        this.leftArm.rotate(0, 0);
        this.rightArm.position = bodyFixedPoint.right_arm;
        this.rightArm.rotate(0, 0);
        this.leftLeg.position = bodyFixedPoint.left_leg;
        this.leftLeg.rotate(0, 0);
        this.rightLeg.position = bodyFixedPoint.right_leg;
        this.rightLeg.rotate(0, 0);

        // Create the belly and the head
        var belly = bodyProportions.belly;
        var geometry = new THREE.BoxGeometry( belly.length, belly.height, belly.depth );
        for ( i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = getRandColor();
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        var material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );
        var cube = new THREE.Mesh( geometry, material );
        cube.bodyPart = 'belly';
        cube.matrixAutoUpdate = false;
        mat.setPosition(bodyFixedPoint.belly);
        cube.matrix.copy(mat);
        cube.keyPoint = new THREE.Vector3(0, 0, 0);
        this.bellyMesh = cube;
        this.group.add(cube);

        var head = bodyProportions.head;
        geometry = new THREE.BoxGeometry( head.length, head.height, head.depth );
        for ( i = 0; i < geometry.faces.length; i += 2 ) {
            var hex = getRandColor();
            geometry.faces[ i ].color.setHex( hex );
            geometry.faces[ i + 1 ].color.setHex( hex );
        }
        material = new THREE.MeshBasicMaterial( { vertexColors: THREE.FaceColors, overdraw: 0.5 } );
        cube = new THREE.Mesh( geometry, material );
        cube.bodyPart = 'head';
        cube.matrixAutoUpdate = false;
        mat.setPosition(bodyFixedPoint.head);
        cube.matrix.copy(mat);
        cube.keyPoint = new THREE.Vector3(0, 0, 0);
        this.headMesh = cube;
        this.group.add(cube);

        scene.add(this.group);
        this.rotateY(0);
    },
    rotateY : function (degree) {
        var tranmat = new THREE.Matrix4();
        var curmat = new THREE.Matrix4();
        var zero = new THREE.Matrix4();


        curmat.makeRotationY(degrees2radians(degree));
        tranmat.premultiply(curmat);
        curmat.copy(zero);

        var realpos = new THREE.Vector3();
        realpos.addVectors(this.fixedPoint, this.position);
        curmat.setPosition(realpos);
        tranmat.premultiply(curmat);

        this.group.matrix.copy(tranmat);
    },
    walk : function () {
        this.leftArm.rotate(getArmCentralAngle(this.walkingCycle), getArmCircularAngle(this.walkingCycle));
        this.rightArm.rotate(getArmCentralAngle(this.walkingCycle + 1), getArmCircularAngle(this.walkingCycle + 1));
        this.leftLeg.rotate(-getLegCentralAngle(this.walkingCycle), -getLegCircularAngle(this.walkingCycle));
        this.rightLeg.rotate(-getLegCentralAngle(this.walkingCycle + 1), -getLegCircularAngle(this.walkingCycle + 1));

        this.walkingCycle += INCREASING_UNIT;
        if (this.walkingCycle > 2) {
            this.walkingCycle -= 2;
        }
    },
    walkAlongCircle : function() {
        var curRadians = degrees2radians(this.walkingAlongCircleParameter.theta);
        this.position = new THREE.Vector3( this.walkingAlongCircleParameter.radius * ( 1 -
            Math.cos(curRadians)), 0, this.walkingAlongCircleParameter.radius *
            Math.sin(curRadians) );
        this.walkingAlongCircleParameter.theta += WALKING_INCREASING_UNIT;
        this.rotateY(this.walkingAlongCircleParameter.theta);
    }
};


function getArmCentralAngle(walkingCycle) {
    while (walkingCycle > 2) {
        walkingCycle -= 2;
    }
    return /*13*/13 - 21/*21*/ * Math.abs(walkingCycle - 1);
}

function getArmCircularAngle(walkingCycle) {
    while (walkingCycle > 2) {
        walkingCycle -= 2;
    }
    if (0.5 <= walkingCycle && walkingCycle <= 1.5) {
        return /*21*/21 - /*14*/28 * Math.abs(walkingCycle - 1);
    }
    return /*14*/14 - /*14*/14 * Math.abs(walkingCycle - 1);
    // return 0;
}

function getLegCentralAngle(walkingCycle) {
    while (walkingCycle > 2) {
        walkingCycle -= 2;
    }
    return 30 - 65 * Math.abs(walkingCycle - 1);
}

function getLegCircularAngle(walkingCycle) {
    while (walkingCycle > 2) {
        walkingCycle -= 2;
    }
    if (walkingCycle < 18.0 / 13.0) {
        return 13 * 25 / 9 * walkingCycle;
    }
    return -13 * 25 / 4 * (walkingCycle - 2);
}

