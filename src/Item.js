class Item {
    constructor(x, y, size, type = {}) {
        this.x = new vec2d(x, y);
        this.size = size || 2;
        this.type = type;

        this.hpDelta = type.hpDelta || 50;
        this.maxhpDelta = type.maxhpDelta || 1;
        this.sizeDelta = type.sizeDelta || 0.05;
        this.color = type.color || [0, 0, 0];
    }

    render(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},1)`;
        ctx.fillRect(this.x.x, this.x.y, this.size * 2, this.size * 2);
        ctx.fill();
        ctx.closePath();
    }
}