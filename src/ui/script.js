import {InventoryDragManager, Inventory, Item} from './modules/DragAndDrop.js';
import InteractiveAreaCreationTools from './modules/InteractiveAreaCreationTools.js';

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
slotExample.style.backgroundImage = 'url("images/slot.png")';
slotExample.style.padding = '6px';

const manager = InventoryDragManager.getInstance('mousedown');
const genomContainer = document.getElementById('column2');

const invMesh1 = Inventory.createInventoryUI(14, 7, slotExample);
const inventory1 = new Inventory(manager, invMesh1);
const invMesh2 = Inventory.createInventoryUI(15, 7, slotExample);
const inventory2 = new Inventory(manager, invMesh2);
const invMesh3 = Inventory.createInventoryUI(10, 7, slotExample);
const inventory3 = new Inventory(manager, invMesh3);
const multiInventory = new MultiInventory();
multiInventory.addInventory('Inventory 1', inventory1);
multiInventory.addInventory('Inventory 2', inventory2);
multiInventory.addInventory('Inventory 3', inventory3);
multiInventory.render(genomContainer);


const entitiesContainer = document.createElement('div');
entitiesContainer.style.width = '100%';
entitiesContainer.style.height = '100%';
entitiesContainer.style.display = 'grid';
entitiesContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
entitiesContainer.style.gridTemplateRows = 'repeat(3, 1fr)';
entitiesContainer.style.gap = '25px';
entitiesContainer.style.padding = '25px';

const entitiesHtml = {};
entitiesHtml.biomassFabricator = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.biomassFabricator.dataset.id = 'biomassFabricator';
entitiesHtml.entity2 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity2.dataset.id = 'entity2';
entitiesHtml.entity3 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity3.dataset.id = 'entity3';
entitiesHtml.entity4 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity4.dataset.id = 'entity4';
entitiesHtml.entity5 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity5.dataset.id = 'entity5';
entitiesHtml.entity6 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity6.dataset.id = 'entity6';
entitiesHtml.entity7 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity7.dataset.id = 'entity7';
entitiesHtml.entity8 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity8.dataset.id = 'entity8';
entitiesHtml.entity9 = InteractiveAreaCreationTools.createInteractiveContainer('div');
entitiesHtml.entity9.dataset.id = 'entity9';

for (let entityName in entitiesHtml) {
    entitiesContainer.appendChild(entitiesHtml[entityName]);
    entitiesHtml[entityName].style.width = '100%';
    entitiesHtml[entityName].style.height = '100%';
    entitiesHtml[entityName].style.backgroundColor = 'white';
}

const entitiesInteractiveArea = InteractiveAreaCreationTools.createInteractiveArea(entitiesContainer);
entitiesInteractiveArea.clickCallback = (element) => console.log(element.dataset.id);
entitiesInteractiveArea.render(document.getElementById('column3')); 