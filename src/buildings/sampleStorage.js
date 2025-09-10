const Building = require('./building');

class SampleStorage extends Building {
    static levelData = {
        1: {
            basicCapacity: {
                biomass: 450,
                hemosine: 75,
                dermalit: 75,
                nucleus: 75
            },
            additionalCapacity: {
                biomass: 900,
                hemosine: 150,
                dermalit: 150,
                nucleus: 150
            },
            additionalCapacitySlots: 1,
            upgradeCost: {
                gold: 100
            }
        },
        2: {
            basicCapacity: {
                biomass: 600,
                hemosine: 100,
                dermalit: 100,
                nucleus: 100
            },
            additionalCapacity: {
                biomass: 1350,
                hemosine: 225,
                dermalit: 225,
                nucleus: 225
            },
            additionalCapacitySlots: 1,
            upgradeCost: {
                gold: 200
            }
        },
        3: {
            basicCapacity: {
                biomass: 600,
                hemosine: 100,
                dermalit: 100,
                nucleus: 100
            },
            additionalCapacity: {
                biomass: 1800,
                hemosine: 300,
                dermalit: 300,
                nucleus: 300
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
        let capacity = structuredClone(SampleStorage.levelData[this.level].basicCapacity);
        for (let key in this.assignedSlots) {
            capacity[this.assignedSlots[key]] += SampleStorage.levelData[this.level].additionalCapacity[this.assignedSlots[key]];
        }
        return capacity;
    }
}

module.exports = SampleStorage;