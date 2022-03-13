import * as THREE from "three";
import { HighlightSpanKind } from "typescript";
import { Universe, UniverseImpl } from "./ Universe";
import { BoundingBox, BoundingBoxImpl } from "./BoundingBox";

enum Direction {
    DOWN = -1,
    UP = 1,
    LEFT = -1,
    RIGHT = 1
}
export class Sphere {
    mesh: THREE.Mesh;
    cancelAnimation: boolean;
    mass: number;
    cD: number;
    velocity: {x: number, y: number};
    area: number;
    direction: {x: number, y: number}
    cor: number;
    radius: number;
    inCollision: boolean;
    heat: number = 80; // Cº 
    density: number = 900; // kg/m³
    melting_point: number = 37;
    constructor(geometry: THREE.SphereGeometry, material: THREE.Material, mass: number = 1) {
        this.mesh = new THREE.Mesh(geometry, material);
        this.cD = 0.0005;
        this.velocity = {x: 0, y: 0};
        this.area = Math.PI**2 * geometry.parameters.radius;
        this.radius = geometry.parameters.radius;
        this.direction = {x: 1, y: -1};
        this.cor = 0.63;
        this.cancelAnimation = false;
        this.inCollision = false;
        this.mass = this.density * (4/3) * Math.pow(this.radius, 3) / 100;
    }
    setX(x: number) {
        this.mesh.position.x = x;
    }
    setY(y:number) {
        this.mesh.position.y = y;
    }
    getX() {
        return this.mesh.position.x;
    }
    getY() {
        return this.mesh.position.y;
    }
    requestCancel() {
        this.cancelAnimation = true;
    }
    calculateCollision(object: Sphere, euclidean: number) {
        this.inCollision = true;
        // Angle of incidence 
        const angle = Math.acos(Math.abs(this.getX() - object.getX()) / euclidean) * 180 / Math.PI;
        const direction = {
            x: this.getX() - object.getX() <= 0 ? -1 : 1,
            y : this.getY() - object.getY() <= 0 ? -1 : 1
        }
        // Get forces X
        const thisForce =  (this.velocity.x / 0.01) * this.mass * this.direction.x;
        const objectForce =  (object.velocity.x / 0.01) * object.mass * object.direction.x; 
        object.velocity.x = Math.abs(thisForce * 0.01) / object.mass;
        this.velocity.x = Math.abs(objectForce * 0.01) / this.mass;
        
        object.direction.x = thisForce >= 0 ? 1 : -1;
        this.direction.x = objectForce >= 0 ? 1 : -1;
        
        // Get forces Y
        const thisFY =  (this.velocity.y / 0.01) * this.mass * this.direction.y;
        const objectFY =  (object.velocity.y / 0.01) * object.mass * object.direction.y; 
        object.velocity.y = Math.abs(thisFY * 0.01) / object.mass;
        this.velocity.y = Math.abs(objectFY * 0.01) / this.mass;
        
        object.direction.y = thisFY >= 0 ? 1 : -1;
        this.direction.y = objectFY >= 0 ? 1 : -1;
        // tremendo hack;
        
        this.inCollision = false;

    }
    checkBoundingCollision(boundingBox: BoundingBoxImpl, universe: UniverseImpl) {
        // detect bounding
        const collisionY = boundingBox.isCollisionY(this.getY());
        const collisionX = boundingBox.isCollisionX(this.getX() + this.velocity.y * universe.correction * this.direction.x);
        if(collisionY) {
            const opposite = -Math.sign(this.velocity.y);
            this.velocity.y += Math.abs(this.velocity.y) * 1.2 * opposite;
            // Add drag to X
            // this.velocity.x = this.velocity.x * this.cor;
            // if(this.velocity.x <= 0.1) {
            //     this.velocity.x = 0;
            // }
            // sacalo de los bounds 
            this.setY(Math.round(this.getY()))
        }
        if(collisionX) {            
            this.velocity.x = this.velocity.x * this.cor;
            this.direction.x = -this.direction.x;
            // sacalo de los bounds;
            this.setX(Math.round(this.getX()))
        }
    }
    calculateHeat(limit: number) {
        // this will decrease or increase the density of the ball
        const threshold = -limit/2;
        let temperature;
        if(this.getY() >= threshold) {
            // Bajan las temperaturas
            temperature = (threshold - this.getY()) / (limit*2 + threshold);
        } else {
            // Suben
            temperature = (-this.getY() / limit) 
        }
        this.heat += temperature;
    }   
    calculateMovement(boundingBox: BoundingBoxImpl, universe: UniverseImpl) {
        // Check for colliding objects 
        for(let object of universe.objects) {
            if(object.mesh.uuid !== this.mesh.uuid) {
                let x =  object.getX();
                let y = object.getY();
                const euclidean = Math.sqrt((x - this.getX())**2 + (y - this.getY())**2);
                if(euclidean <= object.radius + this.radius && !object.inCollision) {

                    this.calculateCollision(object, euclidean);
                }   
            }
        }
        const fG = universe.getGravity(this.mass);
        // const dragX = this.getDrag(universe.density, this.velocity.x);
        const dragX = 0;
        const dragY = universe.getDrag(this.cD, this.velocity.y, this.area);
        let accelerationY;
        // Y 
        if(this.direction.y === Direction.DOWN) {
            accelerationY = ((fG - dragY) / this.mass);
        } else {
            accelerationY = (-(fG + dragY) / this.mass);
        }
        if(this.direction.y === Direction.UP && this.velocity.y + accelerationY * 0.01 <= 0) {
                this.direction.y = Direction.DOWN;
        }
        // X
        let accelerationX = dragX * -this.direction.x;
        this.velocity.y = Math.abs(this.velocity.y + accelerationY * 0.01);
        this.velocity.x = Math.abs(this.velocity.x + accelerationX * 0.01);

        this.checkBoundingCollision(boundingBox, universe);

        console.log("--------")
        const positionX = this.getX() + this.velocity.x * universe.correction * this.direction.x;
        const positionY = this.getY() + this.velocity.y * universe.correction * this.direction.y;
        this.setY(positionY);
        this.setX(positionX);
    }
    calculateBuoyancy(boundingBox: BoundingBoxImpl, universe: UniverseImpl) {
        this.checkBoundingCollision(boundingBox, universe);
        this.calculateHeat(boundingBox.y);
        if(this.getY() <= -(boundingBox.y)) {
            this.velocity.x +=( Math.random() * boundingBox.x * 2 - boundingBox.x) * universe.correction;
        } else {
            this.velocity.x = 0;
        }
        const fG = universe.getGravity(this.mass);
        
        const densityCorrection = (this.heat)  / (this.melting_point); 
        const d = (universe.density / this.density) * densityCorrection;
        this.velocity.y += (d-fG) * universe.correction *0.25;
        // Añadir drag Para no romper la wea;
        const fD = universe.getDrag(this.cD, this.velocity.y, this.area);
        
        this.velocity.y = (this.velocity.y >= 0 ? 1 : -1) * (Math.abs(this.velocity.y) - fD)
        this.setY(this.getY() + this.velocity.y);
        this.setX(this.getX() + this.velocity.x)
    }


    setMeltingPoint(m: number) {
        this.melting_point = m;
    }
}