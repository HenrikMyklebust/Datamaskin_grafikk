'use strict';
import {BaseShape} from './BaseShape.js';

/**
 * Setter this.positions, this.colors for en kube.
 * Tegnes vha. gl.LINE_STRIP eller gl.TRIANGLES.
 */
export class TriangleRoof extends BaseShape {
    constructor(app, width, length, height, color = {red:0.8, green:0.0, blue:0.6, alpha:1}, wireFrame=false) {
        super(app);
        this.width = width;
        this.height = height;
        this.length = length;
        this.color = color;
        this.wireFrame = wireFrame;
    }

    setPositions() {

        let width = this.width;
        let length = this.length;
        let height = this.height;

        //36 stk posisjoner:
        this.positions = [
            //Forsiden (pos):
            -width/2, 0, length/2,
            width/2, 0, length/2,
            0, height, length/2,

            //H�yre side:
            0,height,length/2,
            width/2,0,length/2,
            width/2,0,-length/2,

            0,height,length/2,
            width/2,0,-length/2,
            0,height,-length/2,

            //Baksiden (pos):
            width/2,0,-length/2,
            -width/2,0,-length/2,
            0, height,-length/2,


            //Venstre side:
            0,height,length/2,
            -width/2,0,length/2,
            -width/2,0,-length/2,

            0,height,length/2,
            -width/2,0,-length/2,
            0,height,-length/2,


            //Bunn:
            -width/2,0,length/2,
            width/2,0,length/2,
            width/2,0,-length/2,

            -width/2,0,length/2,
            width/2,0,-length/2,
            -width/2,0,-length/2,
        ];
        this.vertexCount = this.positions/3;
    }

    setColors() {
        //Samme farge på alle sider:
        for (let i = 0; i < 36; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    getHeightToPlane() {
        return this.height / 2 + 0.01
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
