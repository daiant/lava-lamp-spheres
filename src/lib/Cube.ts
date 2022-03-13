import { UniverseImpl } from "./ Universe";

export class Cube {
    mass: number;
    position: number; 
    velocity: number;
    direction:number;
    terminalVelocity: number;
    constructor(mass: number = 0.010, position: number = 0) {
        this.mass = mass;
        this.position = position;
        this.velocity = 0;
        this.terminalVelocity = 9.18*40*0.0005;
        this.direction = -1;
    }
    setMass(mass: number) {
        this.mass = mass;
    }
    setPosition(position: number) {
        this.position = position;
    }
    setVelocity(velocity: number) {
        this.velocity = velocity;
    }
    setDirection(direction: number) {
        this.direction = direction
    }
    //*getNewPosition(gravity: GravityImpl, elapsedTime: number) {
    //  let velocity = this.velocity;
    // let acc = gravity.getAcceleration(this.mass, velocity, this.direction);

    //    velocity += acc * elapsedTime;
    //
    //    if(this.direction > 0 && 
    //        Math.abs(velocity) < Math.abs(acc)) {
    //        this.setDirection(-1);
    //    }
    //    return velocity;
    //}
}