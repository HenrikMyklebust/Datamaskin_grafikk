import {WebGLCanvas} from '../base/helpers/WebGLCanvas.js';
import {WebGLShader} from '../base/helpers/WebGLShader.js';
import {Camera} from "../base/helpers/Camera.js";
import {Stack} from "../base/helpers/Stack.js";
import {TileFloor} from "../base/shapes/TileFloor.js";
import {Cube} from "../base/shapes/Cube.js";


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
    let diffuseLightShaderInfo = initDiffuseLightShader(webGLCanvas.gl)
    let textureShaderInfo = initTextureShaders(webGLCanvas.gl)

    // Hjelpeobjekt som holder på objekter som trengs for rendring:
    const renderInfo = {
        app: app,
        baseShader: {
            uniformLocations: baseShaderInfo.uniformLocations,
            attribLocations: baseShaderInfo.attribLocations,
            program: baseShaderInfo.program,
        },
        diffuseLightShader: {
            uniformLocations: diffuseLightShaderInfo.uniformLocations,
            attribLocations: diffuseLightShaderInfo.attribLocations,
            program: diffuseLightShaderInfo.program,
            light: {
                lightPosition: {x: 5, y:2, z:5},
                diffuseLightColor: {r: 1, g: 1, b:1},
                ambientLightColor: {r: 0.2, g: 0.2, b:0.2},
                specularLightColor: {r: 1, g: 1, b:1},
                shininess: 3.0,
                intensity: 0.5,
            },
        },
        textureShader: {
            uniformLocations: textureShaderInfo.uniformLocations,
            attribLocations: textureShaderInfo.attribLocations,
            program: textureShaderInfo.program,
            light: {
                lightPosition: {x: 5, y:2, z:5},
                diffuseLightColor: {r: 1, g: 1, b:1},
                ambientLightColor: {r: 0.2, g: 0.2, b:0.2},
                specularLightColor: {r: 1, g: 1, b:1},
                shininess: 1.0,
                intensity: 0.5,
            },
        },
        tileFloor: initTileFloor(app, 25),
        character: initCube(app, 1.5, 1.5, 1.5, {red: 0.3, green: 0.8, blue: 0.3, alpha: 1}),
        tail: [],
        tailDirection: [],
        stack: new Stack(),
        currentlyPressedKeys: keys,
        drawWhileMove: true,
        randomColor: true,
        lastTime: 0,
        fpsInfo: {  // Brukes til å beregne og vise FPS (Frames Per Seconds):
            frameCount: 0,
            lastTimeStamp: 0
        }
    };
    initButtons(renderInfo)
    animate(0, renderInfo);

}

function initButtons(renderInfo) {
    document.getElementById('-z').addEventListener('click', () => addNewTail(renderInfo, "-Z"));
    document.getElementById('-x').addEventListener('click', () => addNewTail(renderInfo, "-X"));
    document.getElementById('+').addEventListener('click', () => addNewTail(renderInfo, "+"));
    document.getElementById('+x').addEventListener('click', () => addNewTail(renderInfo, "+X"));
    document.getElementById('+y').addEventListener('click', () => addNewTail(renderInfo, "+Y"));
    document.getElementById('+z').addEventListener('click', () => addNewTail(renderInfo, "+Z"));
    document.getElementById('-y').addEventListener('click', () => addNewTail(renderInfo, "-Y"));

    document.getElementById("drawWhileMove").addEventListener("change", (event) => {
        renderInfo.drawWhileMove = !renderInfo.drawWhileMove;});

    document.getElementById("randomColor").addEventListener("change", (event) => {
        renderInfo.randomColor = !renderInfo.randomColor;});
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

function initDiffuseLightShader(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('diffuse-pointlight-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('diffuse-pointlight-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return  {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexNormal'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
            modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
            normalMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uNormalMatrix'),

            objectColor: gl.getUniformLocation(glslShader.shaderProgram, 'uObjectColor'),
            cameraPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uCameraPosition'),
            lightPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uLightPosition'),
            ambientLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
            diffuseLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uDiffuseLightColor'),
            specularLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uSpecularLightColor'),

            shininess: gl.getUniformLocation(glslShader.shaderProgram, 'uShininess'),
            intensity: gl.getUniformLocation(glslShader.shaderProgram, 'uIntensity'),
            alpha: gl.getUniformLocation(glslShader.shaderProgram, 'uAlpha'),
        },
    };
}

function initTextureShaders(gl) {
    // Leser shaderkode fra HTML-fila: Standard/enkel shader (posisjon og farge):
    let vertexShaderSource = document.getElementById('diffuse-pointlight-texture-vertex-shader').innerHTML;
    let fragmentShaderSource = document.getElementById('diffuse-pointlight-texture-fragment-shader').innerHTML;

    // Initialiserer  & kompilerer shader-programmene;
    const glslShader = new WebGLShader(gl, vertexShaderSource, fragmentShaderSource);

    // Samler all shader-info i ET JS-objekt, som returneres.
    return  {
        program: glslShader.shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexPosition'),
            vertexNormal: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexNormal'),
            vertexTextureCoordinate: gl.getAttribLocation(glslShader.shaderProgram, 'aVertexTextureCoordinate'),
        },
        uniformLocations: {
            sampler: gl.getUniformLocation(glslShader.shaderProgram, 'uSampler'),
            projectionMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelViewMatrix'),
            modelMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uModelMatrix'),
            normalMatrix: gl.getUniformLocation(glslShader.shaderProgram, 'uNormalMatrix'),

            cameraPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uCameraPosition'),
            lightPosition: gl.getUniformLocation(glslShader.shaderProgram, 'uLightPosition'),
            ambientLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uAmbientLightColor'),
            diffuseLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uDiffuseLightColor'),
            specularLightColor: gl.getUniformLocation(glslShader.shaderProgram, 'uSpecularLightColor'),

            shininess: gl.getUniformLocation(glslShader.shaderProgram, 'uShininess'),
            intensity: gl.getUniformLocation(glslShader.shaderProgram, 'uIntensity'),
        },
    };
}

function initTileFloor(app, count) {
    let plane = new TileFloor(app, count)
    plane.initBuffers()
    return plane;
}

function initCube(app, width, length, height, color) {
    let cube = new Cube(app, width, length, height, color)
    cube.initBuffers()
    return cube
}


function addNewTail(renderInfo, direction){
    renderInfo.tail = renderInfo.tail.concat(createTail(renderInfo))
    renderInfo.tailDirection = renderInfo.tailDirection.concat(direction)
}

function createTail(renderInfo) {
    let color = {red: 0.3, green: 0.3, blue: 0.3, alpha: 0.0}
    if (renderInfo.randomColor) {
        let r = Math.random()
        let g = Math.random()
        let b = Math.random()
        color = {red: r, green: g, blue: b, alpha: 0.0}
    }
    if (renderInfo.drawWhileMove) {
        color.alpha = 0.7
    }

    return initCube(renderInfo.app, 1.5, 1.5, 1.5, color)
}

function animate(currentTime, renderInfo) {
    window.requestAnimationFrame((currentTime) => {
        animate(currentTime, renderInfo);
    });

    // Finner tid siden siste kall på draw().
    let elapsed = getElapsed(currentTime, renderInfo);
    calculateFps(currentTime, renderInfo.fpsInfo);

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

    renderInfo.app.gl.enable(renderInfo.app.gl.BLEND)
    renderInfo.app.gl.blendEquation(renderInfo.app.gl.FUNC_ADD);    //FUNC_ADD, FUNC_SUBTRACT,
    renderInfo.app.gl.blendFunc(renderInfo.app.gl.SRC_ALPHA, renderInfo.app.gl.ONE_MINUS_SRC_ALPHA);

    renderInfo.app.gl.depthMask(false);
    drawTail(renderInfo)

    renderInfo.app.gl.depthMask(true);
    drawCharacter(renderInfo)
    drawTileFloor(renderInfo)
}

function clearCanvas(gl) {
    gl.clearColor(0.9, 0.9, 0.9, 1);  // Clear screen farge.
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);           // Enable "depth testing".
    gl.depthFunc(gl.LEQUAL);            // Nære objekter dekker fjerne objekter.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawTail(renderInfo) {
    let i = 0
    try {
        renderInfo.stack.peekMatrix()
    }
    catch (error){
        addNewTail(renderInfo, "+")
    }
    let tailMatrix = new Matrix4().setIdentity()
    renderInfo.stack.pushMatrix(tailMatrix)

    while(i < renderInfo.tail.length) {
        switch (renderInfo.tailDirection[i]) {
            case ("-Z"): tailMatrix.translate(0, 0, -1.5)
                break;
            case ("+Z"): tailMatrix.translate(0, 0, 1.5)
                break;
            case ("-X"): tailMatrix.translate(-1.5, 0, 0)
                break;
            case ("+X"): tailMatrix.translate(1.5, 0, 0)
                break;
            case ("-Y"):
                tailMatrix.translate(0, -1.5, 0)
                if (tailMatrix.elements[13] < 0) {
                    tailMatrix.translate(0, 1.5, 0)
                }
                break;
            case ("+Y"): tailMatrix.translate(0, 1.5, 0)
                break;
            case ("+"):
                break;
            default:
                break;
        }

        renderInfo.stack.pushMatrix(tailMatrix)
        renderInfo.tail[i].draw(renderInfo.diffuseLightShader, null, tailMatrix)
        i++
    }
}
function drawCharacter(renderInfo) {
    let characterMatrix = renderInfo.stack.peekMatrix()
    renderInfo.character.draw(renderInfo.textureShader, null, characterMatrix)
}


function drawTileFloor(renderInfo) {
    let planeMatrix = new Matrix4().setIdentity()

    renderInfo.tileFloor.draw(renderInfo.baseShader, null, planeMatrix)
}
