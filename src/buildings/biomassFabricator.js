const Building = require('./building');

class BiomassFabricator extends Building {
    static levelData = {
        1: {
            biomassPerUpdate: 1,
            maxBiomass: 360,
            upgradeCost: {
                gold: 100
            }
        },
        2: {
            biomassPerUpdate: 1.1,
            maxBiomass: 420,
            upgradeCost: {
                gold: 200
            }
        },
        3: {
            biomassPerUpdate: 1.2,
            maxBiomass: 480,
            upgradeCost: {
                gold: 300
            }
        }
    }

    constructor(gameState, id, level, storedBiomass) {
        super(gameState, id, level);
        this.storedBiomass = storedBiomass;
    }

    update() {
        this.storedBiomass += BiomassFabricator.levelData[this.level].biomassPerUpdate;
        if (this.storedBiomass > BiomassFabricator.levelData[this.level].maxBiomass) {
            this.storedBiomass = BiomassFabricator.levelData[this.level].maxBiomass;
        }
    }

    collect() {
        const collectedBiomass = Math.floor(this.storedBiomass);
        this.storedBiomass -= collectedBiomass;
        this.gameState.addResource('biomass', collectedBiomass);
    }
}

module.exports = BiomassFabricator;