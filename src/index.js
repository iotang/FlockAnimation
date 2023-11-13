let canvas = document.querySelector("#MainCanvas");
let ctx = canvas.getContext("2d");

const WINDOW_WIDTH = 1000;
const WINDOW_HEIGHT = 1000;
const WINDOW_BORDER = 20;
const MAX_CREATURES = 200;
const MAX_PREDATORS = 10;

let FEELINGS = {};

FEELINGS[CREATURE] = {};
FEELINGS[CREATURE][PREDATOR] = 100;
FEELINGS[CREATURE][LEVIATHAN] = 150;

FEELINGS[PREDATOR] = {};
FEELINGS[PREDATOR][CREATURE] = 150;
FEELINGS[PREDATOR][LEVIATHAN] = 250;

FEELINGS[LEVIATHAN] = {};
FEELINGS[LEVIATHAN][CREATURE] = 100;
FEELINGS[LEVIATHAN][PREDATOR] = 100;

canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

const CREATURE = 'CREATURE';
const PREDATOR = 'PREDATOR';
const LEVIATHAN = 'LEVIATHAN';
const TARGET = 'TARGET';
const SUPERTARGET = 'SUPERTARGET';

let statistics = document.getElementById('statistics');
function renderStatistics(data) {
    val = '| ';
    for (let i in data) {
        val += i + ' : ' + data[i] + ' | ';
    }
    statistics.textContent = val;
}

window.onload = function () {

    const stage = new Stage();
    stage.makeItems({
        TARGET: TypeTarget,
        SUPERTARGET: TypeSuperTarget,
    });
    stage.makeCreatures({
        CREATURE: TypeCreature,
        PREDATOR: TypePredator,
        LEVIATHAN: TypeLeviathan,
    });
    stage.spawnPopulation({
        CREATURE: 50,
        PREDATOR: 5,
        LEVIATHAN: 1,
    });

    function spawnTargets() {
        if (randomlr(1) < 0.02) addItems(stage.itemLists.TARGET, TypeTarget, 10);
        if (randomlr(1) < 0.02) addItems(stage.itemLists.SUPERTARGET, TypeSuperTarget, 2);
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
            SUPERTARGET: {
                weight: 5.0,
                effect: 1.0,
            },
        },
        interact: {
            PREDATOR: {
                weight: -10.0,
                range: FEELINGS[CREATURE][PREDATOR],
            },
            LEVIATHAN: {
                weight: -10.0,
                range: FEELINGS[CREATURE][LEVIATHAN],
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
                effect: 0.1,
            },
            SUPERTARGET: {
                weight: -1.0,
                effect: 0.0,
            },
        },
        interact: {
            CREATURE: {
                weight: 1.0,
                range: FEELINGS[PREDATOR][CREATURE],
                callback: function (list, i) {
                    this.maxhp += list[i].size;
                    this.hp += list[i].size * 10;
                    this.size += list[i].size / 10;
                    this.maxhp = bound(this.maxhp, 1, Infinity);
                    this.hp = bound(this.hp, 0, this.maxhp);

                    list.splice(i, 1);
                }
            },
            LEVIATHAN: {
                weight: -10.0,
                range: FEELINGS[PREDATOR][LEVIATHAN],
            }
        },
        callback: function () {
            if (this.size >= this.maxSize * 0.9) {
                this.breed(stage.creatureLists.PREDATOR, 1, MAX_PREDATORS);
            }
        }
    });

    stage.makeBehaviour({
        name: LEVIATHAN,
        like: {
            TARGET: {
                weight: 1.0,
                effect: 0.1,
            },
            SUPERTARGET: {
                weight: 1.0,
                effect: 0.1,
            },
        },
        interact: {
            CREATURE: {
                weight: 0.1,
                range: FEELINGS[LEVIATHAN][CREATURE],
                callback: function (list, i) {
                    this.hp += list[i].size * 10;
                    this.hp = bound(this.hp, 0, this.maxhp);

                    list.splice(i, 1);
                }
            },
            PREDATOR: {
                weight: 1.0,
                range: FEELINGS[LEVIATHAN][PREDATOR],
                callback: function (list, i) {
                    this.maxhp += list[i].size;
                    this.hp += list[i].size * 10;
                    this.size += list[i].size / 10;
                    this.maxhp = bound(this.maxhp, 1, Infinity);
                    this.hp = bound(this.hp, 0, this.maxhp);

                    list.splice(i, 1);
                }
            }
        },
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
                stage.creatureLists.CREATURE[i].renderCircle(ctx, 'green', stage.creatureLists.CREATURE[i].range());
            }
            for (let i in stage.creatureLists.PREDATOR) {
                stage.creatureLists.PREDATOR[i].renderCircle(ctx, 'green', stage.creatureLists.PREDATOR[i].range());
            }
        }
        if (showInteractRangeCheckbox.checked) {
            for (let i in stage.creatureLists.CREATURE) {
                stage.creatureLists.CREATURE[i].renderCircle(ctx, 'red', FEELINGS[CREATURE][PREDATOR]);
            }
            for (let i in stage.creatureLists.PREDATOR) {
                stage.creatureLists.PREDATOR[i].renderCircle(ctx, 'magenta', FEELINGS[PREDATOR][CREATURE]);
            }

        }
        renderStatistics({
            '一般生物': stage.creatureLists.CREATURE.length,
            '捕食者': stage.creatureLists.PREDATOR.length,
            '利维坦': stage.creatureLists.LEVIATHAN.length,
            '目标': stage.itemLists.TARGET.length,
            '特供目标': stage.itemLists.SUPERTARGET.length,
        })

        requestAnimationFrame(animate);
    }

    animate();
};