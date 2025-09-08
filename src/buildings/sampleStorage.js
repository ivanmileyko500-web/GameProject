const Building = require('./building');

class Storage extends Building {
    static levelData = {
        1: {
            basicCapacity: {
                biomass: 300,
                hemosine: 50,
                dermalit: 50,
                nucleus: 50
            },
            additionalCapacity: {
                biomass: 900,
                hemosine: 150,
                dermalit: 150,
                nucleus: 150
            },
            additionalCapacitySlots: 1,
            upgradeCost: {}
        },
        2: {
            basicCapacity: {
                biomass: 450,
                hemosine: 75,
                dermalit: 75,
                nucleus: 75
            },
            additionalCapacity: {
                biomass: 1350,
                hemosine: 225,
                dermalit: 225,
                nucleus: 225
            },
            additionalCapacitySlots: 1,
            upgradeCost: {
                gold: 100
            }
        },
        3: {
            basicCapacity: {
                biomass: 450,
                hemosine: 75,
                dermalit: 75,
                nucleus: 75
            },
            additionalCapacity: {
                biomass: 1350,
                hemosine: 225,
                dermalit: 225,
                nucleus: 225
            },
            additionalCapacitySlots: 2,
            upgradeCost: {
                gold: 300
            }
        },
    }

    constructor(gameState, id, level, assignedSlots) {
        super(gameState, id, level);
        this.assignedSlots = structuredClone(assignedSlots);
        this.assignedSlotsBackup = structuredClone(assignedSlots);
    }

    assignSlot(slotId, resource) {
        this.assignedSlots[slotId] = resource;
    }
    finishAssignment() {
        this.assignedSlotsBackup = structuredClone(this.assignedSlots);
    }
    backupAssignment() {
        this.assignedSlots = structuredClone(this.assignedSlotsBackup);
    }
    getCapacityData(){
        let capacity = structuredClone(Storage.levelData[this.level].basicCapacity);
        for (let key in this.assignedSlots) {
            capacity[this.assignedSlots[key]] += Storage.levelData[this.level].additionalCapacity[this.assignedSlots[key]];
        }
        return capacity;
    }
}

module.exports = Storage;