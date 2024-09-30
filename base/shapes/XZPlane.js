'use strict';
/**
 * Setter this.positions, this.colors for et rektangel i XZ-planet.
 * Tegnes vha. gl.TRIANGLE_STRIP
 */
import {BaseShape} from './BaseShape.js';

export class XZPlane extends BaseShape {

    constructor(app, width= 40, height= 40, color = {red:0.3, green:0.5, blue:0.2, alpha:1}, textureUrls=[]) {
        super(app);
        this.width = width;
        this.height = height;
        this.color = color
        this.textureUrls = textureUrls;
        this.wireFrame = false;
    }

    createVertices() {
        super.createVertices();

        let width = this.width;
        let height = this.height;

        this.positions = [
            -width / 2 , 0, height / 2,
            width / 2, 0, height / 2,
            -width / 2, 0, -height / 2,
            width / 2, 0, -height / 2
        ];

        this.textureCoordinates = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];
    }
    setColors() {
        //Samme farge på alle sider:
        for (let i = 0; i < 4; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    isWireframe() {
        this.wireFrame = true
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        if (this.wireFrame) {
            this.gl.drawArrays(this.gl.LINE_LOOP, 0, this.vertexCount);
        } else {
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, this.vertexCount);
        }
    }
}


