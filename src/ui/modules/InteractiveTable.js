import InteractiveAreaCreationTools from "./InteractiveAreaCreationTools.js";
import tableFromArrayCreationTools from "./tableFromArrayCreationTools.js";

export default class InteractiveTable extends InteractiveAreaCreationTools {
    static wisibleRows = 5;
    
    static setWisibleRows(rows) {
        this.wisibleRows = rows;
    }

    static arrayToTable(data, tableInteractiveType = 'row') {
        const createTableSettings = {
            row: { customRowCreator: InteractiveTable.createInteractiveContainer },
            cell: { customCellCreator: InteractiveTable.createInteractiveContainer }
        }

        return tableFromArrayCreationTools.createTable(data, createTableSettings[tableInteractiveType]);
    }

    constructor (
        tableData, 
        {
            tableInteractiveType = 'row', 
            firstWisibleRowIndex = 0,
            hoverable = true, 
            clickable = true, 
            focusCallback = (element) => {}, 
            unfocusCallback = (element) => {}, 
            clickCallback = (element) => {}
        } = {}
    ) {
        super();

        this.tableData = tableData;
        this.tableInteractiveType = tableInteractiveType;
        this.firstWisibleRowIndex = firstWisibleRowIndex;
        this.interactiveArea = undefined;
        this.tableStyle = undefined;
        this.focusCallback = focusCallback;
        this.unfocusCallback = unfocusCallback;
        this.clickCallback = clickCallback;

        this.init(hoverable, clickable);
    }

    setTableStyle(styleText) {
        this.tableStyle = styleText;
        this.replaceTableContent(this.getDataToDisplay());
    }

    getDataToDisplay() {
        const dataToDisplay = [];
        for (let i = this.firstWisibleRowIndex; i < InteractiveTable.wisibleRows + this.firstWisibleRowIndex; i++) {
            if (this.tableData[i]) {
                dataToDisplay.push(this.tableData[i]);
            }
        }
        return dataToDisplay;
    }

    init(hoverable, clickable) {
        const table = InteractiveTable.arrayToTable(this.getDataToDisplay(), this.tableInteractiveType);
        table.style.cssText = this.tableStyle;
        this.interactiveArea = InteractiveTable.createInteractiveArea(table, hoverable, clickable);

        if (hoverable) {
            this.interactiveArea.focusCallback = this.focusCallback;
            this.interactiveArea.unfocusCallback = this.unfocusCallback;
        }
        if (clickable) {
            this.interactiveArea.clickCallback = this.clickCallback;
        }
    }

    replaceTableContent(dataToDisplay) {
        const table = InteractiveTable.arrayToTable(dataToDisplay, this.tableInteractiveType);
        table.style.cssText = this.tableStyle;
        this.interactiveArea.replaceContent(table);

        if (this.interactiveArea.focusedElement) {
            const event = new MouseEvent ('mousemove', {
                clientX: this.interactiveArea.clientMouseX,
                clientY: this.interactiveArea.clientMouseY,
                bubbles: true,
                cancelable: true,
                view: window
            })
            const element = document.elementFromPoint(this.interactiveArea.clientMouseX, this.interactiveArea.clientMouseY);
            element.dispatchEvent(event);
        }
    }

    replaceTableData(newData) {
        this.tableData = newData;
        this.replaceTableContent(this.getDataToDisplay());
    }
        
    updateTableData(newData, fastNoCheck = false) {
        let dataStructureFlag = true;
        if (!fastNoCheck) {
            if (newData.length === this.tableData.length) {
                for (let i = 0; i < newData.length; i++) {
                    if (newData[i].length !== this.tableData[i].length) {
                        dataStructureFlag = false;
                        break;
                    }
                }
            } else {
                dataStructureFlag = false;
            }
        }

        if (dataStructureFlag) {
            this.tableData = newData;
            const table = this.interactiveArea.webElement.querySelector('table');
            const dataToDisplay = this.getDataToDisplay();
            for (let i = 0; i < dataToDisplay.length; i++) {
                for (let j = 0; j < dataToDisplay[i].length; j++) {
                    table.rows[i].cells[j].textContent = dataToDisplay[i][j];
                }
            }
        } else {
            console.warn('InteractiveTable: Invalid data structure. Data must be an array of arrays with initial length. Data will be replaced.');
            this.replaceTableData(newData);
        }
    }

    render(container) {
        this.interactiveArea.render(container);
    }

    remove() {
        this.interactiveArea.remove();
    }
}