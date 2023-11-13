let canvas = document.querySelector("#MainCanvas");
let ctx = canvas.getContext("2d");

const WINDOW_WIDTH = 1000;
const WINDOW_HEIGHT = 1000;
const WINDOW_BORDER = 20;
const MAX_CREATURES = 200;
const MAX_PREDATORS = 10;

let CREATURE_FEEL_PREDATOR = 100;
let PREDATOR_FEEL_CREATURE = 150;

canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

const CREATURE = 'CREATURE';
const PREDATOR = 'PREDATOR';
const TARGET = 'TARGET';

window.onload = function () {

    const stage = new Stage();
    stage.makeItems({
        TARGET: TypeTarget
    });
    stage.makeCreatures({
        CREATURE: TypeCreature,
        PREDATOR: TypePredator,
    });
    stage.spawnPopulation({
        CREATURE: 50,
        PREDATOR: 5,
    });

    function spawnTargets() {
        if (randomlr(1) < 0.03) addItems(stage.itemLists.TARGET, TypeTarget, 12);
    }

    function populationLimit() {
        while (stage.creatureLists.CREATURE.length > MAX_CREATURES) {
            stage.creatureLists.CREATURE.pop();
        }
        while (stage.creatureLists.PREDATOR.length > MAX_PREDATORS) {
            stage.creatureLists.PREDATOR.pop();
        }
    }

    stage.makeBehaviour({
        name: CREATURE,
        like: {
            TARGET: {
                weight: 1.0,
                effect: 1.0,
            },
        },
        interact: {
            PREDATOR: {
                weight: -10.0,
                range: CREATURE_FEEL_PREDATOR,
            }
        },
        callback: function () {
            if (this.size >= this.maxSize * 0.9) {
                this.breed(stage.creatureLists.CREATURE, 10, MAX_CREATURES);
            }
        }
    });

    stage.makeBehaviour({
        name: PREDATOR,
        like: {
            TARGET: {
                weight: 1.0,
                effect: 0.2,
            },
        },
        interact: {
            CREATURE: {
                weight: 1,
                range: PREDATOR_FEEL_CREATURE,
                callback: function (list, i) {
                    this.maxhp += list[i].size;
                    this.hp += list[i].size * 20;
                    this.size += list[i].size / 5;
                    this.maxhp = bound(this.maxhp, 1, Infinity);
                    this.hp = bound(this.hp, 0, this.maxhp);

                    list.splice(i, 1);
                }
            }
        },
        callback: function () {
            if (this.size >= this.maxSize * 0.9) {
                this.breed(stage.creatureLists.PREDATOR, 1, MAX_PREDATORS);
            }
        }
    });

    function animate() {
        ctx.fillStyle = `rgb(248, 248, 248)`;
        ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        stage.render();
        stage.update();
        spawnTargets();
        populationLimit();

        if (showItemRangeCheckbox.checked) {
            for (let i in stage.creatureLists.CREATURE) {
                stage.creatureLists.CREATURE[i].renderCircle(ctx, 'green', stage.creatureLists.CREATURE[i].size * 4);
            }
            for (let i in stage.creatureLists.PREDATOR) {
                stage.creatureLists.PREDATOR[i].renderCircle(ctx, 'green', stage.creatureLists.PREDATOR[i].size * 4);
            }
        }
        if (showInteractRangeCheckbox.checked) {
            for (let i in stage.creatureLists.CREATURE) {
                stage.creatureLists.CREATURE[i].renderCircle(ctx, 'red', CREATURE_FEEL_PREDATOR);
            }
            for (let i in stage.creatureLists.PREDATOR) {
                stage.creatureLists.PREDATOR[i].renderCircle(ctx, 'magenta', PREDATOR_FEEL_CREATURE);
            }

        }

        requestAnimationFrame(animate);
    }

    animate();
};