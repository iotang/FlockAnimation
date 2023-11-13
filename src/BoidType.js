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

    setFlockBaseArgs(a) {
        this.flockBaseArgs = a;
        return this;
    }

    setRangeMultiplier(r) {
        this.rangeMultiplier = r;
        return this;
    }

    build() {
        return new Boid(this.x.x, this.x.y, this.size, this.color, this);
    }
}

let TypeCreature = new BoidType(CREATURE)
    .setSize(5)
    .setMaxSize(15)
    .setMaxHP(100)
    .setHPLoss(0.01)
    .setMaxVel(2.0)
    .setMaxAcc(0.10)
    .setRangeMultiplier(6);

let TypePredator = new BoidType(PREDATOR)
    .setSize(10)
    .setMaxSize(20)
    .setColor([255, 0, 255])
    .setMaxHP(100)
    .setHPLoss(0.1)
    .setMaxVel(2.2)
    .setMaxAcc(0.11)
    .setRangeMultiplier(4)
    .setFlockBaseArgs({
        cohesion: 0.0,
        separate: 10.0,
        align: 0.0
    });

let TypeLeviathan = new BoidType(LEVIATHAN)
    .setSize(80)
    .setMaxSize(90)
    .setColor([127, 0, 255])
    .setMaxHP(2000)
    .setHPLoss(0.01)
    .setMaxVel(0.4)
    .setMaxAcc(0.03)
    .setRangeMultiplier(2)
    .setFlockBaseArgs({
        cohesion: -1.0,
        separate: 1.0,
        align: 0.0
    });