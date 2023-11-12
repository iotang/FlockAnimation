class Boid {

    constructor(x, y, size, color, type = {}) {
        this.x = new vec2d(x, y);
        this.v = new vec2d(1, 0);
        this.a = new vec2d(0, 0);
        this.size = size || 5;
        this.color = color;
        this.type = type;

        this.age = 0;
        this.hp = type.maxhp || 100;
        this.maxhp = type.maxhp || 100;
        this.hpLoss = type.hpLoss || 0.1;
        this.maxVel = type.maxVel || 2;
        this.maxAcc = type.maxAcc || 0.1;
        this.maxSize = type.maxSize || 20;

        this.flock = new FlockCalculator(this);
        this.flockArgs = {
            cohesion: 0.7,
            separate: 0.9,
            align: 0.6
        };
    }

    addAcc(a) {
        this.a.add(a);
    }

    alive() {
        return this.hp > 0;
    }

    update() {
        this.age += 1;

        let anxiety = 1 - 2 * this.hp / this.maxhp;
        if (anxiety < 0) { anxiety = 0; }

        this.flockArgs.cohesion = 0.7 * (1 - anxiety);
        this.flockArgs.separate = 0.9 * (1 - anxiety);
        this.flockArgs.align = 0.6 * (1 - anxiety);

        this.a.limitLength(this.maxAcc);
        this.a.mul(1 + 10 * anxiety);
        this.v.add(this.a);
        this.v.limitLength(this.maxVel * (1 + 3 * anxiety));
        this.x.add(this.v);
        this.a.clear();

        this.hp -= this.hpLoss;
        this.hp = bound(this.hp, 0, this.maxhp);

        this.size = bound(this.size, 0, this.maxSize);
    }

    stayInStage() {
        let limit = 10;
        let target = null;

        if (this.x.x < limit) {
            target = new vec2d(this.maxVel, this.v.y);
        } else if (this.x.x > WINDOW_WIDTH - limit) {
            target = new vec2d(-this.maxVel, this.v.y);
        }
        if (this.x.y < limit) {
            target = new vec2d(this.v.x, this.maxVel);
        } else if (this.x.y > WINDOW_HEIGHT - limit) {
            target = new vec2d(this.v.x, -this.maxVel);
        }
        if (target !== null) {
            target.setLength(this.maxVel);
            let steer = vec2d.sub(target, this.v);
            steer.limitLength(this.maxAcc);
            this.addAcc(steer);
        }
    }

    makeFlockEffect(list) {
        let c = this.flock.cohesion(list);
        let s = this.flock.separate(list);
        let a = this.flock.align(list);
        c.mul(this.flockArgs.cohesion);
        s.mul(this.flockArgs.separate);
        a.mul(this.flockArgs.align);
        this.addAcc(c);
        this.addAcc(s);
        this.addAcc(a);
    }

    takeItem(list, range) {
        let closeTo = null;
        let closeDistan = Infinity;
        for (let i = 0; i < list.length; i++) {
            let distan = vec2d.distan(this.x, list[i].x);
            if (distan < this.size + 3) {
                this.hp += list[i].hpDelta;
                this.maxhp += list[i].maxhpDelta;
                this.size += list[i].sizeDelta;
                if (this.hp > this.maxhp) { this.hp = this.maxhp; }
                list.splice(i, 1);
                i--;
            } else if (distan < closeDistan && distan < range) {
                closeDistan = distan;
                closeTo = list[i];
            }
        }
        if (closeTo !== null) {
            return this.flock.seek(closeTo.x);
        }
        return new vec2d(0, 0);
    }

    makeItemEffect(list, weight) {
        let dir = this.takeItem(list, this.size * 4);
        dir.mul(weight);
        this.addAcc(dir);
    }

    makeInteractEffect(list, range, weight, callback) {
        let closeTo = null;
        let closeDistan = Infinity;
        for (let i = 0; i < list.length; i++) {
            let distan = vec2d.distan(this.x, list[i].x);
            if (distan < this.size) {
                if (callback !== undefined) {
                    callback.call(this, list, i);
                } else if (distan < closeDistan && distan < range) {
                    closeDistan = distan;
                    closeTo = list[i];
                }
            }
        }

        if (closeTo !== null) {
            this.addAcc(this.flock.seek(closeTo.x).mul(weight));
        }
    }

    render(ctx) {
        let angle = this.v.direction();

        ctx.beginPath();
        if (this.color !== undefined) {
            ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.hp / this.maxhp})`;
        }
        else {
            ctx.fillStyle = `hsl(${120 * (this.hp / this.maxhp)},50%,50%)`;
        }
        ctx.save();
        ctx.translate(this.x.x, this.x.y);
        ctx.rotate(angle);
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, -this.size + 1);
        ctx.lineTo(-this.size, this.size - 1);
        ctx.lineTo(this.size, 0);
        ctx.fill();
        ctx.restore();

        ctx.closePath();
    }
}