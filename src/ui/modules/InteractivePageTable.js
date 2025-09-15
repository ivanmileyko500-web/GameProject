import InteractiveTable from "./InteractiveTable.js";

export default class InteractivePageTable extends InteractiveTable {
    constructor (
        tableData, 
        {
            currentPage = 1,
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
            firstWisibleRowIndex: (InteractivePageTable.wisibleRows * (currentPage - 1)),
            hoverable: hoverable, 
            clickable: clickable, 
            focusCallback: focusCallback, 
            unfocusCallback: unfocusCallback, 
            clickCallback: clickCallback
        });

        this.currentPage = currentPage;
        this.paginationContainer = undefined;
        this.setup();
    }

    setup() {
        this.interactiveArea.webElement.style.display = 'flex';
        this.interactiveArea.webElement.style.flexDirection = 'column';
        this.paginationContainer = document.createElement('div');
        this.paginationContainer.style.display = 'flex';
        this.paginationContainer.style.justifyContent = 'space-around';
        this.interactiveArea.webElement.appendChild(this.paginationContainer);

        this.createPagination();
    }

    createPagination() {
        this.paginationContainer.innerHTML = ''; // Очистим контейнер перед добавлением

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.disabled = this.currentPage === 1;
        prevButton.addEventListener('click', () => {
            this.swipePage('prev');
        });

        const pageCount = Math.ceil(this.tableData.length / InteractivePageTable.wisibleRows);
        const pageCounter = document.createElement('span');
        pageCounter.textContent = `${this.currentPage} / ${pageCount}`;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = this.currentPage >= pageCount;
        nextButton.addEventListener('click', () => {
            this.swipePage('next');
        });

        this.paginationContainer.appendChild(prevButton);
        this.paginationContainer.appendChild(pageCounter);
        this.paginationContainer.appendChild(nextButton);
    }

    swipePage(direction) {
        if (direction === 'prev') {
            this.currentPage = Math.max(1, this.currentPage - 1);
        } else if (direction === 'next') {
            this.currentPage = Math.min(Math.ceil(this.tableData.length / InteractivePageTable.wisibleRows), this.currentPage + 1);
        }
        this.firstWisibleRowIndex = (InteractivePageTable.wisibleRows * (this.currentPage - 1));
        this.replaceTableContent(this.getDataToDisplay());
        this.createPagination();
    }
}