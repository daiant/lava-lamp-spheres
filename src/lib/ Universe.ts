export interface UniverseImpl {
    gravity: number;
    correction: number;
    acceleration: number;
    density: number;
    objects: any[];
    getGravity(mass:number) : number;
    getDrag(cD: number, velocity: number, area: number) : number;
    getBuoyancy(cD: number, fG: number, height: number, area:number): number;
}
export class Universe {
    gravity: number;
    correction: number;
    acceleration: number; 
    density: number = 1000; // kg/m³
    objects: any[] = [];
    constructor(gravity: number = 9.84, correction : number = 0.00025) {
        this.gravity = gravity;
        this.correction = correction;
        this.acceleration = this.gravity * this.correction;
    }
    setGravity(gravity: number) {
        this.gravity = gravity;
    }
    setCorrection(corr: number) {
        this.correction = corr;
    }
    setDensity(density: number) {
        this.density = density;
    }
    addObject(object:any) {
        this.objects.push(object);
    }
    getGravity(mass:number) {
        return mass * this.gravity
    }
    getDrag(cD:number, velocity: number, area: number) {
        return (cD * this.density * velocity**2 * area) / 2;
    } 
    getBuoyancy(cD: number, fG: number, height: number, area: number) {
        return cD * fG * height;
    }
}