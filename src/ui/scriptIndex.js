const { ipcRenderer } = require('electron');
import {InventoryDragManager, Inventory, Item} from './modules/DragAndDrop.js';
import InteractivePageTable from "./modules/InteractivePageTable.js";
import InteractiveScrollTable from "./modules/InteractiveScrollTable.js";
import genWebElementGenerator from './modules/genWebElementGenerator.js';

const info = document.getElementById('column1-container1');
info.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
info.style.color = 'aliceblue';
info.innerHTML = 'Description:' + '<br>' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const slotExample = document.createElement('div');
slotExample.style.width = '28px';
slotExample.style.height = '28px';
slotExample.style.backgroundImage = 'url("images/slot.png")';
slotExample.style.padding = '6px'

const manager = InventoryDragManager.getInstance('mousedown');

const genomContainer = document.getElementById('column2')
const globalInventoryMesh = Inventory.createInventoryUI(
    14, 7, 
    {
        slotExample: slotExample,
    }
);
const globalInventory = new Inventory(
    manager, 
    globalInventoryMesh,
    {
        id: 'global'
    }
);
globalInventory.render(genomContainer);

const tableContainer = document.getElementById('column3-container1');
const interactiveTable = new InteractivePageTable(
    [['MaxHP', '200'], ['HP', '200'], ['Regeneration', '2'], ['Damage', '5-8'], ['CritChance', '15%'], ['CritDamage', 'x1.2'], ['Armor', '3'], ['BlockChance', '20%'], ['Block', '10']],
    {
        clickable: false,
        focusCallback: (element) => {element.style.backgroundColor = 'rgba(0, 100, 200, 0.2)'},
        unfocusCallback: (element) => {element.style.backgroundColor = 'transparent'}
    }
);
const tableHTML = interactiveTable.interactiveArea.webElement.querySelector('table');
tableHTML.style.color = 'aliceblue';
tableHTML.style.marginBottom = '10px';
interactiveTable.paginationContainer.style.color = 'aliceblue';
interactiveTable.paginationContainer.style.width = '200px';
interactiveTable.render(tableContainer);

const column3Container2 = document.getElementById('column3-container2');
column3Container2.style.flexDirection = 'column';
column3Container2.style.backgroundColor = 'rgb(202, 198, 176)';
const selectedGenomContainer = document.createElement('div');
selectedGenomContainer.style.width = '100%';
selectedGenomContainer.style.height = '100px';
selectedGenomContainer.style.display = 'flex';
selectedGenomContainer.style.justifyContent = 'center';
selectedGenomContainer.style.alignItems = 'center';
column3Container2.appendChild(selectedGenomContainer);
const invMesh2 = Inventory.createInventoryUI(
    2, 5, 
    {
        slotExample: slotExample,
    }
);
const inventory2 = new Inventory(
    manager, 
    invMesh2
);
inventory2.render(selectedGenomContainer);
const effectListContainer = document.createElement('div');
effectListContainer.style.width = '100%';
effectListContainer.style.height = '100px';
effectListContainer.style.display = 'flex';
effectListContainer.style.justifyContent = 'center';
column3Container2.appendChild(effectListContainer);
const effectList = new InteractiveScrollTable(
    [['Brocken leg'], ['Poisoned'], ['Inspired'], ['Dazed'], ['Weakened'], ['Bleeding']],
    {
        clickable: false,
        focusCallback: (element) => {element.style.backgroundColor = 'rgba(0, 100, 200, 0.2)'},
        unfocusCallback: (element) => {element.style.backgroundColor = 'transparent'}
    }
);
const effectListTableHTML = effectList.interactiveArea.webElement.querySelector('table');
effectListTableHTML.style.width = '200px';
effectList.render(effectListContainer);

const enemyStatsContainer = document.getElementById('column4-container1');
enemyStatsContainer.innerHTML = '';
const enemyStatsInteractiveTable = new InteractivePageTable(
    [['MaxHP', '150'], ['HP', '150'], ['Regeneration', '3'], ['Damage', '4-6'], ['CritChance', '10%'], ['CritDamage', 'x1.5'], ['Armor', '3'], ['BlockChance', '20%'], ['Block', '10']],
    {
        clickable: false,
        focusCallback: (element) => {element.style.backgroundColor = 'rgba(0, 100, 200, 0.2)'},
        unfocusCallback: (element) => {element.style.backgroundColor = 'transparent'}
    }  
);
const enemyStatsTableHTML = enemyStatsInteractiveTable.interactiveArea.webElement.querySelector('table');
enemyStatsTableHTML.style.color = 'aliceblue';
enemyStatsTableHTML.style.marginBottom = '10px';
enemyStatsInteractiveTable.paginationContainer.style.color = 'aliceblue';
enemyStatsInteractiveTable.paginationContainer.style.width = '200px';
enemyStatsInteractiveTable.render(enemyStatsContainer);

const column4Container2 = document.getElementById('column4-container2');
column4Container2.style.flexDirection = 'column';
column4Container2.style.backgroundColor = 'rgb(202, 198, 176)';
const enemyGenomContainer = document.createElement('div');
enemyGenomContainer.style.width = '100%';
enemyGenomContainer.style.height = '100px';
enemyGenomContainer.style.display = 'flex';
enemyGenomContainer.style.justifyContent = 'center';
enemyGenomContainer.style.alignItems = 'center';
column4Container2.appendChild(enemyGenomContainer);
const enemyInventory = Inventory.createInventoryUI(
    2, 5, 
    {
        slotExample: slotExample,
        onlyVisual: true
    }
);
enemyGenomContainer.appendChild(enemyInventory);
const enemyEffectListContainer = document.createElement('div');
enemyEffectListContainer.style.width = '100%';
enemyEffectListContainer.style.height = '100px';
enemyEffectListContainer.style.display = 'flex';
enemyEffectListContainer.style.justifyContent = 'center';
column4Container2.appendChild(enemyEffectListContainer);
const enemyEffectList = new InteractiveScrollTable(
    [['Blood tasted']],
    {
        clickable: false,
        focusCallback: (element) => {element.style.backgroundColor = 'rgba(0, 100, 200, 0.2)'},
        unfocusCallback: (element) => {element.style.backgroundColor = 'transparent'}
    }
);
const enemyEffectListTableHTML = enemyEffectList.interactiveArea.webElement.querySelector('table');
enemyEffectListTableHTML.style.width = '200px';
enemyEffectList.render(enemyEffectListContainer);

const playerBaseButton = document.getElementById('player-base');
playerBaseButton.addEventListener('click', () => {
    ipcRenderer.send('openWindow', 'playerBase');
});

const saveAndQuitButton = document.getElementById('save-and-quit');
saveAndQuitButton.addEventListener('click', () => {
    ipcRenderer.send('saveAndQuit');
});

ipcRenderer.invoke('fetchGameData', 'index').then(data => {
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
});

ipcRenderer.on('updateAll', () => {
  //TODO update all  
})