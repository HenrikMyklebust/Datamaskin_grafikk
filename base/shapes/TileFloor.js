'use strict';
/**
 * Setter this.positions, this.colors for et rektangel i XZ-planet.
 * Tegnes vha. gl.TRIANGLE_STRIP
 */
import {BaseShape} from './BaseShape.js';

export class TileFloor extends BaseShape {

    constructor(app, count, tileSize = 1.5, color = {red:0, green:0, blue:0, alpha:1}) {
        super(app);
        this.count = count;
        this.tileSize = tileSize;
        this.color = color
        this.wireFrame = false;
    }

    createVertices() {
        super.createVertices();

        let count = this.count;
        let tileSize = this.tileSize
        this.positions = [];

        for (let i = -count/2; i <= count/2; i++){
            let x = i * tileSize
            let y = 0
            let z = count/2 * tileSize
            this.positions.push(x,y,z)
            this.positions.push(x,y,-z)
            this.positions.push(z,y,x)
            this.positions.push(-z,y,x)
        }
    }
    setColors() {
        //Samme farge
        let count = this.count;
        for (let i = 0; i < count*4; i++) {
            this.colors.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
        }
    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
            this.gl.drawArrays(this.gl.LINES, 0, this.vertexCount);
    }
}


