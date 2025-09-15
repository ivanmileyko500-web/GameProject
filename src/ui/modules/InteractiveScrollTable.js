import InteractiveTable from "./InteractiveTable.js";

export default class InteractiveScrollTable extends InteractiveTable {
        constructor (
        tableData, 
        {
            firstWisibleRowIndex = 0,
            tableInteractiveType = 'row', 
            hoverable = true, 
            clickable = true, 
            focusCallback = (element) => {}, 
            unfocusCallback = (element) => {}, 
            clickCallback = (element) => {}
        } = {}
    ) {
        super(tableData, 
        {
            tableInteractiveType: tableInteractiveType, 
            firstWisibleRowIndex: firstWisibleRowIndex,
            hoverable: hoverable, 
            clickable: clickable, 
            focusCallback: focusCallback, 
            unfocusCallback: unfocusCallback, 
            clickCallback: clickCallback
        });

        this.setup();
    }

    setup() {
        this.interactiveArea.webElement.addEventListener('wheel', (event) => {
            event.preventDefault(); // Отменяем стандартное поведение
            if (event.deltaY > 0) {
                if (this.firstWisibleRowIndex < this.tableData.length - InteractiveScrollTable.wisibleRows) {
                    this.firstWisibleRowIndex++;
                    this.replaceTableContent(this.getDataToDisplay());
                }
            } else {
                if (this.firstWisibleRowIndex > 0) {
                    this.firstWisibleRowIndex--;
                    this.replaceTableContent(this.getDataToDisplay());
                }
            }
        }, { passive: false });
    }
}