// Bao gồm tất cả các hàm thực hiện việc report.
// Hiện tại mới refactor việc export excel, sẽ refactor lại toàn bộ và đưa vào 1 file này => Dễ quản lý source.
// Hướng tới việc sử dụng chung các hàm chỉ custom lại phần merge cell cho toàn bộ report trên hệ thống.
// Để làm được việc này, mọi format style đều phải chung 1 format.

// Style chung của mọi file excel.
// Nếu có style riêng cho cell nào thì phải set riêng cho cell đó.
let styleDefault = {
    alignment: {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
    },
    font: {
        name: 'Arial',
        size: 12,
        color: {
            argb: 'FF000000'
        },
    }
}

class Report{
    constructor(workbook, worksheet, infoExtraData, headerData, listValue,arrayBeMerges, totalLengthData, styleSheet) {
        this.workbook = workbook;
        this.worksheet = worksheet;
        this.arrayBeMerges = {};
        this.infoExtraData = infoExtraData;
        this.headerData = headerData;
        this.listValue = listValue;
        this.totalLengthData = totalLengthData;
        this.arrayBeMerges = arrayBeMerges;
        this.styleSheet = styleSheet;
        this.excludeColumns = [];
    }

    /* Start common function  */
    mergeCell(x, y) {
        this.worksheet.mergeCells(x + ':' + y);
    }
    setValueCell(cell, value) {
        cell = this.worksheet.getCell(cell);
        cell.value = value;
    }
    setFormatCell(cell, format) {
        cell = this.worksheet.getCell(cell);
        if (format) {
            if (format.hasOwnProperty('alignment')) {
                cell.alignment = format.alignment;
            }
            if (format.hasOwnProperty('font')) {
                cell.font = format.font;
            }
            if (format.hasOwnProperty('fill')) {
                cell.fill = format.fill;
            }
            if (format.hasOwnProperty('border')) {
                cell.border = format.border;
            }
            if (format.hasOwnProperty('numFmt')) {
                cell.numFmt = format.numFmt;
            }
        }
    }
    /* End common function  */

    /* Start main function  */
    renderInformationSheetExcel() {
        let that = this;
        that.infoExtraData.forEach(function (info) {
            that.setValueCell(info.position['merge_from'], info.content);
            that.mergeCell(info.position['merge_from'], info.position['merge_to']);
            that.setFormatCell(info.position['merge_from'], info.styleCell);
        })
    }
    renderHeader(){
        let that = this;
        let rowHeaderDataStart = this.headerData.rowHeaderDataStart;
        let columnHeaderDataStart = this.headerData.columnHeaderDataStart;

        this.headerData.columns.forEach(function(column){
            that.setValueCell(rowHeaderDataStart + columnHeaderDataStart, column.text);
            columnHeaderDataStart = columnHeaderDataStart.nextChar();
        })
    }
    renderData() {
        let that = this;
        this.listValue.forEach(function(cell){
            that.setValueCell(cell.cell, cell.value);
        })
    }
    mergeCellByPosition(){
        // Phần này mới là merge cell
        // Sample data:
        // arrayBeMerges = {
        //     'A':{
        //         mergeFrom: '1',
        //         mergeTo: '2',
        //     },
        //     'B':{
        //         mergeFrom: '3',
        //         mergeTo: '4'
        //     }
        // };

        // Get columns = [A,B,C,D,...];
        let that = this;
        let arrayBeMergeKeys = Object.keys(that.arrayBeMerges);

        arrayBeMergeKeys.forEach(function (column) {

            // => Merge tất cả column ngoại trừ những column này.
            if (that.excludeColumns.indexOf(column) == -1) {
                that.arrayBeMerges[column].forEach(function(data){

                    // Sample: mergeCell(A + 1, A + 2)
                    that.mergeCell(column + data.mergeFrom, column + data.mergeTo);
                    if (data.hasOwnProperty('value')){
                        that.setValueCell(column + data.mergeFrom, data.value)
                    }
                })
            }
        });
    }
    setFormatStyleAllCell(headerData, listValue, styleSheet){
        let columnHeaderDataStart = this.headerData.columnHeaderDataStart;
        let rowHeaderDataStart = this.headerData.rowHeaderDataStart;
        let totalRowLength = this.totalLengthData;
        let that = this;
        this.headerData.columns.forEach(function(column){
            that.worksheet.getRow(rowHeaderDataStart).height = that.styleSheet.headerBlock.height;
            that.worksheet.getColumn(columnHeaderDataStart).width = column.width;

            // Default style
            that.worksheet.getColumn(columnHeaderDataStart).font = styleDefault.font;
            that.worksheet.getColumn(columnHeaderDataStart).alignment = styleDefault.alignment;

            // Set default header format.
            that.setFormatCell(columnHeaderDataStart + rowHeaderDataStart, that.styleSheet.headerBlock.defaultFormat);

            // Set custom header format.
            if (column.hasOwnProperty('styleHeader')) {
                that.setFormatCell(columnHeaderDataStart + rowHeaderDataStart, column.styleHeader);
            }
            if (column.hasOwnProperty('styleCell')) {
                for (let i = 1; i <= totalRowLength; i++){
                    that.setFormatCell(columnHeaderDataStart + (rowHeaderDataStart + i), column.styleCell);
                }
            }
            columnHeaderDataStart = columnHeaderDataStart.nextChar();
        })
    }
    exportReport(fileName) {
        // Functions to export
        // 1. Render data each column.
        // 2. Merge custom cell follow conditions.
        // 3. Render header title each column.
        // 4. Set format for all cell in sheet.
        // 5. Render block information of sheet.
        this.renderData();
        this.mergeCellByPosition();
        this.renderHeader();
        this.setFormatStyleAllCell();
        this.renderInformationSheetExcel();

        this.workbook.xlsx.writeBuffer().then(function (buffer) {
            var filesaver = saveAs(new Blob([buffer], {
                type: "application/octet-stream"
            }), fileName);

            setTimeout(function () {
                    window.close();
                },
                4000);
        });
    }
    /* End main function  */
}
