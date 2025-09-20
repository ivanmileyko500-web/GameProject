const GameConstants = require('../game/gameConstants');
const databaseManager = require('../data/databaseManager');
const SampleStorage = require('../buildings/sampleStorage');
const BiomassFabricator = require('../buildings/biomassFabricator');

//TODO добавить сохранение данных в БД
class GameState {
    constructor() {
        this.databaseManager = databaseManager;
        this.dataProvider = null;
        this.entitiesToUpdate = ['resources'];
        this.buildings = {};
        this.resources = {};
        this.items = {};
    }

    async init() {
        //Получение данных зданий
        let buildingsData = await this.databaseManager.getData('buildings_data');

        //Преобразование данных для удобства использования
        let parsedBuildingsData = {};
        for (let i = 0; i < buildingsData.length; i++) {
            parsedBuildingsData[buildingsData[i].name] = JSON.parse(buildingsData[i].data);
            parsedBuildingsData[buildingsData[i].name].id = buildingsData[i].id;
            parsedBuildingsData[buildingsData[i].name].level = buildingsData[i].level;
        }

        //Инициализация зданий
        this.buildings['biomassFabricator'] = new BiomassFabricator(this, 'biomassFabricator', parsedBuildingsData['biomassFabricator'].level, parsedBuildingsData['biomassFabricator'].storedBiomass);
        if (parsedBuildingsData['sampleStorage'].isConstructed) {
            this.buildings['sampleStorage'] = new SampleStorage(this, 'sampleStorage', parsedBuildingsData['sampleStorage'].level, parsedBuildingsData['sampleStorage'].assignedSlots);
        }
        this.entitiesToUpdate = this.entitiesToUpdate.concat(Object.keys(this.buildings));

        //Инициализация ресурсов
        let resourcesData = await this.databaseManager.getData('resources_data');
        for (let i = 0; i < resourcesData.length; i++) {
            this.resources[resourcesData[i].name] = {
                count: resourcesData[i].count,
                capacity: GameConstants.basicResourcesCapacity[resourcesData[i].name],
                id: resourcesData[i].id
            };
        }
        if (this.buildings['sampleStorage']) {
            this.updateResourceCapacity();
        }

        //Инициализация предметов
        // let itemsData = await this.databaseManager.getData('items_data');
        // for (let i = 0; i < itemsData.length; i++) {
        //     this.items[itemsData[i].id] = {
        //         'id': itemsData[i].id,
        //         'inventoryId': itemsData[i].inventory_id,
        //         'slotId': itemsData[i].slot_id,
        //         'imgFileName': itemsData[i].img_file_name,
        //         'properties': JSON.parse(itemsData[i].data)
        //     }
        // }
    }

    update() {
        for (let key in this.buildings) {
            this.buildings[key].update();
        }
    }

    prepareData(entityName){
        const prepareDataMap = {
            items: () => {return this.items},
            resources: () => {
                let preparedData = {};
                for (let key in this.resources) {
                    preparedData[key] = {count: this.resources[key].count, max: this.resources[key].capacity};
                }
                return preparedData;
            },
            sampleStorage: () => {return {level: this.buildings['sampleStorage'].level, assignedSlots: this.buildings['sampleStorage'].assignedSlots, currentLevelData: SampleStorage.levelData[this.buildings['sampleStorage'].level], nextLevelData: SampleStorage.levelData[this.buildings['sampleStorage'].level + 1]}},
            biomassFabricator: () => {return {level: this.buildings['biomassFabricator'].level, storedBiomass: Math.floor(this.buildings['biomassFabricator'].storedBiomass), currentLevelData: BiomassFabricator.levelData[this.buildings['biomassFabricator'].level], nextLevelData: BiomassFabricator.levelData[this.buildings['biomassFabricator'].level + 1]}},
            buildings: () => {
                let preparedData = {};
                for (let key in this.buildings) {
                    preparedData[key] = prepareDataMap[key]();
                }
                return preparedData;
            }
        }

        return prepareDataMap[entityName]();
    }

    addResource(resourceType, amount) {
        const count = this.resources[resourceType].count + amount;
        if (this.resources[resourceType].capacity && count > this.resources[resourceType].capacity) {
            this.resources[resourceType].count = this.resources[resourceType].capacity;
        } else {
            this.resources[resourceType].count = count;
        }
    }

    takeResource(resourceType, amount) {
        this.resources[resourceType].count = Math.max(this.resources[resourceType].count - amount, 0);
    }

    callBuildingMethod(buildingName, methodName, args) {
        if (buildingName === 'sampleStorage') {
            if (methodName === 'assignSlots') {
                const resources = args[0];
                for (let i = 0; i < resources.length; i++) {
                    this.buildings['sampleStorage'].assignSlot(i + 1, resources[i]);
                }
                const resourceCapacity = this.buildings['sampleStorage'].getCapacityData();
                for (let key in this.resources) {
                    if (this.resources[key].count > resourceCapacity[key]) {
                        this.buildings['sampleStorage'].backupAssignment();
                    }
                }
                this.buildings['sampleStorage'].finishAssignment();
                this.updateResourceCapacity();
            } else if (methodName === 'upgrade') {
                this.buildings['sampleStorage'].upgrade();
                this.updateResourceCapacity();
            }
        } else {
            this.buildings[buildingName][methodName](...args);
        }
    }

    constructBuilding(buildingName) {
        const checkAndTakeResources = (buildingClassName) => {
            for (let resource in buildingClassName.levelData[1].upgradeCost) {
                if (this.resources[resource].count < buildingClassName.levelData[1].upgradeCost[resource]) {
                    return false;
                }
            }
            for (let resource in buildingClassName.levelData[1].upgradeCost) {
                this.takeResource(resource, buildingClassName.levelData[1].upgradeCost[resource]);
            }
            return true;
        }
        const constructBuildingMap = {
            sampleStorage: () => {
                if (checkAndTakeResources(SampleStorage)) {
                    this.buildings['sampleStorage'] = new SampleStorage(this, 'sampleStorage', 1, {});
                    this.entitiesToUpdate.push('sampleStorage');
                    this.updateResourceCapacity();
                }
            },
        }

        constructBuildingMap[buildingName]();
    }

    updateResourceCapacity() {
        const resourceCapacity = this.buildings['sampleStorage'].getCapacityData();
        for (let key in this.resources) {
            this.resources[key].capacity = resourceCapacity[key];
        }
    }
}

module.exports = new GameState();