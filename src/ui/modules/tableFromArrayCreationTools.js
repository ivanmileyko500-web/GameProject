const tableFromArrayCreationTools = {
    createTable(data, {customTableCreator = document.createElement.bind(document), customRowCreator = document.createElement.bind(document), customCellCreator = document.createElement.bind(document)} = {}){
        const table = customTableCreator('table');
        table.style.width = '100%';
        table.style.border = 'none';
        table.style.borderCollapse = 'collapse';
        
        for (let i = 0; i < data.length; i++) {
            const tr = this.createRow(data[i], {customRowCreator, customCellCreator});
            table.appendChild(tr);
        }

        return table;
    },
    createRow(data, {customRowCreator = document.createElement.bind(document), customCellCreator = document.createElement.bind(document)} = {}){
        const tr = customRowCreator('tr');
        for (let i = 0; i < data.length; i++) {
            const td = this.createCell(data[i], {customCellCreator});
            tr.appendChild(td);
        }
        return tr;
    },
    createCell(data, {customCellCreator = document.createElement.bind(document)} = {}){
        const td = customCellCreator('td');
        td.textContent = data;
        return td;
    },
}

export default tableFromArrayCreationTools