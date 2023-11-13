let showHPCheckbox = document.getElementById('show_hp');
let showSizeCheckbox = document.getElementById('show_size');
let showAgeCheckbox = document.getElementById('show_age');
let showItemRangeCheckbox = document.getElementById('show_item_range');
let showInteractRangeCheckbox = document.getElementById('show_interact_range');

function randomlr(l, r) {
    if (r === undefined) return Math.random() * l;
    return l + Math.random() * r;
}

function bound(v, l, r) {
    if (v > r) { return r; }
    if (v < l) { return l; }
    return v;
}

function outsideStage(x, y, distan) {
    if (x < distan || x > WINDOW_WIDTH - distan) {
        return true;
    }
    if (y < distan || y > WINDOW_HEIGHT - distan) {
        return true;
    }
    return false;
}

function addBoid(list, boid, limit) {
    if (limit === undefined || list.length < limit) {
        list.push(boid);
        return 1;
    }
    return 0;
}

function addItem(list, type, fx, fy) {
    let x = fx;
    let y = fy;
    if (x == undefined && y == undefined) {
        x = randomlr(WINDOW_WIDTH);
        y = randomlr(WINDOW_HEIGHT);
        while (outsideStage(x, y, WINDOW_BORDER)) {
            x = randomlr(WINDOW_WIDTH);
            y = randomlr(WINDOW_HEIGHT);
        }
    }
    list.push(type.setX(x, y).build());
}

function addItems(list, type, num) {
    for (let i = 0; i < num; i++) {
        addItem(list, type);
    }
}