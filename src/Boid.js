class Boid {

    constructor(x, y, size, color, type = {}) {
        this.x = new vec2d(x, y);
        this.v = new vec2d(1, 0);
        this.a = new vec2d(0, 0);
        this.color = color;
        this.type = type;

        this.age = 0;
        this.hp = type.maxhp || 100;
        this.maxhp = type.maxhp || 100;
        this.hpLoss = type.hpLoss || 0.02;
        this.maxVel = type.maxVel || 2;
        this.maxAcc = type.maxAcc || 0.1;
        this.maxSize = type.maxSize || 20;
        this.size = size || type.size || (this.maxSize / 4);
        this.rangeMultiplier = type.rangeMultiplier || 4;

        this.flock = new FlockCalculator(this);
        this.flockBaseArgs = type.flockBaseArgs || {
            cohesion: 0.7,
            separate: 0.9,
            align: 0.6,
            wander: 1.0,
        };
        this.flockArgs = this.flockBaseArgs;
    }

    range() {
        return this.size * this.rangeMultiplier;
    }

    addAcc(a) {
        this.a.add(a);
    }

    alive() {
        return this.hp > 0;
    }

    setFlockBaseArgs(v) {
        this.flockBaseArgs = v;
    }

    update() {
        this.age += 1;

        let anxiety = 1 - 2 * this.hp / this.maxhp;
        if (anxiety < 0) { anxiety = 0; }

        this.flockArgs.cohesion = this.flockBaseArgs.cohesion * (1 - anxiety / 2);
        this.flockArgs.separate = this.flockBaseArgs.separate * (1 - anxiety / 2);
        this.flockArgs.align = this.flockBaseArgs.align * (1 - anxiety / 2);

        this.a.limitLength(this.maxAcc);
        this.a.mul(1 + anxiety);
        this.v.add(this.a);
        this.v.limitLength(this.maxVel * (1 + anxiety / 3));
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
            steer.mul(10);
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

    makeWander() {
        if (this.a.length() < 0.000001) {
            let w = this.flock.wander();
            w.setLength(this.maxAcc * this.flockBaseArgs.wander);
            this.addAcc(w);
        }
    }

    takeItem(list, range, effect) {
        let closeTo = null;
        let closeDistan = Infinity;
        for (let i = 0; i < list.length; i++) {
            let distan = vec2d.distan(this.x, list[i].x);
            if (distan < this.size + 3) {
                this.hp += list[i].hpDelta * effect;
                this.maxhp += list[i].maxhpDelta * effect;
                this.size += list[i].sizeDelta * effect;
                this.maxhp = bound(this.maxhp, 1, Infinity);
                this.hp = bound(this.hp, 0, this.maxhp);
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

    makeItemEffect(list, weight, effect) {
        let dir = this.takeItem(list, this.range(), effect);
        dir.mul(weight);
        this.addAcc(dir);
    }

    makeInteractEffect(list, range, weight, callback) {
        let closeTo = null;
        let closeDistan = Infinity;
        for (let i = 0; i < list.length; i++) {
            let distan = vec2d.distan(this.x, list[i].x);
            let caughtTime = 0.1 * distan / this.maxVel;
            let finalLocation = list[i].v.copy();
            finalLocation.mul(caughtTime);
            finalLocation.add(list[i].x);
            if (distan < this.size) {
                if (callback !== undefined) {
                    callback.call(this, list, i);
                }
            } else if (distan < closeDistan && distan < range) {
                closeDistan = distan;
                closeTo = finalLocation;
            }
        }

        if (closeTo !== null) {
            this.addAcc(this.flock.seek(closeTo).mul(weight));
        }
    }

    spawnChild(list, limit) {
        let x = this.x.x + randomlr(-this.size * 2, this.size * 2);
        let y = this.x.y + randomlr(-this.size * 2, this.size * 2);
        let newBoid = this.type.setX(x, y).build();
        return addBoid(list, newBoid, limit);
    }

    breed(list, count, limit) {
        if (this.size < this.maxSize * 0.9) { return; }
        let perCost = (this.size - this.type.size) / count / 2;
        for (let i = 0; i < count; i++) {
            if (this.spawnChild(list, limit)) {
                this.size -= perCost;
            }
        }
    }

    renderHP(ctx) {
        ctx.beginPath();
        ctx.save();
        ctx.font = '10px';
        ctx.fillStyle = 'gray';
        ctx.fillText(Math.ceil(this.hp), this.x.x - this.size, this.x.y - this.size);
        ctx.fill();
        ctx.restore();
        ctx.closePath();
    }

    renderSize(ctx) {
        ctx.beginPath();
        ctx.save();
        ctx.font = '10px';
        ctx.fillStyle = 'gray';
        ctx.fillText(Math.ceil(this.size), this.x.x - this.size, this.x.y);
        ctx.fill();
        ctx.restore();
        ctx.closePath();
    }

    renderAge(ctx) {
        ctx.beginPath();
        ctx.save();
        ctx.font = '10px';
        ctx.fillStyle = 'gray';
        ctx.fillText(Math.ceil(this.age), this.x.x - this.size, this.x.y + this.size);
        ctx.fill();
        ctx.restore();
        ctx.closePath();
    }

    renderCircle(ctx, color, radius) {
        ctx.beginPath();
        ctx.save();
        ctx.strokeStyle = color;
        ctx.arc(this.x.x, this.x.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.closePath();
    }

    render(ctx) {
        let angle = this.v.direction();

        ctx.beginPath();
        if (this.color !== undefined) {
            ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.hp / this.maxhp})`;
        }
        else {
            ctx.fillStyle = `hsl(${120 * (this.hp / this.maxhp)}, 50%, 50%)`;
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

        if (showHPCheckbox.checked) {
            this.renderHP(ctx);
        }
        if (showSizeCheckbox.checked) {
            this.renderSize(ctx);
        }
        if (showAgeCheckbox.checked) {
            this.renderAge(ctx);
        }
    }
}