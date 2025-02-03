const stubAfrica = function ({ tableElementId, fileInputElementId, createFile }) {
  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your file upload input field: e.g #my-stub--file-upload');
    return false;
  }

  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your table element: e.g #my-stub--table');
    return false;
  }
  this.createFile = createFile;
  this.tableId = tableElementId;
  this.fileInputId = fileInputElementId;

  this.errors = [];
  this.csvResults = null;

  this.init();
};

stubAfrica.prototype = {
  init: function () {
    console.log("stub's running babe, go on!");
    return true;
  },
  reset: function () {
    this.errors = [];
    this.init();
  },
  fileTypeChecker: function (file) {
    const isCSVFileType = file && file.type === 'text/csv';
    if (!isCSVFileType) {
      this.errors.push(`Sorry, we failed to process your file (${file.type}). Kindly ensure to upload a csv type file`);
      return false;
    }
    return true;
  },
  parseCSVContentAndReturnRows: function (csvContent) {
    const lines = csvContent.split('\n');
    const result = [];
    lines.forEach((line) => {
      const cells = line.split(',');
      result.push(cells);
    });

    return result;
  },
  fileProcessor: function () {
    const readFile = async function (file) {
      var reader = new FileReader();
      await reader.readAsText(file);

      const readSuccess = function (event) {
        this.csvResults = this.parseCSVContentAndReturnRows(event.target.result);

        if (this.createFile && this.createFile.type === 'csv') {
          this.generateProfitLossStatementCSV();
        }

        this.statementGenerator();
      }.bind(this);

      reader.onload = readSuccess;
    }.bind(this);

    document.getElementById(this.fileInputId).onchange = function (e) {
      const csvFile = e.target.files[0];

      this.fileTypeChecker(csvFile);

      readFile(e.srcElement.files[0]);
    }.bind(this);
  },
  statementGenerator: function (statementType = 'PROFIT_LOSS', templateType = 'HTML_TABLE') {
    switch (statementType) {
      case 'PROFIT_LOSS':
        return this.generateProfitLossStatement(templateType);
      default:
        return this.generateProfitLossStatement(templateType);
    }
  },
  generateProfitLossStatement: function (templateType) {
    switch (templateType) {
      case 'HTML_TABLE':
        return this.generateProfitLossStatementHTMLTable();
      case 'PDF':
        return this.generateProfitLossStatementPDF();
      default:
        return this.generateProfitLossStatementHTMLTable();
    }
  },
  generateProfitLossStatementHTMLTable: function () {
    const columnsLabels = this.csvResults[0];
    const tableId = this.tableId;
    const currentYearValue = new Date().getFullYear();

    try {
      const populateTable = function (rows) {
        const tableElement = document.getElementById(tableId);

        const tableBody = tableElement.getElementsByTagName('tbody')[0];
        const tableHead = tableElement.getElementsByTagName('thead')[0];

        tableHead.innerHTML = '';
        tableBody.innerHTML = '';

        const tableHeadTr = document.createElement('tr');
        tableHeadTr.innerHTML = `
          <th>Current Year (${currentYearValue}) - values in ZAR </th>
          <th>Prior Year (${parseInt(currentYearValue) - 1}) - values in ZAR</th>`;
        tableHead.appendChild(tableHeadTr);

        let specificYearData = {
          [currentYearValue - 1]: {
            expenses: [],
            income: [],
          },
          [currentYearValue]: {
            expenses: [],
            income: [],
          },
        };

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];

          for (let j = 0; j < row.length; j++) {
            if (j > 1) {
              const expenseIncomeType = (columnsLabels[j] || 'unknown').replace(/[\r\n]+/g, '');
              if (row[j] < 0) {
                specificYearData[row[1]].expenses.push({ label: expenseIncomeType, value: parseFloat(row[j]) });
              } else {
                specificYearData[row[1]].income.push({ label: expenseIncomeType, value: parseFloat(row[j]) });
              }
            }
          }
        }

        const tableBodyTrIncome = document.createElement('tr');
        const tableBodyTrExpense = document.createElement('tr');

        Object.keys(specificYearData).map((yearKey) => {
          const currentYearExpenses = specificYearData[yearKey].expenses;
          const currentYearIncome = specificYearData[yearKey].income;

          const totalExpenses = currentYearExpenses.reduce(
            (accumulator, currentValue) => accumulator + currentValue.value,
            0
          );
          const totalIncome = currentYearIncome.reduce(
            (accumulator, currentValue) => accumulator + currentValue.value,
            0
          );

          let formattedAmount = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
          }).format(totalIncome - totalExpenses);

          tableBodyTrIncome.innerHTML += `
          <td>
            <strong>Revenue items:</strong>
            ${currentYearIncome
              .map((incomeItem) => {
                if (incomeItem.value) {
                  return `<div style="padding: 5px; font-style: italic;">${incomeItem.label}: ${incomeItem.value}</div>`;
                }

                return null;
              })
              .join('')}
            <strong>Total Revenue: ${totalIncome}</strong>
          </td>
          `;

          tableBodyTrExpense.innerHTML += `<td>
              <strong>Expense items</strong>
               ${currentYearExpenses
                 .map((expenseItem) => {
                   if (expenseItem.value) {
                     return `<div style="padding: 5px; font-style: italic;">${expenseItem.label}: ${expenseItem.value}</div>`;
                   }

                   return null;
                 })
                 .join('')}
            <strong>Total Expenses: ${Math.abs(totalExpenses)}</strong>
            <div style="margin: 20px auto;">
              <strong>Profit/Loss: ${formattedAmount}</strong>
            </div>
          </td>
          `;
        });

        tableBody.appendChild(tableBodyTrIncome);
        tableBody.appendChild(tableBodyTrExpense);
      }.bind(this);

      populateTable(this.csvResults);
    } catch (e) {
      this.errors.push(e.message);
    }
  },
  generateProfitLossStatementPDF: function () {
    return { pdfDownloadURL: 'https://stub.africa/business-name/statements/pdf/:id' };
  },
  generateProfitLossStatementCSV: function () {
    const table = document.getElementById(this.tableId);
    let csv = [];

    for (let row of table.rows) {
      let rowData = [];

      for (let cell of row.cells) {
        rowData.push(cell.innerText);
      }

      csv.push(rowData.join(','));
    }

    const csvString = csv.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    if (this.createFile.autoDownload) {
      const link = document.createElement('a');

      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);

      link.setAttribute('download', `profit-loss-${new Date().getTime()}.csv`);

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      return true;
    }
    return { csvURL: 'https://stub.africa/business-name/statements/csv/:id' };
  },
};
