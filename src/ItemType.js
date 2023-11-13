class ItemType {
    constructor(type) {
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

    setColor(c) {
        this.color = c;
        return this;
    }

    setHPDelta(h) {
        this.hpDelta = h;
        return this;
    }

    setMaxHPDelta(h) {
        this.maxhpDelta = h;
        return this;
    }

    setSizeDelta(s) {
        this.sizeDelta = s;
        return this;
    }

    build() {
        return new Item(this.x.x, this.x.y, this.size, this);
    }
}

let TypeTarget = new ItemType(TARGET)
    .setHPDelta(50)
    .setMaxHPDelta(1)
    .setSizeDelta(0.1)
    .setColor([0, 0, 0])
    .setSize(2);

let TypeSuperTarget = new ItemType(TARGET)
    .setHPDelta(100)
    .setMaxHPDelta(2)
    .setSizeDelta(1)
    .setColor([0, 0, 255])
    .setSize(4);