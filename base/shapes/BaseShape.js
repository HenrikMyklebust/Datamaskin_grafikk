'use strict';

/**
 * Basis for alle shape-klassene.
 */
export class BaseShape {

    constructor(app) {
        this.app = app;
        this.gl = app.gl;
        this.camera = app.camera;

        this.vertexCount = 0;

		// Vertex info arrays:
		this.positions = [];
		this.colors = [];
	    this.textureCoordinates = [];
		this.normals = [];

		// Referanser til alle buffer:
		this.buffers = {
			position: undefined,
			color: undefined,
			texture: undefined,
			normals: undefined
		};

		// Brukes i connectPositionAttribute() m.fl.:
		this.numComponents = -1;
		this.type = this.gl.FLOAT;
		this.normalize = false;
		this.stride = 0;
		this.offset = 0;
    }

	/**
	 * Oppretter posisjon-, fargebuffer m.m.
	 */
    initBuffers() {
		// Kaller på ev. overstyrt funksjon i subklasser:
		this.createVertices();

		// Posisjon:
		if (this.positions.length > 0) {
			this.buffers.position = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);
		}

		// Farge:
		if (this.colors.length > 0) {
			this.buffers.color = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		}

		// Normaler:
		if (this.normals.length > 0) {
			this.buffers.normals = this.gl.createBuffer();
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normals);
			this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.normals), this.gl.STATIC_DRAW);
			this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		}


		//NB!
		this.initTextures();

		this.vertexCount = this.positions.length/3;
    }

	//NB! Denne overstyres av subklasser dersom tekstur er aktuelt.
	initTextures() {
		// Gjør ingenting. Må overstyres dersom aktuelt.
	}

	/**
	 * Kan overstyres av subklasser.
	 */
	createVertices() {
		this.setPositions();
		this.setColors();
		this.setTextureCoordinates();
		this.setNormals();
	}

	/**
	 * Kan overstyres av subklasser.
	 */
	setPositions() {
		this.positions = [];
	}

	/**
	 * Kan overstyres av subklasser.
	 */
	setColors() {
		this.colors = [];
	}

	setTextureCoordinates() {
		this.textureCoordinates = [];
	}

	setNormals() {
		this.normals = []
	}

    /**
     * Kopler til og aktiverer position-bufferet.
     */
	connectPositionAttribute(shaderInfo) {
		if (this.buffers.position === undefined)
			return;
		this.numComponents = 3;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexPosition,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexPosition);
	}

    /**
     * Kopler til og aktiverer color-bufferet.
     */
	connectColorAttribute(shaderInfo) {
		if (this.buffers.color === undefined || shaderInfo.attribLocations.vertexColor === undefined)
			return;

		this.numComponents = 4;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexColor,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexColor);
	}

	connectColorUniform(shaderInfo) {
		if (shaderInfo.uniformLocations.objectColor === undefined)
			return;

		this.gl.uniform3f(shaderInfo.uniformLocations.objectColor, this.colors[0], this.colors[1], this.colors[2]);
	}

	connectNormalAttribute(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.attribLocations.vertexNormal === undefined)
			return;
		this.numComponents = 3;
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normals);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexNormal,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexNormal);
	}

	/**
	 * Kopler til og aktiverer teksturkoordinat-bufferet.
	 */
	connectTextureAttribute(shaderInfo) {
		if (this.buffers.texture === undefined || shaderInfo.attribLocations.vertexTextureCoordinate === undefined)
			return;

		this.numComponents = 2;    //NB!
		//Bind til teksturkoordinatparameter i shader:
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
		this.gl.vertexAttribPointer(
			shaderInfo.attribLocations.vertexTextureCoordinate,
			this.numComponents,
			this.type,
			this.normalize,
			this.stride,
			this.offset);
		this.gl.enableVertexAttribArray(shaderInfo.attribLocations.vertexTextureCoordinate);

		//Aktiver teksturenhet (0):
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.rectangleTexture);
		//Send inn verdi som indikerer hvilken teksturenhet som skal brukes (her 0):
		let samplerLoc = this.gl.getUniformLocation(shaderInfo.program, shaderInfo.uniformLocations.sampler);
		this.gl.uniform1i(samplerLoc, 0);

	}

	connectAmbientUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.ambientLightColor === undefined)
			return;
		let r = shaderInfo.light.ambientLightColor.r
		let g = shaderInfo.light.ambientLightColor.g
		let b = shaderInfo.light.ambientLightColor.b
		this.gl.uniform3f(shaderInfo.uniformLocations.ambientLightColor, r, g, b)
	}

	connectDiffuseUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.diffuseLightColor === undefined)
			return;

		let r = shaderInfo.light.diffuseLightColor.r
		let g = shaderInfo.light.diffuseLightColor.g
		let b = shaderInfo.light.diffuseLightColor.b
		this.gl.uniform3f(shaderInfo.uniformLocations.diffuseLightColor, r, g, b);
	}

	connectSpecularUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.specularLightColor === undefined)
			return;

		let r = shaderInfo.light.specularLightColor.r
		let g = shaderInfo.light.specularLightColor.g
		let b = shaderInfo.light.specularLightColor.b
		this.gl.uniform3f(shaderInfo.uniformLocations.specularLightColor, r, g, b);
	}

	connectLightPosition(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.lightPosition === undefined)
			return;

		let x = shaderInfo.light.lightPosition.x
		let y = shaderInfo.light.lightPosition.y
		let z = shaderInfo.light.lightPosition.z
		this.gl.uniform3f(shaderInfo.uniformLocations.lightPosition, x, y, z);
	}

	connectShininessUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.shininess === undefined)
			return;

		this.gl.uniform1f(shaderInfo.uniformLocations.shininess, shaderInfo.light.shininess);
	}

	connectIntensityUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.intensity === undefined)
			return;

		this.gl.uniform1f(shaderInfo.uniformLocations.intensity, shaderInfo.light.intensity);
	}

	connectAlphaUniform(shaderInfo) {
		if (this.buffers.normals === undefined || shaderInfo.uniformLocations.alpha === undefined)
			return;
		this.gl.uniform1f(shaderInfo.uniformLocations.alpha, this.colors[3])
	}

	connectCameraPositionUniform(shaderInfo) {
		if (shaderInfo.uniformLocations.cameraPosition === undefined)
			return;

		this.gl.uniform3f(shaderInfo.uniformLocations.cameraPosition,
			this.camera.camPosX,
			this.camera.camPosY,
			this.camera.camPosZ);
	}

	setCameraMatrices(shaderInfo, modelMatrix) {
		this.camera.set();  //NB!
		let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);
		if (shaderInfo.uniformLocations.modelViewMatrix)
			this.gl.uniformMatrix4fv(shaderInfo.uniformLocations.modelViewMatrix, false, modelviewMatrix.elements);
		if (shaderInfo.uniformLocations.projectionMatrix)
			this.gl.uniformMatrix4fv(shaderInfo.uniformLocations.projectionMatrix, false, this.camera.projectionMatrix.elements);
	}

	setNormalMatrices(shaderInfo, modelMatrix) {
		let normalMatrix = mat3.create();
		mat3.normalFromMat4(normalMatrix, modelMatrix.elements);
		this.gl.uniformMatrix3fv(shaderInfo.uniformLocations.normalMatrix, false, normalMatrix);
	}

	draw(shaderInfo, elapsed, modelMatrix) {
		if  (!shaderInfo)
			return;
		// Anngi shaderprogram som skal brukes:
		this.gl.useProgram(shaderInfo.program);

		// Kople til buffer og send verdier til shaderne:
		this.connectAmbientUniform(shaderInfo);
		this.connectDiffuseUniform(shaderInfo);
		this.connectSpecularUniform(shaderInfo);
		this.connectLightPosition(shaderInfo);
		this.connectCameraPositionUniform(shaderInfo);
		this.connectShininessUniform(shaderInfo);
		this.connectIntensityUniform(shaderInfo);
		this.connectPositionAttribute(shaderInfo);
		this.connectColorAttribute(shaderInfo);
		this.connectColorUniform(shaderInfo);
		this.connectAlphaUniform(shaderInfo);
		this.connectNormalAttribute(shaderInfo);
		this.connectTextureAttribute(shaderInfo);



		// Send matriser til shaderen:
		this.setCameraMatrices(shaderInfo, modelMatrix);
		this.setNormalMatrices(shaderInfo, modelMatrix);
	}


}
