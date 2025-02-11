const stubAfrica = function ({
  profitLossContainerSelector,
  fileInputElementId,
  createFile,
  businessType,
  printOptions,
}) {
  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your file upload input field: e.g #my-stub--file-upload');
    return false;
  }

  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your table element: e.g #my-stub--table');
    return false;
  }
  this.printOptions = printOptions;
  this.businessType = businessType;
  this.createFile = createFile;
  this.profitAndLossContainer = profitLossContainerSelector;
  this.fileInputId = fileInputElementId;

  this.errors = [];
  this.csvResults = null;

  this.init();
};

stubAfrica.prototype = {
  init: function () {
    this.loadDependencyScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js');

    console.log("All good, stub's running babe, go on!");
    const profitAndLossContainer = this.profitAndLossContainer;

    const profitAndLossContainerElement =
      document.getElementById(profitAndLossContainer) || document.querySelector(`.${profitAndLossContainer}`);

    if (!profitAndLossContainerElement) {
      const container = document.createElement('div');
      const mainContainer = document.querySelector('.main-container');
      if (mainContainer) {
        mainContainer.appendChild(container);
      } else {
        document.body.appendChild(container);
      }
      container.setAttribute('class', 'profit-loss--container');
    }

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
      cells.map((cell) => cell.replace(/[\r\n]+/g, ' '));
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
        if (this.createFile && this.createFile.type === 'pdf') {
          this.generateProfitLossStatementPDF();
        }

        this.statementGenerator();
      }.bind(this);

      reader.onload = readSuccess;
    }.bind(this);

    const handleFileUpload = function (e) {
      const csvFile = e.target.files[0];
      this.fileTypeChecker(csvFile);

      readFile(e.srcElement.files[0]);
    }.bind(this);

    document.getElementById(this.fileInputId).onchange = handleFileUpload;
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
        return this.generateProfitLossStatementHTMLContainer();
      case 'PDF':
        return this.generateProfitLossStatementPDF();
      default:
        return this.generateProfitLossStatementHTMLContainer();
    }
  },
  generateProfitLossStatementHTMLContainer: function () {
    const columnsLabels = this.csvResults[0];
    const profitAndLossContainerElement =
      document.getElementById(this.profitAndLossContainer) || document.querySelector(`.${this.profitAndLossContainer}`);

    const currentYearValue = new Date().getFullYear();
    try {
      const populateProfitLossContainer = function (rows) {
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
              let currentCellValue = row[j].replace(/[\r\n\x20]+/g, '');

              if (Number.isNaN(Number(currentCellValue)) || !currentCellValue) {
                currentCellValue = 0;
              }

              if (currentCellValue < 0) {
                specificYearData[row[1]].expenses.push({
                  label: expenseIncomeType,
                  value: parseFloat(currentCellValue),
                });
              } else {
                specificYearData[row[1]].income.push({
                  label: expenseIncomeType,
                  value: parseFloat(currentCellValue),
                });
              }
            }
          }
        }

        const headingContainer = document.createElement('div');
        headingContainer.setAttribute('class', 'profit-loss--statement-heading');
        profitAndLossContainerElement.innerHTML = ``;
        headingContainer.innerHTML = `
          <div class='statement-heading'>Profit & Loss</div>
          <div>${currentYearValue - 1} - ${currentYearValue}<div>
          
        `;

        const revenueContainer = document.createElement('div');
        revenueContainer.setAttribute('class', 'box');

        const expensesContainer = document.createElement('div');
        expensesContainer.setAttribute('class', 'box');

        const netIncomeContainer = document.createElement('div');
        netIncomeContainer.setAttribute('class', 'box');

        const beforeTaxIncomeContainer = document.createElement('div');
        beforeTaxIncomeContainer.setAttribute('class', 'box');

        Object.keys(specificYearData).map((yearKey) => {
          const currentYearExpenses = specificYearData[yearKey].expenses;
          const currentYearIncome = specificYearData[yearKey].income;

          const cleansedYearExpenses = this.combineSameKeyValues(currentYearExpenses);
          const cleansedYearIncome = this.combineSameKeyValues(currentYearIncome);

          const finalExpenses = [];
          const finalIncome = [];

          Object.entries(cleansedYearExpenses).map((val) => {
            const label = val[0];

            const total = val[1];
            const totalAccumulatedValue = total.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            finalExpenses.push({ label: label, value: totalAccumulatedValue });
          });

          Object.entries(cleansedYearIncome).map((val) => {
            const label = val[0];

            const total = val[1];
            const totalAccumulatedValue = total.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

            finalIncome.push({ label: label, value: totalAccumulatedValue });
          });

          const totalExpenses = currentYearExpenses.reduce((accumulator, currentValue) => {
            let val = currentValue.value;
            if (currentValue.value < 0) {
              val = val * -1;
            }

            return accumulator + val;
          }, 0);

          const totalRevenue = currentYearIncome.reduce(
            (accumulator, currentValue) => accumulator + currentValue.value,
            0
          );

          const revenueMinusExpenses = totalRevenue - totalExpenses;

          revenueContainer.innerHTML += `
          <div class="statement-row">
            <div class="item-block">
              <span class="stub-green--text table-heading">${yearKey} Revenue </span>
              
               ${finalIncome
                 .map((incomeItem) => {
                   if (incomeItem.value) {
                     return `
                      <div class="sub-item" style="width: 100%; justify-content: space-between; padding: 5px; color: #9f9faa; font-size: 14px; font-weight: 300;text-transform: capitalize;">
                        <div>${incomeItem.label}</div>
                        <div>${this.formattedAmount(incomeItem.value)}</div>
                      </div>`;
                   }
                   return null;
                 })
                 .join('')}
              
            </div>
            <div class="amount" style="margin-top: 5px; width: 100%;display: flex; justify-content: space-between;">
              <div>Total</div>
              <div>${this.formattedAmount(totalRevenue)}</div>
            </div>
          </div>`;

          expensesContainer.innerHTML += `
           <div class="statement-row">
            <div class="item-block">
              <span class="stub-green--text table-heading">${yearKey} Expenses </span>
              
               ${finalExpenses
                 .map((expenseItem) => {
                   if (expenseItem.value) {
                     return `
                      <div class="sub-item" style="width: 100%; justify-content: space-between; padding: 5px; color: #9f9faa; font-size: 14px; font-weight: 300;text-transform: capitalize;">
                        <div>${expenseItem.label}</div>
                        <div>${this.formattedAmount(expenseItem.value)}</div>
                      </div>`;
                   }
                   return null;
                 })
                 .join('')}
              
            </div>
            <div class="amount" style="margin-top: 5px; width: 100%;display: flex; justify-content: space-between;">
              <div>Total</div>
              <div>${this.formattedAmount(Math.abs(totalExpenses))}</div>
            </div>
          </div>
          `;

          beforeTaxIncomeContainer.innerHTML += `
          <div class="statement-row">
           <div class="amount before-tax" style="margin-top: 5px; width: 100%; justify-content: space-between">
              <div><span class="stub-green--text table-heading">${yearKey} Income Before Tax</span></div>
              <div>${this.formattedAmount(revenueMinusExpenses)}</div>
            </div>
          </div>`;

          netIncomeContainer.innerHTML += `
          <div class="statement-row total-row">
           <div class="amount after-tax" style="margin-top: 5px; width: 100%; justify-content: space-between">
              <div><span class="stub-green--text table-heading">${yearKey} Net Income</span></div>
              <div>${this.formattedAmount(revenueMinusExpenses - this.calculateTax(revenueMinusExpenses))}</div>
            </div>
          </div>
          `;
        });

        try {
          const statementHolderSelectorClass = 'statement-holder';
          const statementHolder = document.createElement('div');

          if (this.printOptions.theme === 'dark') {
            statementHolder.style.background = '#141418';
          }

          statementHolder.style.padding = '12px';
          statementHolder.setAttribute('class', statementHolderSelectorClass);

          profitAndLossContainerElement.appendChild(statementHolder);

          const contentToSave = document.querySelector(`.${statementHolderSelectorClass}`);

          const downloadButton = document.createElement('button');
          downloadButton.innerHTML = 'Download statement';
          downloadButton.setAttribute('class', 'btn stub-btn action-button pdf-button');
          downloadButton.style.cursor = 'pointer';
          downloadButton.style.display = 'flex';
          downloadButton.style.margin = '24px auto';

          statementHolder.appendChild(headingContainer);
          statementHolder.appendChild(revenueContainer);
          statementHolder.appendChild(expensesContainer);
          statementHolder.appendChild(beforeTaxIncomeContainer);
          statementHolder.appendChild(netIncomeContainer);

          profitAndLossContainerElement.appendChild(downloadButton);

          downloadButton.addEventListener('click', () => {
            html2pdf()
              .set({
                html2canvas: {
                  backgroundColor: '#141418',
                },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
              })
              .from(contentToSave)
              .save('profit-and-loss-statement.pdf');
          });
        } catch (e) {}
      }.bind(this);

      populateProfitLossContainer(this.csvResults);
    } catch (e) {
      console.log('Error ', e.message);
      profitAndLossContainerElement.innerHTML = `<p style="text-align: center;border-radius: 12px;padding: 12px; background-color: #e1413b">Sorry, it seems like something went wrong. The file might have a different formatting than expected.</p>`;
      this.errors.push(e.message);
    }
  },
  generateProfitLossStatementPDF: function () {
    let pdf = [];

    const pdfString = pdf.join('\n');

    const blob = new Blob([pdfString], { type: 'text/pdf;charset=utf-8;' });

    if (this.createFile.autoDownload) {
    }

    return { pdfDownloadURL: 'https://stub.africa/business-name/statements/pdf/:id' };
  },
  generateProfitLossStatementCSV: function () {
    console.log('Generate CSV');

    let csv = [];

    const csvString = csv.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    if (this.createFile.autoDownload) {
      const link = document.createElement('a');

      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.style.textDecoration = 'none';
      link.style.display = 'flex';
      link.style.textAlign = 'center';
      link.style.padding = '12px';
      link.style.width = 'max-content';

      link.setAttribute('download', `profit-loss-${new Date().getTime()}.csv`);
      link.innerText = 'Download Statement';

      document.body.appendChild(link);
      return true;
    }
    return { csvURL: 'https://stub.africa/business-name/statements/csv/:id' };
  },

  calculateTax: function (income) {
    let tax = 0;
    if (this.businessType === 'company') {
      tax = income * 0.28;
    } else if (this.businessType === 'sbc') {
      if (income <= 91250) {
        tax = 0;
      } else if (income <= 365000) {
        tax = (income - 91250) * 0.07;
      } else if (income <= 550000) {
        tax = 19337.5 + (income - 365000) * 0.21;
      } else if (income <= 750000) {
        tax = 48937.5 + (income - 550000) * 0.28;
      } else {
        tax = 94537.5 + (income - 750000) * 0.28;
      }
    } else {
      this.errors.push("The business type is invalid. Please either use 'company' or 'sbc'.");
    }

    return tax;
  },
  combineSameKeyValues: function (arr) {
    if (!Array.isArray(arr)) return arr;
    const duplicates = [];

    arr.map((item) => {
      if (duplicates[item.label]) {
        duplicates[item.label].push(item.value);
      } else {
        duplicates[item.label] = [item.value];
      }
    });

    return duplicates;
  },
  formattedAmount: function (valueToFormat) {
    return Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(String(valueToFormat).replaceAll('\x20', ''));
  },

  loadDependencyScript: function (src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  },
};
