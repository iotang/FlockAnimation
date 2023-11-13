class vec2d {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    copy() {
        return new vec2d(this.x, this.y);
    }

    clear() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    negative() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }

    add(b) {
        this.x += b.x;
        this.y += b.y;
        return this;
    }

    sub(b) {
        this.x -= b.x;
        this.y -= b.y;
        return this;
    }

    mul(v) {
        this.x *= v;
        this.y *= v;
        return this;
    }

    div(v) {
        this.x /= v;
        this.y /= v;
        return this;
    }

    distan(b) {
        let dx = this.x - b.x;
        let dy = this.y - b.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    distansq(b) {
        let dx = this.x - b.x;
        let dy = this.y - b.y;
        return (dx * dx + dy * dy);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    lengthsq() {
        return (this.x * this.x + this.y * this.y);
    }

    dot(b) {
        return vec2d(this.x * b.x, this.y * b.y);
    }

    cross(b) {
        return this.x * b.y - this.y * b.x;
    }

    project(b) {
        var t = (this.x * b.x + this.y * b.y) / b.lengthsq();
        this.x = t * b.x;
        this.y = t * b.y;
        return this;
    }

    normalize() {
        let len = this.length();
        if (len > 0) {
            this.div(len);
        }
        return this;
    }

    setLength(v) {
        this.normalize();
        this.mul(v);
        return this;
    }

    limitLength(v) {
        if (this.length() > v) {
            this.setLength(v);
        }
        return this;
    }

    direction() {
        return Math.atan2(this.y, this.x);
    }

    toString() {
        return "[" + this.x + ", " + this.y + "]";
    }

    static distan(a, b) {
        return a.distan(b);
    }

    static distansq(a, b) {
        return a.distansq(b);
    }

    static add(a, b) {
        return new vec2d(a.x + b.x, a.y + b.y);
    }

    static sub(a, b) {
        return new vec2d(a.x - b.x, a.y - b.y);
    }

    static unit(r) {
        return new vec2d(Math.cos(r), Math.sin(r));
    }

    static random_unit() {
        return vec2d.unit(Math.random() * Math.PI * 2);
    }
}