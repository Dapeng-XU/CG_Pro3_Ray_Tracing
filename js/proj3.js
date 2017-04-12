/**
 * Created by 40637 on 2017/3/22.
 */

// 每次窗口的大小发生改变时，也改变画布的大小
window.onresize = canvasResize;

document.body.onload = function () {
    "use strict";
    redraw();
};

var playAnimation = true;
document.body.onkeydown = function (event) {
    "use strict";
    var keycode = parseInt(event.keyCode);
    if ('A'.charCodeAt(0) <= keycode && keycode <= 'Z'.charCodeAt(0)) {
       switch (keycode) {
           case 'P'.charCodeAt(0):
               playAnimation = !playAnimation;
               errout("playAnimation = " + playAnimation);
               break;
       }
    }
};

// 初始化的图形绘制
var scene = new THREE.Scene();
var camera, renderer, raycaster;
var light = new THREE.Group();
var canv = document.getElementById('canvas');
// 默认背景色
var DEFAULT_BACKGROUND_COLOR = 0x444444;
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
    drawCuboids();

    // 显示一个坐标轴，红色X，绿色Y，蓝色Z
    var axisHelper = new THREE.AxisHelper(2000);
    scene.add(axisHelper);

    updateLight();
    launchDefaultCamera();
    FPS();

    render();
}

var CHECKERBOARD_LENGTH = 100;
var CHECKERBOARDS_ALONG_HALF_EDGE = 15;
function drawCheckerboard() {
    "use strict";
    var checkerboard = new THREE.Group();
    for (var i = -CHECKERBOARDS_ALONG_HALF_EDGE; i < CHECKERBOARDS_ALONG_HALF_EDGE; i++) {
        for (var j = -CHECKERBOARDS_ALONG_HALF_EDGE; j < CHECKERBOARDS_ALONG_HALF_EDGE; j++) {
            var geometry = new THREE.PlaneGeometry( CHECKERBOARD_LENGTH, CHECKERBOARD_LENGTH );
            var material;
            if ( (i + j) % 2 === 0 ) {
                material = new THREE.MeshPhongMaterial( {color: 0xeeeeee, side: THREE.DoubleSide} );
            } else {
                material = new THREE.MeshPhongMaterial( {specular: 0x111111, side: THREE.DoubleSide} );
            }
            var plane = new THREE.Mesh( geometry, material );
            plane.translateX(i * CHECKERBOARD_LENGTH);
            plane.translateZ(j * CHECKERBOARD_LENGTH);
            plane.rotateX(Math.PI / 2);
            //plane.matrixAutoUpdate = false;
            checkerboard.add( plane );
        }
    }
    scene.add(checkerboard);
}


// GridPosition(): Generate the position in a fixed grid by a triple(nx, ny, nz).
function GridPosition(nx, ny, nz) {
    "use strict";
    this.nx = nx;
    this.ny = ny;
    this.nz = nz;
}
GridPosition.prototype = {
    constructor: GridPosition,
    width: 0,
    halfWidth : 0,
    height: 0,
    halfHeight : 0,
    depth: 0,
    halfDepth : 0,
    getVector3: function() {
        "use strict";
        var cur = GridPosition.prototype;
        var x = this.nx * cur.width;
        var y = cur.halfHeight + this.ny * cur.height;
        var z = this.nz * cur.depth;
        var v3 = new THREE.Vector3(x, y, z);
        return v3;
    },
    setPosition: function(nx, ny, nz) {
        this.nx = nx;
        this.ny = ny;
        this.nz = nz;
        return this;
    },
    setLength: function(width, height, depth) {
        "use strict";
        var cur = GridPosition.prototype;
        cur.width = width;
        cur.halfWidth = width / 2;
        cur.height = height;
        cur.halfHeight = height / 2;
        cur.depth = depth;
        cur.halfDepth = depth / 2;
    }
};

var GRID_WIDHT = 80;
var GRID_HEIGHT = 80;
var GRID_DEPTH = 80;
GridPosition.prototype.setLength(GRID_WIDHT, GRID_HEIGHT, GRID_DEPTH);



var CUBOIDS_POSITIONS = [
    [0,0,0],
    [1,0,-1],
    [1,0,1],
    [0,2,0],
    [0,1,1],
    [1,1,-2],
    [1,2,-3],
    [1,1,0],
    [1,1,2]
];
var CUBOIDS_SEGMENTS = 1;

// drawCuboids(): According to the positions defined in CUBOIDS_POSITIONS,
// creates the cuboids in the scene.
function drawCuboids() {
    "use strict";
    var i;
    var cuboids = new THREE.Group();

    var geometry = new THREE.BoxGeometry(GRID_WIDHT, GRID_HEIGHT, GRID_DEPTH,
        CUBOIDS_SEGMENTS, CUBOIDS_SEGMENTS, CUBOIDS_SEGMENTS);
    var gridPosition = new GridPosition(0,0,0);
    CUBOIDS_POSITIONS.forEach(function(item) {
        var material = new THREE.MeshPhongMaterial({color: getRandColor()});
        var cuboid = new THREE.Mesh(geometry, material);
        cuboid.position.copy(gridPosition.setPosition(item[0], item[1], item[2]).getVector3());
        cuboids.add(cuboid);
    });

    scene.add(cuboids);
}



var POINT_LIGHT_POSITIONS = [
    [1,0,0],
    [1,0,-3],
    [1,0,2],
    [10,2,0],
    [-10,2,0]
];

// updateLight(): Add the ambient light, the point lights, and even the rectangle lights.
// According to the positions defined in POINT_LIGHT_POSITIONS,
// creates the point lights in the scene.
function updateLight() {
    var color = 0xffffff;
    var intensity = 0.75;
    var distance = 10000;
    var decay = 2;

    light.add(new THREE.AmbientLight(0xffffff, 0.25));

    var gridPosition = new GridPosition(0,0,0);
    POINT_LIGHT_POSITIONS.forEach(function(item) {
        var point = new THREE.PointLight(color, intensity, distance, decay);
        point.position.copy(gridPosition.setPosition(item[0], item[1], item[2]).getVector3());
        light.add(point);
        var point_helper = new THREE.PointLightHelper(point, 25);
        light.add(point_helper);
    });

    // function RectAreaLight ( color, intensity, width, height )
    // var rect = new THREE.RectAreaLight(color, intensity, 100, 100);
    // rect.position.copy(position);
    // var rect_helper = new THREE.RectAreaLightHelper(rect);
    // rect_helper.position.copy(position);
    // light.add(rect);
    // light.add(rect_helper);

    scene.add(light);
}

var LOOKING_AT_POSITION = new THREE.Vector3(0, 0, 0);

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
    "use strict";
    camera.lookAt(LOOKING_AT_POSITION);
    camera.updateMatrixWorld();
}

// the speed of camera animation
var INCREASING_UNIT = 0.25;

var cameraEllipseAnimate = {
    theta : 0.0,
    xa : 720,
    zb : 720,
    yc : 200,
    center_x: 0,
    center_y: 0,
    x : function () {
        return this.xa * Math.cos(this.theta);
    },
    y : function () {
        // return 1200 + ( (this.theta >= 0) ? (-this.yc*2/Math.PI*(this.theta - Math.PI/2)) :
        //     (this.yc*2/Math.PI*(this.theta + Math.PI / 2)) );
        return this.yc;
    },
    z : function () {
        return this.zb * Math.sin(this.theta);
    },
    increase : function () {
        this.theta += degrees2radians(INCREASING_UNIT);
        while (this.theta > Math.PI) {
            this.theta -= 2 * Math.PI;
        }
    }
};

// var period0 = 0;
// var theta = 0;

function animate() {
    // line
    // camera.position.x = cameraAxisAnimate.x();
    // camera.position.y = cameraAxisAnimate.y();
    // camera.position.z = cameraAxisAnimate.z();
    // cameraAxisAnimate.increase();

    // ellipse
    camera.position.x = cameraEllipseAnimate.x();
    camera.position.y = cameraEllipseAnimate.y();
    camera.position.z = cameraEllipseAnimate.z();
    cameraEllipseAnimate.increase();
}

function render() {
    "use strict";
    requestId = requestAnimationFrame(render);

    // 用于统计帧速率
    frameCount++;

    // 控制是否播放动画
    if (playAnimation) {
        animate();
    }
    // updateCamera()必须放在animate()的后边，不然会造成播放和暂停切换瞬间的抖动问题
    updateCamera();

    renderer.render(scene, camera);
}

