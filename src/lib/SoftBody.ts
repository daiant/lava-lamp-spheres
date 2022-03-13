import * as THREE from "three";
import { UniverseImpl } from "./ Universe";
import { BoundingBoxImpl } from "./BoundingBox";

export class SoftBody {
    vertices: Float32Array;
    points: THREE.Points;
    lines: THREE.Line;
    geometry: THREE.BufferGeometry;
    velocity: {x: number, y: number};
    direction: {x: number, y: number};
    deg: number;
    constructor(vertices: Float32Array, points: THREE.Points, lines: THREE.Line) {
        this.vertices = vertices;
        this.points = points;
        this.lines = lines;
        this.geometry = points.geometry;
        this.velocity = {x: 0.03, y: 0.03};
        this.direction = {x: 1, y: 1};
        this.deg = 0;
    }
    getX() {
        var pointsX = [];
        for(var i = 0; i < this.vertices.length; i++) {
            if((i + 2) % 3 === 2) {
                pointsX.push(this.vertices[i]);
            }
        }
        return pointsX;
    }
    getY() {
        var pointsY = [];
        for(var i = 0; i < this.vertices.length; i++) {
            if((i + 2) % 3 === 0) {
                pointsY.push(this.vertices[i]);
            }
        }
        return pointsY;
    }
    setY(y: number)  {
        for(var i = 0; i < this.vertices.length; i++) {
            if((i + 2) % 3 === 0) {
                this.vertices[i] = this.vertices[i] + y;
            }
        }
        // Update
        this.geometry.setAttribute("position", new THREE.BufferAttribute(this.vertices, 3));
    }
    setX(x: number)  {
        for(var i = 0; i < this.vertices.length; i++) {
            if((i + 2) % 3 === 2) {
                this.vertices[i] = this.vertices[i] + x;
            }
        }
        // Update
        this.geometry.setAttribute("position", new THREE.BufferAttribute(this.vertices, 3)); 
    }
    calculateBounding(boundingBox: BoundingBoxImpl) {
        const pointsX = this.getX();
        const pointsY = this.getY();
        for (let p of pointsX) {
            if(Math.abs(p) >= Math.abs(boundingBox.x)) {
                console.log("alert x");
                this.direction.x = -this.direction.x;
                break;
            }
        }
        for(let p of pointsY) {
            if(Math.abs(p) >= Math.abs(boundingBox.y)) {
                console.log("alert y");
                this.direction.y = -this.direction.y;
                break;
            }
        }
    }
    rotate(deg: number) {
        if(deg != this.deg) {
            this.deg = deg;
            const centerPoint = {x: 0, y: 0};
            const rotate = {x: this.vertices[0], y: this.vertices[1]};
            const euclidean = this.getDistance(centerPoint, rotate);
            const angle = this.getAngle(rotate.x, centerPoint.x, euclidean);
            const angleToRotate = angle + deg * THREE.MathUtils.DEG2RAD;
            console.log(angleToRotate + " - " + angleToRotate * THREE.MathUtils.RAD2DEG);
            const C = 180 * THREE.MathUtils.DEG2RAD - 90 * THREE.MathUtils.DEG2RAD - angleToRotate;
            const newX = euclidean * Math.sin(C) / Math.sin(angleToRotate);
            const newY = euclidean * Math.sin(90 * THREE.MathUtils.DEG2RAD) /Math.sin(angleToRotate);

            console.log(newX);
            console.log(newY);
            
            this.vertices[0] = centerPoint.x - newX ;
            this.vertices[1] = centerPoint.y + newY ;
            this.geometry.setAttribute("position", new THREE.BufferAttribute(this.vertices, 3));
        } 

    }
    getAngle(a: number, b: number, euclidean: number) {
        return Math.acos(Math.abs(a - b) / euclidean) 
    }
    getDistance(a: {x: number, y: number}, b: {x: number, y: number}) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    }
    getCenterPoint() {
        // Mejorar
        const res = {x: 0, y: 0};
        res.x = (this.vertices[0] + this.vertices[3]) / 2
        res.y = (this.vertices[1] + this.vertices[7]) / 2;
        return res;
    }
    calculateMovement(boundingBox: BoundingBoxImpl, universe: UniverseImpl) {
        // this.setY(this.velocity.y * this.direction.y);
        // this.setX(this.velocity.x * this.direction.x);
        this.calculateBounding(boundingBox);
    }
}