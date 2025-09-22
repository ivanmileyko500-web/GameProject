import InteractiveAreaCreationTools from "./InteractiveAreaCreationTools.js";
import DragManager from "./DragManager.js";

class InventoryDragManager extends DragManager {
    constructor() {
        super();

        this.inventories = {};
        this.items = {};
        this.draggedItem = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
    }

    init(dragMouseEvent = 'click') {
        super.init();

        if (dragMouseEvent === 'click') {
            document.addEventListener('click', this.handleClick);
        } else if (dragMouseEvent === 'mousedown' || dragMouseEvent === 'mouseup') {
            document.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mouseup', this.handleMouseUp);
        } else {
            throw new Error(`Unknown dragMouseEvent: ${this.dragMouseEvent}`);
        }
    }

    handleDrop(event) {
        if (this.inventories[event.target.dataset.inventoryId].requestDrop(event.target.dataset.id, this.draggedItem)) { //Условия инвентаря выполнены
            this.endDrag(event.target, {modifyPointerEvents: false});
            if (this.draggedItem.inventoryId !== event.target.dataset.inventoryId) { //Перемещение между инвентарями
                delete this.inventories[this.draggedItem.inventoryId].items[this.draggedItem.slotId];
                this.inventories[this.draggedItem.inventoryId].onTakeItem(this.draggedItem);
                this.inventories[event.target.dataset.inventoryId].items[event.target.dataset.id] = this.draggedItem;
                this.inventories[event.target.dataset.inventoryId].onDropItem(this.draggedItem, event.target.dataset.id);
                this.draggedItem.inventoryId = event.target.dataset.inventoryId;        
            } else { //Перемещение внутри одного инвентаря
                this.inventories[this.draggedItem.inventoryId].onItemSlotChanged(this.draggedItem, event.target.dataset.id);
                delete this.inventories[this.draggedItem.inventoryId].items[this.draggedItem.slotId];
                this.inventories[this.draggedItem.inventoryId].items[event.target.dataset.id] = this.draggedItem;
            }
            this.draggedItem.slotId = event.target.dataset.id;
        } else { //Условия инвентаря не выполнены
            this.cancelDrag({modifyPointerEvents: false});
        }
        this.draggedItem = null;
    }

    handlePick(event) {
        if (this.inventories[event.target.dataset.inventoryId].requestPick(event.target.dataset.id)) { //Условия инвентаря выполнены
            const item = this.inventories[event.target.dataset.inventoryId].getItem(event.target.dataset.id);
            this.draggedItem = item;
            this.startDrag(item.webElement, {modifyPointerEvents: false});
        }
    }

    handleCancelDrag(){
        this.cancelDrag({modifyPointerEvents: false});
        this.draggedItem = null;
    }

    handleClick = (event) => {
        event.preventDefault();
        if (event.target.dataset.type === 'slot') { //Событие нажатия произошло на слоте
            if (this.draggedItem) { //Есть перетаскиваемый элемент, попытка положить
                this.handleDrop(event);
            } else { //Перетаскиваемого элемента нет, попытка взять
                this.handlePick(event);
            }
        } else if (this.draggedItem) { //Событие нажатия произошло вне слота, но есть перетаскиваемый элемент
            this.handleCancelDrag();
        }
    }

    handleMouseDown = (event) => {
        if (event.target.dataset.type === 'slot') { //Событие произошло на слоте
            this.handlePick(event);
        }
    }

    handleMouseUp = (event) => {
        if (event.target.dataset.type === 'slot' && this.draggedItem) { //Событие произошло на слоте
            this.handleDrop(event);
        } else {
            this.handleCancelDrag();
        }
    }
    
    registerInventory(inventory) {
        this.inventories[inventory.id] = inventory;
    }

    registerItem(item) {
        if (!item.inventoryId || !this.inventories[item.inventoryId]) {
            throw new Error(`Item ${item.id} has no inventory`);   
        }
        this.items[item.id] = item;
        if (item.slotId) {
            this.inventories[item.inventoryId].pushItem(item);
        } else {
            const slotId = this.inventories[item.inventoryId].getFirstEmptySlotId();
            if (slotId) {
                item.slotId = slotId;
                this.inventories[item.inventoryId].pushItem(item);
            } else {
                console.warn(`Can't register item ${item.id} in inventory ${item.inventoryId} because there is no empty slot, item will be lost`)
                delete this.items[item.id];
            }
        }
    }

    moveItem(itemId, newInventoryId, newSlotId, triggerEvents = false) {
        if (!this.items[itemId]) {
            throw new Error(`Item ${itemId} not found`);   
        }

        if (triggerEvents) {
            //Вызов событий перед перемещением, добавить, если потребуется
        } else {
            const item = this.items[itemId];
            this.deleteItem(item);
            item.inventoryId = newInventoryId;
            item.slotId = newSlotId;
            this.registerItem(item);
        }
    }

    getItem(itemId) {
        return this.items[itemId];
    }

    deleteItem(item) {
        if (typeof item !== 'object') {
            item = this.getItem(item);
        }
        delete this.items[item.id];
        this.inventories[item.inventoryId].removeItem(item);
    }
}

class Inventory extends InteractiveAreaCreationTools {
    //Стандартные параметры визуализации
    static slotBorderSize = 2;
    static slotContentSize = 32;
    static slotGap = 6;
    static slotBorderColor = 'rgba(129, 113, 87, 0.5)';
    static slotBackgroundColor = 'rgba(255, 235, 209, 0.5)';
    static inventoryBackgroundColor = 'rgba(223, 221, 211, 0.8)';
    static inventoryPadding = 'gap';

    //Изменение параметров визуализации (не влияет на существующие инвентари)
    static setVisualParams({
        slotBorderSize = this.slotBorderSize, 
        slotContentSize = this.slotContentSize, 
        slotGap = this.slotGap,
        slotBorderColor = this.slotBorderColor, 
        slotBackgroundColor = this.slotBackgroundColor, 
        inventoryBackgroundColor = this.inventoryBackgroundColor,
        inventoryPadding = this.inventoryPadding
    } = {}) {
        this.slotBorderSize = slotBorderSize;
        this.slotContentSize = slotContentSize;
        this.slotGap = slotGap;
        this.slotBorderColor = slotBorderColor;
        this.slotBackgroundColor = slotBackgroundColor;
        this.inventoryBackgroundColor = inventoryBackgroundColor;
        this.inventoryPadding = inventoryPadding;
    }

    static createInventoryUI(
        rows, 
        cols, 
        {  
            slotExample = null,
            onlyVisual = false
        } = {}) {
        const grid = document.createElement('div');
        if (this.inventoryPadding === 'gap') {
            grid.style.padding = this.slotGap + 'px';
        } else {
            grid.style.padding = this.inventoryPadding + 'px';
        }

        let slotSize
        if (slotExample) {
            document.body.appendChild(slotExample);
            const slotDimensions = slotExample.getBoundingClientRect();
            slotExample.remove();
            slotSize = Math.max(slotDimensions.width, slotDimensions.height);
        } else {
            slotSize = this.slotContentSize + this.slotBorderSize * 2;
        }

        grid.style.width = slotSize * cols + this.slotGap * (cols + 1) + 'px';
        grid.style.height = slotSize * rows + this.slotGap * (rows + 1) + 'px';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, ${slotSize}px)`;
        grid.style.gridTemplateRows = `repeat(${rows}, ${slotSize}px)`;
        grid.style.gap = `${this.slotGap}px`;
        grid.style.backgroundColor = this.inventoryBackgroundColor;

        if (slotExample) {
            if (!onlyVisual) {
                for (let i = 0; i < rows * cols; i++) {
                    const element = this.createInteractiveContainer(slotExample.cloneNode(true));
                    element.dataset.id = i;
                    element.dataset.type = 'slot';
                    grid.appendChild(element);
                }   
            } else {
                for (let i = 0; i < rows * cols; i++) {
                    const element = slotExample.cloneNode(true);
                    grid.appendChild(element);
                }   
            }
        } else {
            if (!onlyVisual) {
                for (let i = 0; i < rows * cols; i++) {
                    const element = this.createInteractiveContainer();
                    element.style.width = slotSize + 'px';
                    element.style.height = slotSize + 'px';
                    element.style.backgroundColor = this.slotBackgroundColor;
                    element.style.border = `${this.slotBorderSize}px solid ${this.slotBorderColor}`;
                    element.style.transition = '0.3s ease-in';
                    element.dataset.id = i;
                    element.dataset.type = 'slot';
                    grid.appendChild(element);
                }
            } else {
                for (let i = 0; i < rows * cols; i++) {
                    const element = document.createElement('div');
                    element.style.width = slotSize + 'px';
                    element.style.height = slotSize + 'px';
                    element.style.backgroundColor = this.slotBackgroundColor;
                    element.style.border = `${this.slotBorderSize}px solid ${this.slotBorderColor}`;
                    grid.appendChild(element);
                }
            }
        }
        return grid;
    }

    constructor(manager, UI,
        {
            id = crypto.randomUUID(), 
            onSlotFocus = (slot) => {},
            onSlotUnfocus = (slot) => {},
            pickRequestConditionCallback = (item) => {return true},
            dropRequestConditionCallback = (item) => {return true},
            onTakeItem = (item) => {},
            onDropItem = (item, newSlotId) => {},
            onItemFocus = (item) => {}, 
            onItemUnfocus = (item) => {},
            onItemSlotChanged = (item, newSlotId) => {}
        } = {}
    ) {
        super();
        //Константы
        this.manager = manager;
        this.interactiveArea = Inventory.createInteractiveArea(UI, true, false);
        this.id = id;

        //Переменные
        this.slots = {};
        this.items = {};

        //Дополнительная логика при наведении на слот инвентаря
        this.onSlotFocus = onSlotFocus;
        this.onSlotUnfocus = onSlotUnfocus;

        //Дополнительные условия для взятия и помещения предметов в инвентарь
        this.pickRequestConditionCallback = pickRequestConditionCallback;
        this.dropRequestConditionCallback = dropRequestConditionCallback;

        //Дополнительная логика при взятии и помещении предметов
        this.onTakeItem = onTakeItem;
        this.onDropItem = onDropItem;

        //Дополнительная логика при наведении на предмет инвентаря
        this.onItemFocus = onItemFocus;
        this.onItemUnfocus = onItemUnfocus;

        //Дополнительная логика при изменении слота предмета внутри одного и того же инвентаря
        this.onItemSlotChanged = onItemSlotChanged;

        //Инициализация
        this.init();
    }

    init() {
        //Настройка слотов
        const slots = this.interactiveArea.interactiveElements;
        for (let slot of slots) {
            slot.dataset.inventoryId = this.id;
            this.slots[slot.dataset.id] = slot;
        };

        //Переопределение коллбэков наведения interactiveArea
        this.interactiveArea.focusCallback = (slot) => {
            this.onSlotFocus(slot);
            if (slot.firstChild) {
                this.onItemFocus(this.items[slot.dataset.id]);
            }
        }
        this.interactiveArea.unfocusCallback = (slot) => {
            this.onSlotUnfocus(slot);
            if (slot.firstChild) {
                this.onItemUnfocus(this.items[slot.dataset.id]);
            }
        };

        //Регистрация инвентаря
        this.manager.registerInventory(this);
    }

    requestPick(slotId) {
        if (this.items[slotId]) {
            if (this.pickRequestConditionCallback(this.items[slotId])) {
                return true;
            }
        }
        return false;
    }

    requestDrop(slotId, item) {
        if (!this.items[slotId]) {
            if (this.dropRequestConditionCallback(item)) {
                return true;
            }
        }
        return false;
    }

    getItem(slotId) {
        return this.items[slotId];
    }

    getFirstEmptySlotId() {
        for (let slot of this.interactiveArea.interactiveElements) {
            if (!this.items[slot.dataset.id]) {
                return slot.dataset.id;                
            }
        }
        return null;
    }

    pushItem(item) {
        this.items[item.slotId] = item;
        this.slots[item.slotId].appendChild(item.webElement);
    }

    removeItem(item) {
        delete this.items[item.slotId];
        this.slots[item.slotId].removeChild(item.webElement);
    }

    render(container) {
        this.interactiveArea.render(container);
    }

    remove() {
        this.interactiveArea.remove();
    }
}

class Item {
    constructor(webElement, id, inventoryId, slotId, gameData) {
        this.webElement = webElement;
        this.webElement.style.pointerEvents = 'none';
        this.webElement.style.userSelect = 'none';
        this.id = id ?? crypto.randomUUID();
        this.inventoryId = inventoryId;
        this.slotId = slotId;
        this.gameData = gameData
    }
}

export {Inventory, Item, InventoryDragManager};