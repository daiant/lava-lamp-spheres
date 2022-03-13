import * as THREE from "three";
export interface BoundingBoxImpl {
    x: number;
    y: number;
    isCollisionX(x:number): boolean;
    isCollisionY(y:number): boolean;
}
export class BoundingBox {
    x: number;
    y: number;
    points: Array<THREE.Vector3>;
    constructor(x:number, y:number) {
        this.x = x;
        this.y = y;
        this.points = [];
        this.points.push( new THREE.Vector3( -this.x, -this.y, 0 ) );
        this.points.push( new THREE.Vector3( this.x, -this.y, 0 ) );
        // Right?
        this.points.push(new THREE.Vector3(this.x, -this.y, 0));
        this.points.push(new THREE.Vector3(this.x, this.y, 0));
        // Top
        this.points.push( new THREE.Vector3( this.x, this.y, 0 ) );
        this.points.push( new THREE.Vector3( -this.x, this.y, 0 ) );
        // Left
        this.points.push(new THREE.Vector3(-this.x, this.y, 0));
        this.points.push(new THREE.Vector3(-this.x, -this.y, 0));
    }
    isCollisionX(x: number){
        return Math.abs(x) >= Math.abs(this.x);
    }
    isCollisionY(y: number){
        return Math.abs(y) >= Math.abs(this.y);
    }
}