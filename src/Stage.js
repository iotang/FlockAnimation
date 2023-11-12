class Stage {

    constructor() {
        this.itemBuilders = {};
        this.itemLists = {};
        this.creatureBuilders = {};
        this.creatureLists = {};
        this.behaviours = {};
    }

    makeItems(val) {
        this.itemBuilders = val;
        for (const i in val) {
            this.itemLists[i] = [];
        }
    }

    makeCreatures(val) {
        this.creatureBuilders = val;
        for (const i in val) {
            this.creatureLists[i] = [];
        }
    }

    spawnCreatures(list, type, num) {
        for (let i = 0; i < num; i++) {
            addCreature(list, type);
        }
    }

    spawnPopulation(val) {
        for (const i in val) {
            if (this.creatureLists[i] !== undefined) {
                this.spawnCreatures(this.creatureLists[i], this.creatureBuilders[i], val[i]);
            }
        }
    }

    makeBehaviour(behav) {
        let list = this.creatureLists[behav.name];
        if (list === undefined) {
            return;
        }

        let like = [];
        for (const i in behav.like) {
            if (this.itemLists[behav.like[i]] !== undefined) {
                like.push(this.itemLists[behav.like[i]]);
            }
        }
        let dislike = [];
        for (const i in behav.dislike) {
            if (this.itemLists[behav.dislike[i]] !== undefined) {
                dislike.push(this.itemLists[behav.dislike[i]]);
            }
        }
        let interact = [];
        for (const i in behav.interact) {
            if (this.creatureBuilders[i] !== undefined) {
                interact.push({
                    list: this.creatureLists[i],
                    weight: behav.interact[i][0],
                    range: behav.interact[i][1],
                    callback: behav.interact[i][2]
                });
            }
        }

        this.behaviours[behav.name] = {
            list: list,
            like: like,
            dislike: dislike,
            interact: interact,
            callback: behav.callback
        };
    }

    updateCreatures(list, like, dislike, callback) {
        for (let i = 0; i < list.length; i++) {
            list[i].update();
            list[i].makeFlockEffect(list);
            for (let j in like) {
                list[i].makeItemEffect(like[j], 1);
            }
            for (let j in dislike) {
                list[i].makeItemEffect(dislike[j], -1);
            }
            list[i].stayInStage();

            if (callback !== undefined) {
                callback.call(list[i], list, i);
            }

            if (!list[i].alive()) {
                list.splice(i, 1);
                i--;
            }
        }
    }

    update() {
        for (const i in this.behaviours) {
            const behav = this.behaviours[i];
            this.updateCreatures(behav.list, behav.like, behav.dislike, (list, i) => {
                let current = list[i];
                for (let j in behav.interact) {
                    current.makeInteractEffect(j.list, j.range, j.weight, j.callback);
                }
                if (behav.callback !== undefined) {
                    behav.callback.call(current);
                }
            });
        }
    }

    render() {
        for (const i in this.creatureLists) {
            for (let j = 0; j < this.creatureLists[i].length; j++) {
                this.creatureLists[i][j].render(ctx);
            }
        }
        for (const i in this.itemLists) {
            for (let j = 0; j < this.itemLists[i].length; j++) {
                this.itemLists[i][j].render(ctx);
            }
        }
    }

}