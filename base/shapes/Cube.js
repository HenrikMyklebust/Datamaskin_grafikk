'use strict';
import {BaseShape} from './BaseShape.js';
import {ImageLoader} from "./../helpers/ImageLoader.js";
import {isPowerOfTwo1} from "./../lib/utility-functions.js";

/**
 * Setter this.positions, this.colors for en kube.
 * Tegnes vha. gl.LINE_STRIP eller gl.TRIANGLES.
 */
export class Cube extends BaseShape {
    constructor(app, width, length, height, color = {red:0.8, green:0.0, blue:0.6, alpha:0.7}, wireFrame=false) {
        super(app);
        this.width = width;
        this.height = height;
        this.length = length;
        this.color = color;
        this.wireFrame = wireFrame;
        this.vertexCount = 0;
    }

    setPositions() {

        let width = this.width;
        let length = this.length;
        let height = this.height;

        //36 stk posisjoner:
        this.positions = [
            //Forsiden (pos):
            -width/2, height, length/2,
            -width/2,0, length/2,
            width/2,0, length/2,

            -width/2,height,length/2,
            width/2, 0, length/2,
            width/2,height,length/2,

            //H�yre side:

            width/2,height,length/2,
            width/2,0,length/2,
            width/2,0,-length/2,

            width/2,height,length/2,
            width/2,0,-length/2,
            width/2,height,-length/2,

            //Baksiden (pos):
            width/2,0,-length/2,
            -width/2,0,-length/2,
            width/2, height,-length/2,

            -width/2,0,-length/2,
            -width/2,height,-length/2,
            width/2,height,-length/2,

            //Venstre side:
            -width/2,0,-length/2,
            -width/2,height,length/2,
            -width/2,height,-length/2,

            -width/2,0,length/2,
            -width/2,height,length/2,
            -width/2,0,-length/2,

            //Topp:
            -width/2,height,length/2,
            width/2,height,length/2,
            -width/2,height,-length/2,

            -width/2,height,-length/2,
            width/2,height,length/2,
            width/2,height,-length/2,

            //Bunn:
            -width/2,0,-length/2,
            width/2,0,length/2,
            -width/2,0,length/2,

            -width/2,0,-length/2,
            width/2,0,-length/2,
            width/2,0,length/2,
        ];
        this.vertexCount = this.positions/3;
    }

    setColors() {
        //Samme farge på alle sider:
        for (let i = 0; i < 36; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    setTextureCoordinates() {
        this.textureCoordinates = [
            //Forsiden:
            0,1,
            0,0,
            1,0,

            0,1,
            1,0,
            1,1,

            //H�yre side:
            0,1,
            0,0,
            1,0,

            0,1,
            1,0,
            1,1,

            //Baksiden:
            0,0,
            1,0,
            0,1,

            1,0,
            1,1,
            0,1,

            //Venstre side:
            0,0,
            1,1,
            0,1,

            1,0,
            1,1,
            0,0,

            //Topp
            0,0,
            1,0,
            0,1,

            0,1,
            1,0,
            1,1,

            //Bunn:
            1,1,
            0,0,
            1,0,

            1,1,
            0,1,
            0,0
        ];
    }

    setNormals() {
        for (let i = 0; i < 6; i++) this.normals.push(0, 0, 1);   // Front face
        for (let i = 0; i < 6; i++) this.normals.push(1, 0, 0);   // Right face
        for (let i = 0; i < 6; i++) this.normals.push(0, 0, -1);  // Back face
        for (let i = 0; i < 6; i++) this.normals.push(-1, 0, 0);  // Left face
        for (let i = 0; i < 6; i++) this.normals.push(0, 1, 0);   // Top face
        for (let i = 0; i < 6; i++) this.normals.push(0, -1, 0);  // Bottom face
    }

    initTextures() {
        const textureUrls = ['../base/textures/bricks1.png'];

        if (this.textureCoordinates.length > 0) {
            //Laster textureUrls...
            let imageLoader = new ImageLoader();
            imageLoader.load((textureImages) => {
                    const textureImage = textureImages[0];
                    if (isPowerOfTwo1(textureImage.width) && isPowerOfTwo1(textureImage.height)) {
                        this.rectangleTexture = this.gl.createTexture();
                        //Teksturbildet er nå lastet fra server, send til GPU:
                        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rectangleTexture);

                        //Unngaa at bildet kommer opp-ned:
                        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
                        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);   //NB! FOR GJENNOMSIKTIG BAKGRUNN!! Sett også this.gl.blendFunc(this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

                        //Laster teksturbildet til GPU/shader:
                        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);

                        //Teksturparametre:
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
                        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

                        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

                        this.buffers.texture = this.gl.createBuffer();
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.texture);
                        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.textureCoordinates), this.gl.STATIC_DRAW);
                    }
                },
                textureUrls);
        }
    }


    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        if (this.wireFrame) {
            this.gl.drawArrays(this.gl.LINE_STRIP, 0, this.vertexCount);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
        }
    }
}
