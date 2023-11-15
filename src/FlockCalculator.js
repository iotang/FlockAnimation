class FlockCalculator {

    constructor(current) {
        this.current = current;
        this.wanderDirection = 0;
    }

    makeSteer(dir) {
        dir.setLength(this.current.maxVel);
        let steer = vec2d.sub(dir, this.current.v);
        steer.limitLength(this.current.maxAcc);
        return steer;
    }

    seek(target) {
        let loca = vec2d.sub(target, this.current.x);
        return this.makeSteer(loca);
    }

    cohesion(others) {
        let distance = 40;
        let sumacc = new vec2d(0, 0);
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            let d = vec2d.distansq(this.current.x, others[i].x);
            if (d > 0 && d < distance * distance) {
                sumacc.add(others[i].x);
                count++;
            }
        }
        if (count > 0) {
            sumacc.div(count);
            sumacc.sub(this.current.x);
            return [this.makeSteer(sumacc), count];
        }
        return [new vec2d(0, 0), 0];
    }

    separate(others) {
        let distance = this.current.range();
        let sumacc = new vec2d(0, 0);
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            let d = vec2d.distansq(this.current.x, others[i].x);
            if (d > 0 && d < distance * distance) {
                let diff = vec2d.sub(this.current.x, others[i].x);
                diff.normalize();
                diff.div(d);
                sumacc.add(diff);
                count++;
            }
        }
        if (count > 0) {
            sumacc.div(count);
            return [this.makeSteer(sumacc), count];
        }
        return [new vec2d(0, 0), 0];
    }

    align(others) {
        let distance = 60;
        let sumacc = new vec2d(0, 0);
        let count = 0;
        for (let i = 0; i < others.length; i++) {
            let d = vec2d.distansq(this.current.x, others[i].x);
            if (d > 0 && d < distance * distance) {
                sumacc.add(others[i].v);
                count++;
            }
        }
        if (count > 0) {
            sumacc.div(count);
            return [this.makeSteer(sumacc), count];
        }
        return [new vec2d(0, 0), 0];
    }

    wander() {
        this.wanderDirection += randomlr(-0.2, 0.2);

        let wanderCircleDistance = 100;
        let wanderCircleRadius = 40;
        let wanderCircle = this.current.v.copy();
        wanderCircle.setLength(wanderCircleDistance);
        let miniCircle = vec2d.unit(this.wanderDirection + this.current.v.direction()).setLength(wanderCircleRadius);
        let location = vec2d.add(wanderCircle, miniCircle);
        return this.makeSteer(location);
    }
}