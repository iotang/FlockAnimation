class BoidType {
    constructor(type) {
        this.a = new vec2d(0, 0);
        this.v = new vec2d(0, 0);
        this.type = type;
    }

    setX(x, y) {
        this.x = new vec2d(x, y);
        return this;
    }

    setSize(r) {
        this.size = r;
        return this;
    }

    setMaxSize(r) {
        this.maxSize = r;
        return this;
    }

    setMaxVel(v) {
        this.maxVel = v;
        return this;
    }

    setMaxAcc(a) {
        this.maxAcc = a;
        return this;
    }

    setColor(c) {
        this.color = c;
        return this;
    }

    setMaxHP(h) {
        this.maxhp = h;
        return this;
    }

    setHPLoss(v) {
        this.hpLoss = v;
        return this;
    }

    build() {
        return new Boid(this.x.x, this.x.y, this.size, this.color, this);
    }
}

let TypeCreature = new BoidType(CREATURE);