'use strict';
import {BaseShape} from './BaseShape.js';
/**
 * Setter this.positions & this.colors.
 * Tegnes vha. gl.TRIANGLE_FAN
 */
export class Cylinder extends BaseShape {
    constructor(app, radius, height, color = {red:0.8, green:0.1, blue:0.6, alpha:1}, sectors=36) {
        super(app);
        this.radius = radius;
        this.height = height;
        this.color = color;
        this.sectors = sectors;
    }

    createVertices() {
        super.createVertices();

        const radius = this.radius
        const height = this.height
        const color = this.color
        this.positions = [];	//Tegnes vha. TRIANGLE_FAN
        this.colors = [];

        let toPI = 2*Math.PI;
        let stepGrader = 360 / this.sectors;
        let step = (Math.PI / 180) * stepGrader;
        let r=color.red, g=color.green, b=color.blue, a=color.alpha;

        // Startpunkt:
        let x=0, y=0, z=0;

        // Bottom
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = Math.cos(phi) * radius;
            y = 0;
            z = Math.sin(phi) * radius;

            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            x = Math.cos(phi + step) * radius;
            y = 0;
            z = Math.sin(phi + step) * radius;

            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            this.positions = this.positions.concat(0,0,0);
            this.colors = this.colors.concat(r,g,b,a);
        }

        // Top
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            x = Math.cos(phi) * radius;
            y = height;
            z = Math.sin(phi) * radius;

            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            x = Math.cos(phi + step) * radius;
            z = Math.sin(phi + step) * radius;

            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            this.positions = this.positions.concat(0,height,0);
            this.colors = this.colors.concat(r,g,b,a);
        }

        // Sides
        for (let phi = 0.0; phi <= toPI; phi += step)
        {
            //1
            x = Math.cos(phi) * radius;
            y = height;
            z = Math.sin(phi) * radius;
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            //2
            x = Math.cos(phi) * radius;
            y = 0
            z = Math.sin(phi) * radius;
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            //3
            x = Math.cos(phi + step) * radius;
            z = Math.sin(phi + step) * radius;
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            //1
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            //2
            x = Math.cos(phi + step) * radius;
            y = height;
            z = Math.sin(phi + step) * radius;
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);

            //3
            x = Math.cos(phi) * radius;
            y = height;
            z = Math.sin(phi) * radius;
            this.positions = this.positions.concat(x,y,z);
            this.colors = this.colors.concat(r,g,b,a);





        }



    }

    draw(shaderInfo, elapsed, modelMatrix = (new Matrix4()).setIdentity()) {
        super.draw(shaderInfo, elapsed, modelMatrix);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}


