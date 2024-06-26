class Stage {

    constructor() {
        this.itemTypes = {};
        this.itemLists = {};
        this.boidTypes = {};
        this.boidLists = {};
        this.behaviours = {};
    }

    makeItems(val) {
        this.itemTypes = val;
        for (const i in val) {
            this.itemLists[i] = [];
        }
    }

    makeBoids(val) {
        this.boidTypes = val;
        for (const i in val) {
            this.boidLists[i] = [];
        }
    }

    spawnBoids(list, type, num) {
        for (let i = 0; i < num; i++) {
            let x = randomlr(WINDOW_WIDTH);
            let y = randomlr(WINDOW_HEIGHT);
            addBoid(list, type.setX(x, y).build());
        }
    }

    spawnPopulation(val) {
        for (const i in val) {
            if (this.boidLists[i] !== undefined) {
                this.spawnBoids(this.boidLists[i], this.boidTypes[i], val[i]);
            }
        }
    }

    makeBehaviour(behav) {
        let list = this.boidLists[behav.name];
        if (list === undefined) {
            return;
        }

        let like = [];
        for (const i in behav.like) {
            if (this.itemLists[i] !== undefined) {
                like.push({
                    list: this.itemLists[i],
                    weight: behav.like[i].weight,
                    effect: behav.like[i].effect
                });
            }
        }
        let interact = [];
        for (const i in behav.interact) {
            if (this.boidTypes[i] !== undefined) {
                interact.push({
                    list: this.boidLists[i],
                    weight: behav.interact[i].weight,
                    range: behav.interact[i].range,
                    callback: behav.interact[i].callback
                });
            }
        }

        this.behaviours[behav.name] = {
            list: list,
            like: like,
            interact: interact,
            callback: behav.callback
        };
    }

    updateBoids(list, like, callback, setFlock) {
        for (let i = 0; i < list.length; i++) {
            if (setFlock) {
                list[i].setFlockBaseArgs({
                    cohesion: cohesionSlider.value,
                    separate: separateSlider.value,
                    align: alignSlider.value,
                    wander: wanderSlider.value,
                });
            }
            list[i].update();
            let ret = 0;
            list[i].makeFlockEffect(list);
            for (let j in like) {
                ret += list[i].makeItemEffect(like[j].list, like[j].weight, like[j].effect);
            }
            ret += list[i].stayInStage();
            if (callback !== undefined) {
                ret += callback.call(list[i], list, i);
            }
            if (ret <= 0) {
                list[i].makeWander();
            }

            if (!list[i].alive()) {
                addItem(this.itemLists.TARGET, TypeTarget, list[i].x.x, list[i].x.y);
                list.splice(i, 1);
                i--;
            }
        }
    }

    update() {
        for (const i in this.behaviours) {
            const behav = this.behaviours[i];
            this.updateBoids(behav.list, behav.like,
                (list, x) => {
                    let current = list[x];
                    let ret = 0;
                    for (let j in behav.interact) {
                        ret += current.makeInteractEffect(behav.interact[j].list, behav.interact[j].range, behav.interact[j].weight, behav.interact[j].callback);
                    }
                    if (behav.callback !== undefined) {
                        behav.callback.call(current);
                    }
                    return ret;
                },
                i === CREATURE);
        }
    }

    render() {
        for (const i in this.boidLists) {
            for (let j = 0; j < this.boidLists[i].length; j++) {
                this.boidLists[i][j].render(ctx);
            }
        }
        for (const i in this.itemLists) {
            for (let j = 0; j < this.itemLists[i].length; j++) {
                this.itemLists[i][j].render(ctx);
            }
        }
    }

}