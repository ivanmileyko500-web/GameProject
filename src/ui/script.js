import {InventoryDragManager, Inventory, Item} from './DragAndDrop.js';
import InteractiveAreaCreationTools from './InteractiveAreaCreationTools.js';

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
    setResource(resourceName, count) {
        this.resourcesHtml[resourceName].textContent = count;
    }
}

resources.setResource('gold', 100);
resources.setResource('glory', 15);
resources.setResource('biomass', 300);
resources.setResource('hemosine', 70);
resources.setResource('dermalit', 120);
resources.setResource('nucleus', 10);
resources.render(document.getElementById('column1-container2'));

const slotExample = document.createElement('div');
slotExample.style.width = '28px';
slotExample.style.height = '28px';
slotExample.style.backgroundImage = 'url("slot.png")';
slotExample.style.padding = '6px';

const manager = InventoryDragManager.getInstance('mousedown');
const genomContainer = document.getElementById('column2');

const invMesh1 = Inventory.createInventoryUI(14, 7, slotExample);
const inventory1 = new Inventory(manager, invMesh1);
const invMesh2 = Inventory.createInventoryUI(15, 7, slotExample);
const inventory2 = new Inventory(manager, invMesh2);
const multiInventory = new MultiInventory();
multiInventory.addInventory('Inventory 1', inventory1);
multiInventory.addInventory('Inventory 2', inventory2);
multiInventory.render(genomContainer);

class BuildingManager extends InteractiveAreaCreationTools{
    static createBasicBuilding(buildingName) {
        const building = {
            previewUI: InteractiveAreaCreationTools.createInteractiveContainer('div'),
            interfaceUI: document.createElement('div'),
            removeUpgradeButton: () => {},
            upgradeCallback: () => {},
            returnCallback: () => {}
        }

        building.previewUI.dataset.buildingName = buildingName;
        building.previewUI.style.width = '100%';
        building.previewUI.style.height = '100%';
        building.previewUI.style.backgroundColor = 'white';
        building.previewUI.style.display = 'flex';
        building.previewUI.style.justifyContent = 'center';
        building.previewUI.style.alignItems = 'center';

        building.interfaceUI.style.width = '100%';
        building.interfaceUI.style.height = '100%';
        building.interfaceUI.style.backgroundColor = 'red';
        building.interfaceUI.style.display = 'flex';
        building.interfaceUI.style.justifyContent = 'center';
        building.interfaceUI.style.alignItems = 'center';

        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return';
        returnButton.type = 'button';
        returnButton.dataset.action = 'return';
        returnButton.style.width = '80px';
        returnButton.style.height = '40px';
        returnButton.style.backgroundColor = 'gray';
        returnButton.style.color = 'aliceblue';

        const upgradeButton = document.createElement('button');
        upgradeButton.textContent = 'Upgrade';
        upgradeButton.type = 'button';
        upgradeButton.dataset.action = 'upgrade';
        upgradeButton.style.width = '80px';
        upgradeButton.style.height = '40px';
        upgradeButton.style.backgroundColor = 'gray';
        upgradeButton.style.color = 'aliceblue';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.width = '200px';
        buttonsContainer.style.height = '100px';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.justifyContent = 'space-between';
        buttonsContainer.appendChild(returnButton);
        buttonsContainer.appendChild(upgradeButton);
        building.interfaceUI.appendChild(buttonsContainer);

        buttonsContainer.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'return') building.returnCallback();
            if (e.target.dataset.action === 'upgrade') building.upgradeCallback();
        });

        building.removeUpgradeButton = () => {
            upgradeButton.remove();
        }

        return building;
    }

    constructor() {
        super();

        this.renderContainer;
        this.buildingsPreviewInteractiveArea;
        this.buildingPreviewUIContainers = {};
        this.buildings = {};

        this.init();
    }

    init() {
        const buildingsContainer = document.createElement('div');
        buildingsContainer.style.width = '100%';
        buildingsContainer.style.height = '100%';
        buildingsContainer.style.display = 'grid';
        buildingsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        buildingsContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
        buildingsContainer.style.gap = '25px';
        buildingsContainer.style.padding = '25px';
        
        const buildingNames = ['mutantUtilizer', 'biomassFabricator', 'geneticDisassembler', 'geneticWorkbench', 'sponsorBranch', 'sampleStorage', 'mutantCapsule', 'DNARegenerator', 'midasMachine'];
        for (let buildingName of buildingNames) {
            this.buildingPreviewUIContainers[buildingName] = document.createElement('div');
            this.buildingPreviewUIContainers[buildingName].style.width = '100%';
            this.buildingPreviewUIContainers[buildingName].style.height = '100%';
            buildingsContainer.appendChild(this.buildingPreviewUIContainers[buildingName]);

            this.buildings[buildingName] = BuildingManager.createBasicBuilding(buildingName);
            this.buildings[buildingName].previewUI.textContent = buildingName; //TODO убрать, добавить картинку
            this.buildings[buildingName].upgradeCallback = () => {} //TODO добавить логику улучшения
            this.buildings[buildingName].returnCallback = () => { 
                this.displayBuildingsPreviewUI();
            }
            this.buildingPreviewUIContainers[buildingName].appendChild(this.buildings[buildingName].previewUI);
        }

        this.buildingsPreviewInteractiveArea = InteractiveAreaCreationTools.createInteractiveArea(buildingsContainer);
        this.buildingsPreviewInteractiveArea.focusCallback = (element) => {} //TODO добавить вывод описания
        this.buildingsPreviewInteractiveArea.clickCallback = (element) => {this.displayBuildingInterfaceUI(element.dataset.buildingName)}
    }

    displayBuildingInterfaceUI(buildingName) {
        this.buildingsPreviewInteractiveArea.remove();
        this.renderContainer.appendChild(this.buildings[buildingName].interfaceUI);
    }

    displayBuildingsPreviewUI() {
        this.renderContainer.innerHTML = '';
        this.buildingsPreviewInteractiveArea.render(this.renderContainer);
    }

    render(container) {
        this.renderContainer = container;
        this.buildingsPreviewInteractiveArea.render(container);
    }
}

const buildingManager = new BuildingManager();
buildingManager.render(document.getElementById('column3'));