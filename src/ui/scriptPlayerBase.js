const { ipcRenderer } = require('electron');
import {InventoryDragManager, Inventory, Item} from './modules/DragAndDrop.js';
import InteractiveAreaCreationTools from './modules/InteractiveAreaCreationTools.js';
import MouseleaveTracker from './modules/MouseleaveTracker.js';
import genWebElementGenerator from './modules/genWebElementGenerator.js';

// === Вспомогательные классы ===

class MultiInventory {
    static switchButtonBackgroundColor = 'grey';
    static switchButtonBackgroundColorActive = 'darkgrey';
    static switchButtonTextColor = 'aliceblue';
    static switchButtonTextColorActive = 'white';

    static createSwitchButton(text) {
        const switchButton = document.createElement('div');
        switchButton.style.width = '80px';
        switchButton.style.height = '40px';
        switchButton.style.cursor = 'pointer';
        switchButton.style.borderRadius = '8px';
        switchButton.style.backgroundColor = this.switchButtonBackgroundColor;
        switchButton.style.display = 'flex';
        switchButton.style.justifyContent = 'center';
        switchButton.style.alignItems = 'center';
        switchButton.style.color = this.switchButtonTextColor;
        switchButton.style.transition = 'background-color 0.3s ease-in-out, color 0.3s ease-in-out';
        switchButton.textContent = text;
        switchButton.dataset.type = 'switchButton';
        return switchButton;
    }

    constructor() {
        this.container = document.createElement('div');
        this.switchButtonsContainer = document.createElement('div');
        this.inventories = {};
        this.switchButtons = {};
        this.currentInventoryId = null;

        this.init();
    }

    init() {
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';

        this.switchButtonsContainer.style.display = 'flex';
        this.switchButtonsContainer.style.justifyContent = 'space-around';
        this.switchButtonsContainer.style.alignItems = 'center';
        this.switchButtonsContainer.style.width = '100%';
        this.switchButtonsContainer.style.height = '100px';
        this.switchButtonsContainer.style.backgroundColor = 'rgb(202, 198, 176)';

        this.switchButtonsContainer.addEventListener('click', (event) => {
            if (event.target.dataset.type === 'switchButton') {
                this.removeCurrentInventory();
                this.currentInventoryId = event.target.dataset.inventoryId;
                this.renderCurrentInventory();
            }
        });

        this.container.appendChild(this.switchButtonsContainer);
    }

    addInventory(switchButtonText, inventory) {
        this.inventories[inventory.id] = inventory;
        this.switchButtons[inventory.id] = MultiInventory.createSwitchButton(switchButtonText);
        this.switchButtons[inventory.id].dataset.inventoryId = inventory.id;
        this.switchButtonsContainer.appendChild(this.switchButtons[inventory.id]);
    }

    renderCurrentInventory() {
        this.switchButtons[this.currentInventoryId].style.backgroundColor = MultiInventory.switchButtonBackgroundColorActive;
        this.switchButtons[this.currentInventoryId].style.color = MultiInventory.switchButtonTextColorActive;
        this.inventories[this.currentInventoryId].render(this.container);
    }

    removeCurrentInventory() {
        this.switchButtons[this.currentInventoryId].style.backgroundColor = MultiInventory.switchButtonBackgroundColor;
        this.switchButtons[this.currentInventoryId].style.color = MultiInventory.switchButtonTextColor;
        this.inventories[this.currentInventoryId].remove();
    }

    render(container) {
        const inventoryIds = Object.keys(this.inventories)
        if (inventoryIds.length > 0) {
            this.currentInventoryId = inventoryIds[0];
        } else {
            throw new Error('Can\'t render MultiInventory because there are no inventories');
        }
        container.appendChild(this.container);
        this.renderCurrentInventory();
    }
}

class ViewSwitcher {
    constructor(renderContainer) {
        this.renderContainer = renderContainer;
        this.currentViewIndex = 0;
        this.isRendered = false;
        this.views = [];
    }

    addView(view) {
        this.views.push(view);
    }

    removeView(index) {
        if (index === this.currentViewIndex) {
            if (this.isRendered) {
                this.switchView()
            } else {
                this.currentViewIndex = 0;
            }
        }
        this.views[index].remove();
        this.views.splice(index, 1);
    }

    switchView(index) {
        if (!index) {
            index = (this.currentViewIndex + 1) % this.views.length;
        }
        if (this.isRendered) {
            this.views[this.currentViewIndex].remove();
            this.currentViewIndex = index;
            this.renderContainer.appendChild(this.views[this.currentViewIndex]);
        } else {
            this.currentViewIndex = index;
        }
    }

    render() {
        this.renderContainer.appendChild(this.views[this.currentViewIndex]);
        this.isRendered = true;
    }

    remove() {
        this.views[this.currentViewIndex].remove();
        this.isRendered = false;
    }
}

class BuildingManager extends InteractiveAreaCreationTools {
    constructor(viewSwitcher, gridSize, buildingsUiData) {
        super();
        this.viewSwitcher = viewSwitcher;
        this.gridSize = gridSize;
        this.buildings = {};
        this.buildingContainers = {};

        this.init(buildingsUiData);
    }

    init(buildingsUiData) {
        function createGrid(rows, cols) {
            const grid = document.createElement('div');
            grid.style.width = '100%';
            grid.style.height = '100%';
            grid.style.display = 'grid';
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
            grid.style.gap = '10px';
            grid.style.padding = '10px';
            return grid;
        }

        const grid = createGrid(this.gridSize[0], this.gridSize[1]);
        for (let [buildingName, buildingImagePath] of buildingsUiData) {
            const buildingContainer = BuildingManager.createInteractiveContainer('div');
            buildingContainer.dataset.buildingName = buildingName;
            buildingContainer.style.width = '100%';
            buildingContainer.style.height = '100%';
            buildingContainer.style.backgroundImage = `url(${buildingImagePath})`;
            buildingContainer.style.backgroundBlendMode = 'multiply';
            buildingContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            buildingContainer.style.backgroundSize = 'cover';
            buildingContainer.style.backgroundPosition = 'center';
            this.buildingContainers[buildingName] = buildingContainer;
            grid.appendChild(buildingContainer);   
        }

        const interactiveGrid = BuildingManager.createInteractiveArea(grid);
        interactiveGrid.clickCallback = (element) => {
            if (element.dataset.buildingName) {
                if (this.buildings[element.dataset.buildingName]) {
                    this.displayBuildingInterface(element.dataset.buildingName);
                } else {
                    ipcRenderer.send('constructBuilding', element.dataset.buildingName);
                }
            }
        };
        //TODO добавить вывод и скрытие описания
        interactiveGrid.focusCallback = (element) => {};
        interactiveGrid.unfocusCallback = (element) => {};
        
        this.viewSwitcher.addView(interactiveGrid.webElement);
        this.viewSwitcher.render();
    }

    addBuilding(building) {
        building.returnCallback = () => this.displayBuildingsGrid();
        this.buildings[building.buildingName] = building;
        this.buildingContainers[building.buildingName].appendChild(building.previewUI);
    }

    displayBuildingInterface(buildingName) {
        this.viewSwitcher.addView(this.buildings[buildingName].interfaceUI);
        this.viewSwitcher.switchView();
    }
        
    displayBuildingsGrid() {
        this.viewSwitcher.removeView(1);
    }

    updateAll(data) {
        for (let buildingName in this.buildings) {
            this.buildings[buildingName].update(data[buildingName]);
        }
    }

    updateTarget(buildingName, data) {
        this.buildings[buildingName].update(data);
    }
}

// === Классы зданий ===

class Building {
    constructor(buildingName, data, previewImagePath) {
        this.buildingName = buildingName;
        this.data = data;
        this.previewUI = document.createElement('div');
        this.interfaceUI = document.createElement('div');
        this.upgradeButton = document.createElement('button');
        this.callMethod = (methodName, args = []) => {
            ipcRenderer.send('callBuildingMethod', this.buildingName, methodName, args);
        };
        this.returnCallback = () => {};

        this.init(previewImagePath);
    }

    init(previewImagePath) {
        this.previewUI.style.pointerEvents = 'none';
        this.previewUI.style.width = '100%';
        this.previewUI.style.height = '100%';
        this.previewUI.style.backgroundColor = 'white';
        this.previewUI.style.display = 'flex';
        this.previewUI.style.justifyContent = 'center';
        this.previewUI.style.alignItems = 'center';
        this.previewUI.style.backgroundImage = `url(${previewImagePath})`;
        this.previewUI.style.backgroundSize = 'cover';
        this.previewUI.style.backgroundPosition = 'center';

        this.interfaceUI.style.width = '100%';
        this.interfaceUI.style.height = '100%';
        this.interfaceUI.style.backgroundColor = 'red';
        this.interfaceUI.style.display = 'flex';
        this.interfaceUI.style.flexDirection = 'column';

        this.upgradeButton.textContent = 'Upgrade';
        this.upgradeButton.type = 'button';
        this.upgradeButton.style.width = '80px';
        this.upgradeButton.style.height = '40px';
        this.upgradeButton.style.backgroundColor = 'gray';
        this.upgradeButton.style.color = 'aliceblue';
        this.upgradeButton.addEventListener('click', () => {
            this.callMethod('upgrade');
        })

        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return';
        returnButton.type = 'button';
        returnButton.style.width = '80px';
        returnButton.style.height = '40px';
        returnButton.style.backgroundColor = 'gray';
        returnButton.style.color = 'aliceblue';

        returnButton.addEventListener('click', () => {
            this.returnCallback();
        });
        this.interfaceUI.appendChild(returnButton);
    }
}

class SampleStorage extends Building {
    constructor(data, previewImagePath) {
        super('sampleStorage', data, previewImagePath);
        this.storageSlotsContainer = document.createElement("div");
        this.storageSlots = [];

        this.setupInterface();
    }

    updateDynamic(elementName, data = this.data) {
        const updateDynamicMap = {
            storageSlots: () => {
                while (this.storageSlotsContainer.firstChild) {
                    this.storageSlotsContainer.removeChild(this.storageSlotsContainer.firstChild);
                }
                this.storageSlots = [];

                const resourceTypes = Object.keys(data.currentLevelData.basicCapacity);
                for (let i = 0; i < data.currentLevelData.additionalCapacitySlots; i++) {
                    const slot = document.createElement("select");
                    this.storageSlots.push(slot);
                    slot.style.width = "120px";
                    slot.style.height = "40px";
                    const emptyOption = document.createElement("option");
                    emptyOption.value = "";
                    emptyOption.innerHTML = "";
                    slot.appendChild(emptyOption);
                    for (let i = 0; i < resourceTypes.length; i++) {
                        const option = document.createElement("option");
                        option.value = resourceTypes[i];
                        option.innerHTML = resourceTypes[i];
                        slot.appendChild(option);
                    }
                    if (data.assignedSlots[i + 1]) {
                        slot.value = data.assignedSlots[i + 1];
                    }
                    this.storageSlotsContainer.appendChild(slot);
                }
            }
        }

        updateDynamicMap[elementName]();
    }

    setupInterface() {
        if (this.data.nextLevelData) this.interfaceUI.appendChild(this.upgradeButton);

        this.updateDynamic("storageSlots");
        this.interfaceUI.appendChild(this.storageSlotsContainer);

        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.innerHTML = "Save";
        saveButton.style.width = "80px";
        saveButton.style.height = "40px";
        saveButton.style.backgroundColor = "gray";
        saveButton.style.color = "aliceblue";
        saveButton.dataset.action = "assignSlots";
        saveButton.addEventListener("click", () => {
            const slotValues = this.storageSlots.map((slot) => slot.value);
            this.callMethod("assignSlots", [slotValues]);
        });
        this.interfaceUI.appendChild(saveButton);
    }

    update(data) {
        if (this.data.nextLevelData && !data.nextLevelData) {
            this.upgradeButton.remove();
        }
        if (this.data.currentLevelData.additionalCapacitySlots !== data.currentLevelData.additionalCapacitySlots) {
            this.updateDynamic("storageSlots", data);
        }
        this.data = data;
    }
}

class BiomassFabricator extends Building {
    constructor(data, previewImagePath) {
        super('biomassFabricator', data, previewImagePath);
        this.biomassCounter = document.createElement('p');

        this.setupInterface();
    }

    setupInterface() {
        if (this.data.nextLevelData) this.interfaceUI.appendChild(this.upgradeButton);
        this.interfaceUI.appendChild(this.biomassCounter);

        const collectButton = document.createElement("button");
        collectButton.type = "button";
        collectButton.innerHTML = "Collect";
        collectButton.style.width = "80px";
        collectButton.style.height = "40px";
        collectButton.style.backgroundColor = "gray";
        collectButton.style.color = "aliceblue";
        collectButton.dataset.action = "collect";
        collectButton.addEventListener("click", () => {
            this.callMethod("collect");
        });
        this.interfaceUI.appendChild(collectButton);
    }

    update(data) {
        if (this.data.nextLevelData && !data.nextLevelData) {
            this.upgradeButton.remove();
        }
        this.biomassCounter.textContent = `${data.storedBiomass}/${data.currentLevelData.maxBiomass}`;
        this.data = data;
    }
}

class MutantUtilizer extends Building {}
class GeneticDisassembler extends Building {}
class GeneticWorkbench extends Building {}
class SponsorBranch extends Building {}
class MutantCapsule extends Building {}
class DNARegenerator extends Building {}
class MidasMachine extends Building {}
    
// === Подготовка ресурсов ===

// TODO сделать финальный вариант графики, вынести в html css
const resourcesContainer = document.createElement('div');
resourcesContainer.style.width = '100%';
resourcesContainer.style.height = '100%';
resourcesContainer.style.display = 'grid';
resourcesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
resourcesContainer.style.gridTemplateRows = 'repeat(2, 1fr)';
resourcesContainer.style.gap = '10px';
resourcesContainer.style.padding = '10px';

const resourcesHtml = {};
resourcesHtml.gold = document.createElement('div');
resourcesHtml.gold.style.color = 'rgb(255, 215, 0)';
resourcesHtml.glory = document.createElement('div');
resourcesHtml.glory.style.color = 'rgb(250, 240, 180)';
resourcesHtml.biomass = document.createElement('div');
resourcesHtml.biomass.style.color = 'rgb(140, 60, 190)';
resourcesHtml.hemosine = document.createElement('div');
resourcesHtml.hemosine.style.color = 'rgb(178, 34, 55)';
resourcesHtml.dermalit = document.createElement('div');
resourcesHtml.dermalit.style.color = 'rgb(34, 150, 80)';
resourcesHtml.nucleus = document.createElement('div');
resourcesHtml.nucleus.style.color = 'rgb(40, 90, 180)';
for (let resourceName in resourcesHtml) {
    resourcesContainer.appendChild(resourcesHtml[resourceName]);
    resourcesHtml[resourceName].style.width = '100%';
    resourcesHtml[resourceName].style.height = '100%';
    resourcesHtml[resourceName].style.backgroundColor = 'white';
    resourcesHtml[resourceName].style.display = 'flex';
    resourcesHtml[resourceName].style.justifyContent = 'center';
    resourcesHtml[resourceName].style.alignItems = 'center';
}

const resources = {
    resourcesContainer: resourcesContainer,
    resourcesHtml: resourcesHtml,

    render(container) {
        container.appendChild(this.resourcesContainer);
    },
    setResource(resourceName, count, max = null) {
        if (max) {
            this.resourcesHtml[resourceName].textContent = `${count}/${max}`; 
        } else {
            this.resourcesHtml[resourceName].textContent = count; 
        }
    },
    update(resourcesData) {
        for (const resource in resourcesData) {
            this.setResource(resource, resourcesData[resource]['count'], resourcesData[resource]['max']);
        }
    }
}

resources.render(document.getElementById('column1-container2'));

// === Подготовка объекта загрузки окна ===

const windowLoading = {
    isContentLoaded: false,
    isWindowLoaded: false,
    isLoadingFinished: false,

    contentLoaded() {
        this.isContentLoaded = true;
        this.checkIsLoadingFinished();
    },

    windowLoaded() {
        this.isWindowLoaded = true;
        this.checkIsLoadingFinished();
    },

    checkIsLoadingFinished() {
        if (this.isContentLoaded && this.isWindowLoaded) {
            this.loadingFinished = true;
        }
    }
}

// === Подготовка инвентарей ===

const slotExample = document.createElement('div');
slotExample.style.width = '28px';
slotExample.style.height = '28px';
slotExample.style.backgroundImage = 'url("images/slot.png")';
slotExample.style.padding = '6px';
Inventory.setVisualParams({
    slotExample: slotExample
});
const manager = InventoryDragManager.getInstance('mousedown');
const genomContainer = document.getElementById('column2');

const globalInventoryMesh = Inventory.createInventoryUI(
    14, 7, 
);
const globalInventory = new Inventory(
    manager, 
    globalInventoryMesh,
    {
        id: 'global',
        dropRequestConditionCallback: (item) => {
            if (item.gameData.type !== 'gen') {
                return false;
            } else {
                return true;
            }
        },
        onItemSlotChanged: (item, newSlotId) => {
            ipcRenderer.send('moveItem', 'playerBase', item.id, 'global', newSlotId);
        },
        onDropItem: (item, newSlotId) => {
            ipcRenderer.send('moveItem', 'playerBase', item.id, 'global', newSlotId);
        },
    }
);

const invMesh2 = Inventory.createInventoryUI(
    15, 7, 
);
const inventory2 = new Inventory(
    manager, 
    invMesh2,
    {
        id: 'genProperties',
        dropRequestConditionCallback: (item) => {
            if (item.gameData.type !== 'property') {
                return false;
            } else {
                return true;
            }
        },
        onItemSlotChanged: (item, newSlotId) => {
            ipcRenderer.send('moveItem', 'playerBase', item.id, 'genProperties', newSlotId);
        },
        onDropItem: (item, newSlotId) => {
            ipcRenderer.send('moveItem', 'playerBase', item.id, 'genProperties', newSlotId);
        },
    }
);
const multiInventory = new MultiInventory();
multiInventory.addInventory('Inventory 1', globalInventory);
multiInventory.addInventory('Inventory 2', inventory2);
multiInventory.render(genomContainer);

// === Подготовка зданий ===

const buildingNames = [
    'mutantUtilizer', 
    'biomassFabricator', 
    'geneticDisassembler', 
    'geneticWorkbench', 
    'sponsorBranch', 
    'sampleStorage', 
    'mutantCapsule', 
    'DNARegenerator', 
    'midasMachine'
];
const buildingImagesPaths = [
    'images/placeholder.png', 
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png',
    'images/placeholder.png'
]
const buildingsUiData = new Map(buildingNames.map((buildingName, i) => [buildingName, buildingImagesPaths[i]]));
const buildingClasses = {
    mutantUtilizer: MutantUtilizer,
    biomassFabricator: BiomassFabricator,
    geneticDisassembler: GeneticDisassembler,
    geneticWorkbench: GeneticWorkbench,
    sponsorBranch: SponsorBranch,
    sampleStorage: SampleStorage,
    mutantCapsule: MutantCapsule,
    DNARegenerator: DNARegenerator,
    midasMachine: MidasMachine
};

BuildingManager.useCustomMouseleaveTracker(MouseleaveTracker)
const viewSwitcher = new ViewSwitcher(document.getElementById('column3'));
const buildingManager = new BuildingManager(viewSwitcher, [3, 3], buildingsUiData);

// === События ===

ipcRenderer.on('moveItem', (event, props) => {
    if (props.oldInventoryId === props.item.inventoryId) {
        if (props.item.inventoryId === 'global') { //Перемещение внутри глобального инвентаря
            manager.moveItem(props.item.id, props.item.inventoryId, props.item.slotId);
        }
    } else {
        if (props.item.inventoryId === 'global') { //Перемещение в глобальный инвентарь
            if (!manager.getItem(props.item.id)) {
                const item = new Item (
                    genWebElementGenerator(),
                    props.item.id,
                    props.item.inventoryId,
                    props.item.slotId,
                    props.item.gameData
                )
                manager.registerItem(item);
            }
        } else if (props.oldInventoryId === 'global') { //Перемещение из глобального инвентаря
            if (manager.getItem(props.item.id)) {
                manager.deleteItem(props.item.id);
            }
        }
    }
});

ipcRenderer.on('updateAll', (event, data) => {
    if (windowLoading.isLoadingFinished) {
        buildingManager.updateAll(data.buildings);
        resources.update(data.resources);
    }
});

ipcRenderer.on('updateTarget', (event, data) => {
    buildingManager.updateTarget(data.buildingName, data[data.buildingName]);
    resources.update(data.resources);
});

ipcRenderer.on('constructBuilding', (event, data) => {
    buildingManager.addBuilding(new buildingClasses[data.buildingName](data[data.buildingName], buildingsUiData.get(data.buildingName)));
    resources.update(data.resources);
});

ipcRenderer.invoke('fetchGameData', 'playerBase').then(data => {
    //Инициализация ресурсов
    const resourcesData = data.resources;
    resources.update(resourcesData);

    //Инициализация зданий
    const buildingsData = data.buildings;
    for (let buildingName in buildingsData) {
        buildingManager.addBuilding(new buildingClasses[buildingName](buildingsData[buildingName], buildingsUiData.get(buildingName)));
    }

    //Инициализация предметов
    const itemsData = data.items;
    for (let itemId in itemsData) {
        const item = new Item (
            genWebElementGenerator(),
            itemId,
            itemsData[itemId].inventoryId,
            itemsData[itemId].slotId,
            itemsData[itemId].gameData
        )
        manager.registerItem(item);
    }

    //Завершение загрузки
    windowLoading.contentLoaded();
});

window.onload = () => {
    windowLoading.windowLoaded();
}