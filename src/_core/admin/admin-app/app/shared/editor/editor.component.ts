import { Component, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';

import * as _ from 'lodash/lodash';
import * as $ from 'jquery';

import { ContentEditableDirective } from './../directives/content-editable.directive';

@Component({
    selector: 'ca-editor',
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.scss']
})
export class EditorComponent {
    editorContentValue: string;
    contenteditable = true;

    @Input() foreColors: string[] = [];
    @Input() backColors: string[] = [];
    @Input()
    get editorContent() {
        // get editorContent value aside of itself into another private variable
        return this.editorContentValue;
    }

    @Output() editorContentChange: EventEmitter<string> = new EventEmitter();
    set editorContent(val) {
        // update variable with editorContent value
        this.editorContentValue = val;
        // emit changes in editorContent
        this.editorContentChange.emit(this.editorContentValue);
    }

    @ViewChild('caContentEditable') contentEditableElementRef: ContentEditableDirective;

    constructor() { }

    /** Execute command via execCommand... */
    execCommand(commandId: string, value?: any): void {
        // ...on document object
        document.execCommand(commandId, false, value ? value : null);

        // do refresh model & view
        this.refreshView();
    }

    // update model and refresh view
    refreshView() {
        // refresh view via ContentEditableDirective (emit changes from inside of directive)
        this.contentEditableElementRef.emitChanges(
            this.contentEditableElementRef.elementRef.nativeElement.innerHTML
        );
    }

    /** Handle before 'createLink' command */
    createLink(): void {
        // get user link via prompt window
        const url = prompt('Insert link: ', '');

        // check if user fill link
        if (url) {
            this.execCommand('createLink', url);
        }
    }

    /** Handle before 'insertImage' command */
    insertImage(): void {

    }

    /** Handle inserting table by 'insertHtml' command */
    insertTable(): void {
        // prepare table HTML string
        const tableHTML = `
            <table style=" ">
                <tbody>
                    <tr>
                        <td rowspan="2"></td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td colspan="2"></td>
                    </tr>
                </tbody>
            </table>
        `;

        // insert html table via 'insertHTML' command
        this.execCommand('insertHTML', tableHTML);
    }

    /** Insert text in `<code></code>` tag via prompt window */
    insertCode(): void {
        // get user code via prompt window
        const code = prompt('Insert code: ', '');

        // escape HTML chars
        const codeEscape = _.escape(code);

        // check if user fill link
        if (code) {
            this.execCommand('insertHTML', `<code>${codeEscape}</code>`);
        }
    }

    /**
     * Insert/remove - row/column; Do/Undo - rowspan/colspan
     * @param type type of modification - row, column, rowspan, colspan
     * @param remove will be removed or added
     */
    editTable(type: string, remove?: boolean): void {
        // current selection in 'contentEditable'
        const selection = window.getSelection ? window.getSelection() : null;

        // if no selection - don`t continue
        if (!selection) { return; }

        // selected cell & row
        const selectedCell = $(selection.getRangeAt(0).commonAncestorContainer);
        const selectedRow = $(selection.getRangeAt(0).commonAncestorContainer).closest('tr');
        const selectedTableBody = $(selection.getRangeAt(0).commonAncestorContainer).closest('tbody');

        // if some selected element missing - don`t continue
        if (
            !selectedCell || !selectedCell.get(0) ||
            !selectedRow || !selectedRow.get(0) ||
            !selectedTableBody || !selectedTableBody.get(0)
        ) { return; }

        // get index of selected row and cell
        const selectedCellIndex = selectedCell.index();
        const selectedRowIndex = selectedRow.index();

        // count number of rows in table
        const rowsCount = selectedTableBody.find('tr').length;

        // get first row in table
        const firstRow = selectedTableBody.find('tr').eq(0);

        // count number of columns in table - including colspan/rowspan
        // https://goo.gl/f757fp
        const columnsCount = [].reduce.call(firstRow.find('td'), (p, c) => {
            const colspan = c.getAttribute('colspan') || 1;
            return p + +colspan;
        }, 0);

        // execute action according to type of action (row/column) and type of element (insert/remove)
        switch (type) {
            // insert/remove row
            case 'row': {
                if (remove) {
                    // remove selected row if available - at least 2 rows must be in table
                    const removedRow = selectedTableBody.get(0) && rowsCount > 1
                        ? selectedTableBody.get(0).deleteRow(selectedRowIndex)
                        : null;

                    // don`t continue (row has been deleted)
                    break;
                }

                // insert row
                // const insertedRow = selectedTableBody.get(0) ? selectedTableBody.get(0).insertRow(selectedRowIndex + 1) : null;
                // TODO... handle add row in rowspan columns
                const insertedRow = selectedTableBody.get(0) ? selectedTableBody.get(0).insertRow(-1) : null;

                // if no inserted row - don`t continue
                if (!insertedRow) { return; }

                // insert one cell for each column
                for (let i = columnsCount; i > 0; i--) {
                    insertedRow.insertCell(-1);
                }

                break;
            }

            // do/undo rowspan
            case 'rowspan': {

                break;
            }

            // insert/remove column
            case 'column': {
                if (remove) {
                    // don`t remove column if number of columns is lower than 2
                    if (columnsCount < 2) { return; }

                    // remove one cell from each row or decrease colspan attr
                    selectedTableBody.find('tr').each((index) => {
                        // get current row
                        const currentRow = selectedTableBody.find('tr').eq(index);

                        // check if last column in row has 'colspan' attr
                        const colspan = currentRow.find('td').last().attr('colspan');

                        if (colspan && colspan > 1) {
                            // decrease colspan
                            currentRow.find('td').last().attr('colspan', colspan - 1);
                        } else {
                            // no 'colspan' - just remove cell
                            const removedCell = currentRow.get(0) ? currentRow.get(0).deleteCell(-1) : null;
                        }
                    });

                    // don`t continue (column has been deleted)
                    break;
                }

                // insert one cell to each row (so, add whole column)
                selectedTableBody.find('tr').each((index) => {
                    selectedTableBody.find('tr').eq(index).get(0).insertCell(-1);
                });

                break;
            }

            // do/undo colspan
            case 'colspan': {
                // get colspan and rowspan of selected cell
                const selectedCellColspan = selectedCell.attr('colspan') ? Number(selectedCell.attr('colspan')) : null;
                const selectedCellRowspan = selectedCell.attr('rowspan') ? Number(selectedCell.attr('rowspan')) : null;

                // can`t apply colspan to rowspan
                if (selectedCellRowspan && selectedCellRowspan > 1) { return; }

                if (remove) {
                    // exit if selected cell has no cellspan
                    if (!selectedCellColspan || selectedCellColspan < 2) { return; }

                    // add cell immediately after selected cell
                    selectedRow.get(0).insertCell(selectedCellIndex + 1);

                    // decrease 'colspan' of selected cell
                    selectedCell.attr(
                        'colspan',
                        selectedCellColspan - 1
                    );

                    break;
                }

                // get next cell and
                const nextCell = selectedCell.next();

                // check if next cell exists
                if (!nextCell || !nextCell.get().length) { return; }

                // get next cell rowspan and colspan
                const nextCellRowspan = nextCell.attr('rowspan') ? Number(nextCell.attr('rowspan')) : null;
                const nextCellColspan = nextCell.attr('colspan') ? Number(nextCell.attr('colspan')) : null;

                // can`t apply colspan to rowspan
                if (nextCellRowspan && nextCellRowspan > 1) { return; }

                // remove next cell
                selectedRow.get(0).deleteCell(selectedCellIndex + 1);

                if (nextCellColspan && nextCellColspan > 1) {
                    // increase 'colspan' of selected cell
                    selectedCell.attr(
                        'colspan',
                        selectedCellColspan ? selectedCellColspan + nextCellColspan : nextCellColspan
                    );
                } else {
                    // just increase 'colspan'
                    selectedCell.attr(
                        'colspan',
                        selectedCellColspan ? selectedCellColspan + 1 : 2
                    );
                }

                break;
            }

            default:
                break;
        }

        // do refresh model & view
        this.refreshView();
    }
}
