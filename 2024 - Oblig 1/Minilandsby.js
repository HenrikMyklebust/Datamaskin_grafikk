import {WebGLCanvas} from '../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../base/helpers/WebGLShader.js';
import {Camera} from "../base/helpers/Camera.js";
import {Stack} from "../base/helpers/Stack.js";
import {XZPlane} from '../base/shapes/XZPlane.js';
import {Cube} from '../base/shapes/Cube.js';
import {TriangleRoof} from '../base/shapes/TriangleRoof.js';
import {Cone} from '../base/shapes/Cone.js';
import {Cylinder} from '../base/shapes/Cylinder.js';


export function main() {
    // Oppretter et webGLCanvas for WebGL-tegning:
    const webGLCanvas = new WebGLCanvas('myCanvas', document.body, 960, 640);
    let keys = []
    initKeyPress(keys);
    const camera = new Camera(webGLCanvas.gl, keys);

    // Hjelpeobjekt med canvas og kamera
    const app = {
        gl: webGLCanvas.gl,
        camera: camera
    }
    let baseShaderInfo = initBaseShaders(webGLCanvas.gl)

    // Hjelpeobjekt som holder på objekter som trengs for rendring:
    const renderInfo = {
        app: app,
        baseShaderInfo: baseShaderInfo,
        uniformLocations: baseShaderInfo.uniformLocations,
        attribLocations: baseShaderInfo.attribLocations,
        program: baseShaderInfo.program,
        floorPlane: initPlane(app, 40, 40),
        pathPlane: initPlane(app, 2, 20, {red: 0.2, green: 0.2, blue: 0.2, alpha: 1}),
        houses: {
            house1: {
                room1: initCube(app, 2.5, 2.5, 2.5, {red: 1, green: 0.5, blue: 0.5, alpha: 1}),
                room2: initCube(app, 2.5, 6.5, 3.5, {red: 1, green: 0.5, blue: 0.5, alpha: 1}),
                roof: initTriangleRoof(app, 3.5, 7.5, 1, {red: 0.5, green: 1, blue: 0.5, alpha: 1}),
                door: initPlane(app, 0.5, 1, {red: 0.9, green: 0.9, blue: 0.9, alpha: 1}),
                window: initPlane(app, 3, 1, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            },
            house2: {
                room1: initCube(app, 2.5, 2.5, 3.5, {red: 0.3, green: 0.8, blue: 0.3, alpha: 1}),
                room2: initCube(app, 2.5, 2.5, 5, {red: 0.3, green: 0.8, blue: 0.3, alpha: 1}),
                room3: initCube(app, 2.5, 2.5, 2.5, {red: 0.3, green: 0.8, blue: 0.3, alpha: 1}),
                roof: initCone(app, 2.5, 2, {red: 0.5, green: 0.6, blue: 0.9, alpha: 1}),
                door: initPlane(app, 0.5, 1, {red: 0.9, green: 0.9, blue: 0.9, alpha: 1}),
                window: initPlane(app, 1, 3, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            },
            house3: {
                room1: initCube(app, 2.5, 2.5, 8.5, {red: 0.5, green: 0.5, blue: 1, alpha: 1}),
                roof: initCylinder(app, 1.24, 2.48, {red: 1, green: 1, blue: 0.2, alpha: 1}),
                door: initPlane(app, 0.5, 1, {red: 0.9, green: 0.9, blue: 0.9, alpha: 1}),
                window: initPlane(app, 1, 6, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            },
            house4: {
                room1: initCube(app, 2.5, 2.5, 3.5, {red: 1, green: 0.5, blue: 1, alpha: 1}),
                room2: initCube(app, 2.5, 8.5, 3.5, {red: 1, green: 0.5, blue: 1, alpha: 1}),
                door: initPlane(app, 0.5, 1, {red: 0.9, green: 0.9, blue: 0.9, alpha: 1}),
                window: initPlane(app, 6, 2, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            }
        },
        windTurbine: {
            base: initCylinder(app, 2, 1, {red: 0.5, green: 0.5, blue: 0.5, alpha: 1}),
            pole: initCylinder(app, 0.5, 10, {red: 0.85, green: 0.85, blue: 0.85, alpha: 1}),
            housing: initCylinder(app, 0.8, 3, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            tip: initCone(app, 0.7, 1, {red: 0.7, green: 0.7, blue: 0.7, alpha: 1}),
            blade: initCube(app, 1, 5, 0.2, {red: 0.9, green: 0.9, blue: 0.4, alpha: 1}),
            animation: {
                currentRotation: 0,
                rotationSpeed: 100
            }
        },
        stack: new Stack(),
        currentlyPressedKeys: keys,
        lastTime: 0,
        fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,
            lastTimeStamp: 0
        }
    };


    animate(0, renderInfo);
}

/**
 * Knytter tastatur-evnents til eventfunksjoner.
 */
function initKeyPress(currentlyPressedKeys) {
    document.addEventListener('keyup', (event) => {
        currentlyPressedKeys[event.code] = false;
    }, false);
    document.addEventListener('keydown', (event) => {
        currentlyPressedKeys[event.code] = true;
    }, false);
}

function initBaseShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('base-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('base-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
        },
    };
}

function initPlane(app, width, height, color) {
    let plane = new XZPlane(app, outerWidth = width, outerHeight = height, color)
    plane.initBuffers()
    return plane;
}

function initCube(app, width, length, height, color) {
    let cube = new Cube(app, width, length, height, color)
    cube.initBuffers()
    return cube
}

function initCylinder(app, radius, height, color) {
    let cylinder = new Cylinder(app, radius, height, color)
    cylinder.initBuffers()
    return cylinder
}

function initCone(app, radius, height, color) {
    let cone = new Cone(app, radius, height, color)
    cone.initBuffers()
    return cone
}

function initTriangleRoof(app, width, length, height, color) {
    let triangleRoof = new TriangleRoof(app, width, length, height, color)
    triangleRoof.initBuffers()
    return triangleRoof
}

function animate(currentTime, renderInfo) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime, renderInfo);
    });

    // Finner tid siden siste kall på draw().
    let elapsed = getElapsed(currentTime, renderInfo);
    calculateFps(currentTime, renderInfo.fpsInfo);
    udpdateWindSpeed(renderInfo)

    renderInfo.windTurbine.animation.currentRotation = renderInfo.windTurbine.animation.currentRotation + (renderInfo.windTurbine.animation.rotationSpeed * elapsed);
    renderInfo.windTurbine.animation.currentRotation %= 360;

    renderInfo.app.camera.handleKeys(elapsed);

    draw(currentTime, renderInfo);
}

/**
 * Beregner forløpt tid siden siste kall.
 * @param currentTime
 * @param renderInfo
 */
function getElapsed(currentTime, renderInfo) {
    let elapsed = 0.0;
    if (renderInfo.lastTime !== 0.0)	// Først gang er lastTime = 0.0.
        elapsed = (currentTime - renderInfo.lastTime) / 1000; // Deler på 1000 for å operere med sekunder.
    renderInfo.lastTime = currentTime;						// Setter lastTime til currentTime.
    return elapsed;
}

function udpdateWindSpeed(renderInfo) {
    renderInfo.windTurbine.animation.rotationSpeed = document.getElementById('windSpeed').value * 10
}

/**
 * Beregner og viser FPS.
 * @param currentTime
 * @param renderInfo
 */
function calculateFps(currentTime, fpsInfo) {
    if (!currentTime) currentTime = 0;
    // Sjekker om  ET sekund har forløpt...
    if (currentTime - fpsInfo.lastTimeStamp >= 1000) {
        // Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById('fps').innerHTML = fpsInfo.frameCount;
        // Nullstiller fps-teller:
        fpsInfo.frameCount = 0;
        //Brukes for å finne ut om det har gått 1 sekund - i så fall beregnes FPS på nytt.
        fpsInfo.lastTimeStamp = currentTime;
    }
    // Øker antall frames per sekund:
    fpsInfo.frameCount++;
}

function draw(currentTime, renderInfo) {
    clearCanvas(renderInfo.app.gl);
    drawPlane(renderInfo)
    drawPath(renderInfo)
    drawHouse1(renderInfo)
    drawHouse2(renderInfo)
    drawHouse3(renderInfo)
    drawHouse4(renderInfo)
    drawWindTurbine(renderInfo)
}

function clearCanvas(gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawPlane(renderInfo) {
    let planeMatrix = new Matrix4().setIdentity()

    renderInfo.floorPlane.draw(renderInfo, null, planeMatrix)
}

function drawPath(renderInfo) {
    let pathMatrix = new Matrix4().setIdentity()
    pathMatrix.translate(0, 0.01, 0)
    renderInfo.pathPlane.draw(renderInfo, null, pathMatrix)
    pathMatrix.rotate(90, 0, 1, 0)
    renderInfo.pathPlane.draw(renderInfo, null, pathMatrix)
}

function drawHouse1(renderInfo) {
    let room1Matrix = new Matrix4().setIdentity()
    room1Matrix.translate(10, 0.01, 0)
    renderInfo.houses.house1.room1.draw(renderInfo, null, room1Matrix)

    let room2Matrix = new Matrix4().setIdentity()
    room2Matrix.translate(12, 0.01, 2)
    renderInfo.houses.house1.room2.draw(renderInfo, null, room2Matrix)

    let roofMatrix = new Matrix4().setIdentity()
    roofMatrix.translate(12, renderInfo.houses.house1.room2.height, 2)
    renderInfo.houses.house1.roof.draw(renderInfo, null, roofMatrix)

    let doorMatrix = new Matrix4().setIdentity()
    doorMatrix.translate(8.7, 0.5, 0)
    doorMatrix.rotate(90, 1, 0, 0)
    doorMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house1.door.draw(renderInfo, null, doorMatrix)

    let windowMatrix = new Matrix4().setIdentity()
    windowMatrix.translate(10.7, 1.5, 3)
    windowMatrix.rotate(90, 1, 0, 0)
    windowMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house1.window.draw(renderInfo, null, windowMatrix)

}

function drawHouse2(renderInfo) {
    let room1Matrix = new Matrix4().setIdentity()
    room1Matrix.translate(-10, 0.01, 0)
    renderInfo.houses.house2.room1.draw(renderInfo, null, room1Matrix)

    let room2Matrix = new Matrix4().setIdentity()
    room2Matrix.translate(-12, 0.01, 2)
    renderInfo.houses.house2.room2.draw(renderInfo, null, room2Matrix)

    let room3Matrix = new Matrix4().setIdentity()
    room3Matrix.translate(-12, 0.01, -2)
    renderInfo.houses.house2.room3.draw(renderInfo, null, room3Matrix)

    let roofMatrix = new Matrix4().setIdentity()
    roofMatrix.translate(-12, renderInfo.houses.house2.room2.height, 2)
    renderInfo.houses.house2.roof.draw(renderInfo, null, roofMatrix)

    let doorMatrix = new Matrix4().setIdentity()
    doorMatrix.translate(-8.7, 0.5, 0)
    doorMatrix.rotate(90, 1, 0, 0)
    doorMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house2.door.draw(renderInfo, null, doorMatrix)

    let windowMatrix = new Matrix4().setIdentity()
    windowMatrix.translate(-10.7, 3, 2)
    windowMatrix.rotate(90, 1, 0, 0)
    windowMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house2.window.draw(renderInfo, null, windowMatrix)

}

function drawHouse3(renderInfo) {
    let room1Matrix = new Matrix4().setIdentity()
    room1Matrix.translate(0, 0.01, 10)
    renderInfo.houses.house3.room1.draw(renderInfo, null, room1Matrix)

    let roofMatrix = new Matrix4().setIdentity()
    roofMatrix.translate(renderInfo.houses.house3.room1.width / 2 - 0.01, renderInfo.houses.house3.room1.height - 0.3, 10)
    roofMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house3.roof.draw(renderInfo, null, roofMatrix)

    let doorMatrix = new Matrix4().setIdentity()
    doorMatrix.translate(0, 0.5, 8.7)
    doorMatrix.rotate(90, 1, 0, 0)
    renderInfo.houses.house3.door.draw(renderInfo, null, doorMatrix)

    let windowMatrix = new Matrix4().setIdentity()
    windowMatrix.translate(0, 4.5, 8.7)
    windowMatrix.rotate(90, 1, 0, 0)
    renderInfo.houses.house3.window.draw(renderInfo, null, windowMatrix)
}

function drawHouse4(renderInfo) {
    let room1Matrix = new Matrix4().setIdentity()
    room1Matrix.translate(0, 0.01, -10)
    renderInfo.houses.house4.room1.draw(renderInfo, null, room1Matrix)

    let room2Matrix = new Matrix4().setIdentity()
    room2Matrix.translate(2.5, 0.01, -13)
    renderInfo.houses.house4.room2.draw(renderInfo, null, room2Matrix)

    let doorMatrix = new Matrix4().setIdentity()
    doorMatrix.translate(0, 0.5, -8.7)
    doorMatrix.rotate(90, 1, 0, 0)
    renderInfo.houses.house4.door.draw(renderInfo, null, doorMatrix)

    let windowMatrix = new Matrix4().setIdentity()
    windowMatrix.translate(3.9, 1.5, -13)
    windowMatrix.rotate(90, 1, 0, 0)
    windowMatrix.rotate(90, 0, 0, 1)
    renderInfo.houses.house4.window.draw(renderInfo, null, windowMatrix)
}

function drawWindTurbine(renderInfo) {
    let baseMatrix = new Matrix4().setIdentity()
    baseMatrix.translate(13, 0.01, 13)
    renderInfo.windTurbine.base.draw(renderInfo, null, baseMatrix)

    let poleMatrix = new Matrix4().setIdentity()
    poleMatrix.translate(13, 1, 13)
    renderInfo.windTurbine.pole.draw(renderInfo, null, poleMatrix)

    let housingMatrix = new Matrix4().setIdentity()
    housingMatrix.translate(14, 11, 13)
    housingMatrix.rotate(90, 0, 0, 1)
    renderInfo.windTurbine.housing.draw(renderInfo, null, housingMatrix)

    let tipMatrix = new Matrix4().setIdentity()
    tipMatrix.translate(11, 10.9, 13)
    tipMatrix.rotate(90, 0, 0, 1)
    tipMatrix.rotate(renderInfo.windTurbine.animation.currentRotation, 0, 1, 0)
    renderInfo.stack.pushMatrix(tipMatrix)
    renderInfo.windTurbine.tip.draw(renderInfo, null, tipMatrix)

    let blade1Matrix = renderInfo.stack.peekMatrix()
    blade1Matrix.translate(0, 0, 2.3)
    renderInfo.windTurbine.blade.draw(renderInfo, null, blade1Matrix)

    let blade2Matrix = renderInfo.stack.peekMatrix()
    blade2Matrix.translate(-1.8, 0, -1.1)
    blade2Matrix.rotate(60, 0, 1, 0)
    renderInfo.windTurbine.blade.draw(renderInfo, null, blade2Matrix)

    let blade3Matrix = renderInfo.stack.peekMatrix()
    blade3Matrix.translate(1.8, 0, -1.1)
    blade3Matrix.rotate(60, 0, -1, 0)
    renderInfo.windTurbine.blade.draw(renderInfo, null, blade3Matrix)
}