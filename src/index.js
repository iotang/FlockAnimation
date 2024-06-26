let canvas = document.getElementById("MainCanvas");
let ctx = canvas.getContext("2d");

const WINDOW_WIDTH = 1600;
const WINDOW_HEIGHT = 900;
const WINDOW_BORDER = 20;
const MAX_CREATURES = 500;
const MAX_PREDATORS = 100;

canvas.width = WINDOW_WIDTH;
canvas.height = WINDOW_HEIGHT;

const CREATURE = 'CREATURE';
const PREDATOR = 'PREDATOR';
const LEVIATHAN = 'LEVIATHAN';
const TARGET = 'TARGET';
const SUPERTARGET = 'SUPERTARGET';

let FEELINGS = {};

let statistics = document.getElementById('statistics');
function renderStatistics(data) {
    val = '| ';
    for (let i in data) {
        val += i + ' : ' + data[i] + ' | ';
    }
    statistics.textContent = val;
}

window.onload = function () {

    FEELINGS[CREATURE] = {};
    FEELINGS[CREATURE][PREDATOR] = 100;
    FEELINGS[CREATURE][LEVIATHAN] = 150;

    FEELINGS[PREDATOR] = {};
    FEELINGS[PREDATOR][CREATURE] = 150;
    FEELINGS[PREDATOR][LEVIATHAN] = 250;

    FEELINGS[LEVIATHAN] = {};
    FEELINGS[LEVIATHAN][CREATURE] = 100;
    FEELINGS[LEVIATHAN][PREDATOR] = 100;

    const stage = new Stage();
    stage.makeItems({
        TARGET: TypeTarget,
        SUPERTARGET: TypeSuperTarget,
    });
    stage.makeBoids({
        CREATURE: TypeCreature,
        PREDATOR: TypePredator,
        LEVIATHAN: TypeLeviathan,
    });
    stage.spawnPopulation({
        CREATURE: 200,
        PREDATOR: 10,
        LEVIATHAN: 1,
    });

    function spawnTargets() {
        if (randomlr(1) < 0.02) addItems(stage.itemLists.TARGET, TypeTarget, 10);
        if (randomlr(1) < 0.02) addItems(stage.itemLists.SUPERTARGET, TypeSuperTarget, 2);
    }

    function populationLimit() {
        while (stage.boidLists.CREATURE.length < MAX_CREATURES / 10) {
            stage.spawnPopulation({
                CREATURE: 1
            });
        }
        while (stage.boidLists.CREATURE.length > MAX_CREATURES) {
            stage.boidLists.CREATURE.pop();
        }
        while (stage.boidLists.PREDATOR.length < 1) {
            stage.spawnPopulation({
                PREDATOR: 1
            });
        }
        while (stage.boidLists.PREDATOR.length > MAX_PREDATORS) {
            stage.boidLists.PREDATOR.pop();
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
                this.breed(stage.boidLists.CREATURE, Math.ceil(randomlr(15, 30)), MAX_CREATURES);
            }
        }
    });

    stage.makeBehaviour({
        name: PREDATOR,
        like: {
            TARGET: {
                weight: 0.2,
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
                    this.size += list[i].size / 20;
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
                this.breed(stage.boidLists.PREDATOR, 1, MAX_PREDATORS);
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
        callback: function () {
            if (this.age % 80 == 0) {
                addItem(stage.itemLists.SUPERTARGET, TypeSuperTarget, this.x.x, this.x.y);
            }
        }
    });

    canvas.addEventListener('click', function (e) {
        let clickAddType = document.getElementById('click_add').value;
        if (clickAddType == CREATURE) {
            addBoid(stage.boidLists.CREATURE, TypeCreature.setX(e.offsetX, e.offsetY).build());
        } else if (clickAddType == PREDATOR) {
            addBoid(stage.boidLists.PREDATOR, TypePredator.setX(e.offsetX, e.offsetY).build());
        } else if (clickAddType == LEVIATHAN) {
            addBoid(stage.boidLists.LEVIATHAN, TypeLeviathan.setX(e.offsetX, e.offsetY).build());
        } else if (clickAddType == TARGET) {
            addBoid(stage.itemLists.TARGET, TypeTarget.setX(e.offsetX, e.offsetY).build());
        } else if (clickAddType == SUPERTARGET) {
            addBoid(stage.itemLists.SUPERTARGET, TypeSuperTarget.setX(e.offsetX, e.offsetY).build());
        }
    })

    function animate() {
        ctx.fillStyle = `rgb(248, 248, 248)`;
        ctx.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);

        cohesionSliderValue.textContent = cohesionSlider.value;
        separateSliderValue.textContent = separateSlider.value;
        alignSliderValue.textContent = alignSlider.value;
        wanderSliderValue.textContent = wanderSlider.value;

        stage.render();
        stage.update();
        spawnTargets();
        populationLimit();

        if (showItemRangeCheckbox.checked) {
            for (let i in stage.boidLists.CREATURE) {
                stage.boidLists.CREATURE[i].renderCircle(ctx, 'green', stage.boidLists.CREATURE[i].range());
            }
            for (let i in stage.boidLists.PREDATOR) {
                stage.boidLists.PREDATOR[i].renderCircle(ctx, 'green', stage.boidLists.PREDATOR[i].range());
            }
            for (let i in stage.boidLists.LEVIATHAN) {
                stage.boidLists.LEVIATHAN[i].renderCircle(ctx, 'green', stage.boidLists.LEVIATHAN[i].range());
            }
        }
        if (showInteractRangeCheckbox.checked) {
            for (let i in stage.boidLists.CREATURE) {
                stage.boidLists.CREATURE[i].renderCircle(ctx, 'red', FEELINGS[CREATURE][PREDATOR]);
            }
            for (let i in stage.boidLists.PREDATOR) {
                stage.boidLists.PREDATOR[i].renderCircle(ctx, 'magenta', FEELINGS[PREDATOR][CREATURE]);
            }

        }
        renderStatistics({
            '一般生物': stage.boidLists.CREATURE.length,
            '捕食者': stage.boidLists.PREDATOR.length,
            '利维坦': stage.boidLists.LEVIATHAN.length,
            '目标': stage.itemLists.TARGET.length,
            '特供目标': stage.itemLists.SUPERTARGET.length,
        })

        requestAnimationFrame(animate);
    }

    animate();
};