let canvas = document.querySelector("#MainCanvas");
let ctx = canvas.getContext("2d");

let WINDOW_WIDTH = 1000;
let WINDOW_HEIGHT = 1000;
let WINDOW_BORDER = 20;
let MAX_CREATURES = 100;

canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

const CREATURE = 'CREATURE';
const TARGET = 'TARGET';

window.onload = function () {

    const stage = new Stage();
    stage.makeItems({
        TARGET: TypeTarget
    });
    stage.makeCreatures({
        CREATURE: TypeCreature
    });
    stage.spawnPopulation({
        CREATURE: 50
    });

    function spawnTargets() {
        if (randomlr(1) < 0.03) addItems(stage.itemLists.TARGET, TypeTarget, 12);
    }

    stage.makeBehaviour({
        name: CREATURE,
        like: [TARGET],
        dislike: [],
        interact: {}
    });

    function animate() {
        ctx.fillStyle = `rgb(248, 248, 248)`;
        ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        stage.render();
        stage.update();
        spawnTargets();
        requestAnimationFrame(animate);
    }

    animate();
};