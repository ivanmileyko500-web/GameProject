class Building {
    constructor (gameState, id, level) {
        this.gameState = gameState;
        this.id = id;
        this.level = level;
    }

    upgrade() {
        const nextLevel = this.level + 1;
        const upgradeCost = this.constructor.levelData[nextLevel].upgradeCost;

        for (const [resourceType, cost] of Object.entries(upgradeCost)) {
            if (this.gameState.resources[resourceType]?.count < cost) {
                return;
            }
        }

        for (const [resourceType, cost] of Object.entries(upgradeCost)) {
            this.gameState.takeResource(resourceType, cost);
        }

        this.level = nextLevel;
    }
    update() {
        return;
    }
}

module.exports = Building;