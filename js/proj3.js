/**
 * Created by 40637 on 2017/3/22.
 */

var scene = new THREE.Scene();


var CUSTOM_SHADING = {
    // Warning: These properties shouldn't be accessed or modified outside the CUSTOM_SHADING.
    choice: 4,
    type: {
        BUILT_IN_PHONG: 0,
        BUILT_IN_GOURAUD: 1,
        ONECOLOR: 2,
        SIMPLEGRADIENT: 3,
        GOURAUD: 4,
        PHONG: 5
    },
    totalNumber: 6,

    // Allow the user to change the shading method only after
    SWITCH_SHADING_MINIMAL_INTERVAL: 1000,  // 1000 ms
    isSwitching: false,

    switchShading: function () {
        "use strict";
        var currentCUSTOM_SHADING = window.CUSTOM_SHADING;
        if (currentCUSTOM_SHADING.isSwitching)
            return;

        currentCUSTOM_SHADING.isSwitching = true;
        setTimeout(function() {
            currentCUSTOM_SHADING.isSwitching = false;
        }, currentCUSTOM_SHADING.SWITCH_SHADING_MINIMAL_INTERVAL);

        currentCUSTOM_SHADING.choice = (this.choice + 1) % currentCUSTOM_SHADING.totalNumber;
        Renderer.redraw();
    },

    getShaderMaterial: function () {
        "use strict";
        var material;
        // PhongShading and GouraudShading
        var lightGridPos = new GridPosition(1,0,0);
        switch (CUSTOM_SHADING.choice) {
            case CUSTOM_SHADING.type.BUILT_IN_PHONG:
                material = new THREE.MeshPhongMaterial({color: getRandColor(), side: THREE.FrontSide});
                $("#cur-shading").html("Three.js built-in Phong shader");
                break;
            case CUSTOM_SHADING.type.BUILT_IN_GOURAUD:
                material = new THREE.MeshLambertMaterial({color: getRandColor(), side: THREE.FrontSide});
                $("#cur-shading").html("Three.js built-in Gouraud shader");
                break;
            case CUSTOM_SHADING.type.ONECOLOR:
                material = OneColorShadingMaterial();
                $("#cur-shading").html("(DIY) One color shader");
                break;
            case CUSTOM_SHADING.type.SIMPLEGRADIENT:
                material = SimpleGradientShadingMaterial(0.05);
                $("#cur-shading").html("(DIY) Simple gradient shader");
                break;
            case CUSTOM_SHADING.type.GOURAUD:
                material = GouraudShadingMaterial(lightGridPos, 0.01);
                $("#cur-shading").html("(DIY) Gouraud shader");
                break;
            case CUSTOM_SHADING.type.PHONG:
                material = PhongShadingMaterial(lightGridPos, 0.4, 2.0, 1.0, 10.1);
                $("#cur-shading").html("(DIY) Phong shader");
                break;
        }
        return material;
    }
};


var playAnimation = true;
document.body.onkeyup = function (event) {
    "use strict";
    var keycode = parseInt(event.keyCode);
    if ('A'.charCodeAt(0) <= keycode && keycode <= 'Z'.charCodeAt(0)) {
        switch (keycode) {
            case 'P'.charCodeAt(0):
                playAnimation = !playAnimation;
                errout("playAnimation = " + playAnimation);
                break;
            case 'S'.charCodeAt(0):
                CUSTOM_SHADING.switchShading();
                break;
        }
    }
};


var Checkerboard = {
    LENGTH_OF_ONE_BRICK: 100,
    NUMBERS_ALONG_HALF_EDGE: 15,
    drawInScene: function() {
        "use strict";
        var checkerboard = new THREE.Group();
        var geometry = new THREE.PlaneBufferGeometry( this.LENGTH_OF_ONE_BRICK, this.LENGTH_OF_ONE_BRICK );
        for (var i = -this.NUMBERS_ALONG_HALF_EDGE; i < this.NUMBERS_ALONG_HALF_EDGE; i++) {
            for (var j = -this.NUMBERS_ALONG_HALF_EDGE; j < this.NUMBERS_ALONG_HALF_EDGE; j++) {
                var material;
                // The color attribute of the material must be assigned in the constructor parameters.
                if ( (i + j) % 2 === 0 ) {
                    material = new THREE.MeshPhongMaterial( {color: 0xeeeeee, side: THREE.BackSide} );
                } else {
                    material = new THREE.MeshPhongMaterial( {color: 0x111111, specular: 0x111111, side: THREE.BackSide} );
                }
                var plane = new THREE.Mesh( geometry, material );
                plane.translateX(i * this.LENGTH_OF_ONE_BRICK);
                plane.translateZ(j * this.LENGTH_OF_ONE_BRICK);
                plane.rotateX(Math.PI / 2);
                checkerboard.add( plane );
            }
        }
        scene.add(checkerboard);
    }
};


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
        return new THREE.Vector3(x, y, z);
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

var GRID_WIDTH = 80;
var GRID_HEIGHT = 80;
var GRID_DEPTH = 80;
GridPosition.prototype.setLength(GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH);



var Cuboids = {
    POSITIONS: [
        [0,0,0],
        [1,0,-1],
        [1,0,1],
        [0,2,0],
        [0,1,1],
        [1,1,-2],
        [1,2,-3],
        [1,1,0],
        [1,1,2]
    ],
    SEGMENTS: 1,

    // drawCuboids(): According to the positions defined in CUBOIDS_POSITIONS,
    // creates the cuboids in the scene.
    drawInScene: function () {
        "use strict";
        var cuboids = new THREE.Group();

        var geometry = new THREE.BoxBufferGeometry(GRID_WIDTH, GRID_HEIGHT, GRID_DEPTH,
            this.SEGMENTS, this.SEGMENTS, this.SEGMENTS);
        // geometry.addAttribute('lightPos', Lights.POINT_LIGHT_POSITIONS.GPUBuffer);

        var gridPosition = new GridPosition(0,0,0);
        this.POSITIONS.forEach(function(item) {
            var cuboid = new THREE.Mesh(geometry, CUSTOM_SHADING.getShaderMaterial());
            cuboid.position.copy(gridPosition.setPosition(item[0], item[1], item[2]).getVector3());
            cuboids.add(cuboid);
        });

        scene.add(cuboids);
    }
};

var Spheres = {
    POSITIONS: [
        [4,0,2],
        [2,0,4],
        [-2,0,-2],
        [3,0,-3],
        [2,2,1],
        [1,0,2],
        [1,2,0]
    ],

    // drawCuboids(): According to the positions defined in CUBOIDS_POSITIONS,
    // creates the cuboids in the scene.
    drawInScene: function () {
        "use strict";
        var spheres = new THREE.Group();

        var geometry = new THREE.SphereBufferGeometry(GRID_WIDTH / 2);
        // geometry.addAttribute('lightPos', Lights.POINT_LIGHT_POSITIONS.GPUBuffer);

        var gridPosition = new GridPosition(0,0,0);
        this.POSITIONS.forEach(function(item) {
            var sphere = new THREE.Mesh(geometry, CUSTOM_SHADING.getShaderMaterial());
            sphere.position.copy(gridPosition.setPosition(item[0], item[1], item[2]).getVector3());
            spheres.add(sphere);
        });

        scene.add(spheres);
    }
};

var Lights = {
    POINT_LIGHT_POSITIONS: {
        readable: [
            [1,0,0]/*,
             [1,0,-3],
             [1,0,2]*//*,
             [10,2,0],
             [-10,2,0]*/
        ],
        CPUTypedArrayBuffer: new Float32Array(),
        GPUBuffer: null
    },
    // initialize(): create a TypedArray Attribute Buffer in CPU
    initialize: function () {
        "use strict";
        var OneArray = [];
        this.POINT_LIGHT_POSITIONS.CPUTypedArrayBuffer = new Float32Array();
        var gridPos = new GridPosition(0,0,0);
        var posVec = new THREE.Vector3(0,0,0);
        this.POINT_LIGHT_POSITIONS.readable.forEach(function (item) {
            posVec.copy(gridPos.setPosition(item[0], item[1], item[2]).getVector3());
            OneArray.push(posVec.x, posVec.y, posVec.z);
        });
        this.POINT_LIGHT_POSITIONS.CPUTypedArrayBuffer = new THREE.Float32BufferAttribute(OneArray, 3);
        this.POINT_LIGHT_POSITIONS.GPUBuffer = new THREE.BufferAttribute(this.POINT_LIGHT_POSITIONS.CPUTypedArrayBuffer, 3);
    },
    // updateLight(): Add the ambient light, the point lights, and even the rectangle lights.
    // According to the positions defined in POINT_LIGHT_POSITIONS, creates the point lights in the scene.
    updateLight: function () {
        "use strict";
        // Parameters for the light sources.
        var color = 0xffffff;
        var intensity = 0.6;
        var distance = 10000;
        var decay = 2;

        var light = new THREE.Group();
        light.add(new THREE.AmbientLight(0xffffff, 0.25));

        var gridPosition = new GridPosition(0,0,0);
        this.POINT_LIGHT_POSITIONS.readable.forEach(function(item) {
            var point = new THREE.PointLight(color, intensity, distance, decay);
            point.position.copy(gridPosition.setPosition(item[0], item[1], item[2]).getVector3());
            light.add(point);
            var point_helper = new THREE.PointLightHelper(point, 25);
            light.add(point_helper);
        });

        scene.add(light);
    }
};

var Camera = {
    camera: null,
    LOOKING_AT_POSITION: new THREE.Vector3(0, 0, 0),
    initialize: function() {
        "use strict";
        var one = 300;
        this.camera.position.copy(new THREE.Vector3(one, one, one));
        this.update();
    },
    update: function() {
        "use strict";
        this.camera.lookAt(this.LOOKING_AT_POSITION);
        this.camera.updateMatrixWorld();
    }
};

var cameraEllipseAnimate = {
    // INCREASING_UNIT: the speed of camera animation
    INCREASING_UNIT: 0.25,
    theta : 0.0,
    XA : 720,
    ZB : 720,
    YC : 200,
    CENTER_X: 0,
    CENTER_Z: 0,
    getPosition: function() {
        var ret = new THREE.Vector3(0,0,0);
        ret.x = this.XA * Math.cos(this.theta) - this.CENTER_X;
        ret.y = this.YC;
        ret.z = this.ZB * Math.sin(this.theta) - this.CENTER_Z;
        return ret;
    },
    increase : function () {
        this.theta += degrees2radians(this.INCREASING_UNIT);
        while (this.theta > Math.PI) {
            this.theta -= 2 * Math.PI;
        }
    },
    animate: function() {
        // ellipse
        Camera.camera.position.copy(this.getPosition());
        this.increase();
    }
};

$(document).ready(function () {
    "use strict";
    Renderer.redraw();
});

var Renderer = {
    canvasHeight: 1,
    canvasWidth: 1,
    requestId: null,
    renderer: null,
    DEFAULT_BACKGROUND_COLOR: 0x222222,
    canvasResize: function(camera) {
        "use strict";
        /* 获取画布的宽和高
         * 用jQuery.width()、jQuery.outerWidth()、document.getElementById(div_id).width获取宽高都会出问题。
         * 但是用window.innerWidth可以取得很好的效果。
         * 这两个变量在文档加载，窗口大小改变，显示左侧面板等改变画布大小的区域等情况下，都会更新。
         */
        this.canvasHeight = window.innerHeight;
        this.canvasWidth = window.innerWidth;
        if (camera) {
            camera.aspect = this.canvasWidth / this.canvasHeight;
            camera.updateProjectionMatrix();
        }
        if (this.renderer) {
            this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        }
    },
    // Redraw(): It will redraw the whole canvas, so that we should call it as less as possible.
    redraw: function () {
        "use strict";
        Camera.camera = new THREE.PerspectiveCamera(40, 2, 0.1, 10000);
        // 每次窗口的大小发生改变时，也改变画布的大小
        window.onresize = this.canvasResize(Camera.camera);
        this.canvasResize(Camera.camera);
        // 禁止用户选择文本，优化UI体验
        document.body.onselectstart = function () {
            return false;
        };

        var i;
        var listLength = scene.children.length;
        for (i=0;i<listLength;i++) {
            scene.remove(scene.children[0]);
        }
        // 为避免多个requestAnimationFrame()循环同时绘制图像，造成帧速率太高（远高于60FPS），停止已有的绘制刷新循环
        if (this.requestId) {
            window.cancelAnimationFrame(this.requestId);
            this.requestId = undefined;
        }

        // -------------------------------------------------------------
        // 初始化新的图形绘制，绘制整个场景
        // -------------------------------------------------------------
        // Three basic elements in Three.js: Scene, camera, renderer.
        // 初始化渲染器为使用WebGL的绑定到ID为“canvas”的元素，参数使用JSON表示。
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('canvas')
        });

        // 重设渲染器的大小为窗口大小；否则，默认的渲染大小很小，在屏幕上显示出大的块状。
        // setSize()同时会改变画布大小
        this.renderer.setSize(this.canvasWidth, this.canvasHeight);
        this.renderer.setClearColor(this.DEFAULT_BACKGROUND_COLOR);
        if (window.devicePixelRatio) {
            this.renderer.setPixelRatio(window.devicePixelRatio);
        }
        this.renderer.sortObjects = false;

        Checkerboard.drawInScene();
        Cuboids.drawInScene();
        Spheres.drawInScene();
        Lights.initialize();
        Lights.updateLight();
        Camera.initialize();

        // 显示一个坐标轴，红色X，绿色Y，蓝色Z
        var axisHelper = new THREE.AxisHelper(2000);
        scene.add(axisHelper);

        FPS();
        Renderer.renderLoop();
    },
    renderLoop: function() {
        "use strict";
        var currentRenderer = window.Renderer;
        currentRenderer.requestId = requestAnimationFrame(currentRenderer.renderLoop);

        // 用于统计帧速率
        frameCount++;

        // 控制是否播放动画
        if (playAnimation) {
            currentRenderer.animate();
        }
        // Camera.update() 必须放在 animate() 的后边，不然会造成播放和暂停切换瞬间的抖动问题
        Camera.update();

        currentRenderer.renderer.render(scene, Camera.camera);
    },
    animate: function() {
        cameraEllipseAnimate.animate(Camera.camera);
    }
};