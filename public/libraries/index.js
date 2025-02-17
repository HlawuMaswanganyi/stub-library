const stubAfrica = function ({
  profitLossContainerSelector,
  fileInputElementId,
  createFile,
  businessType,
  printOptions,
  sortDesc,
}) {
  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your file upload input field: e.g #my-stub--file-upload');
    return false;
  }

  if (!fileInputElementId) {
    this.errors.push('Sorry, kindly provide a selector for your table element: e.g #my-stub--table');
    return false;
  }
  this.sortDesc = sortDesc;
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
    this.loadStyles();
    this.loadDependencyScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js');

    console.log("All good, stub's running babe, go on!");
    const profitAndLossContainer = this.profitAndLossContainer;

    const profitAndLossContainerElement =
      document.getElementById(profitAndLossContainer) || document.querySelector(`.${profitAndLossContainer}`);

    if (!profitAndLossContainerElement) {
      const container = document.createElement('div');
      const mainContainer = document.querySelector('.stub-main-container');
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
    if (this.fileInputId) {
      const fileUploadElement = document.getElementById(this.fileInputId);

      if (fileUploadElement) {
        fileUploadElement.onchange = handleFileUpload;
      }
    }
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
    let statementDateLabel = `${currentYearValue - 1} / ${currentYearValue}`;

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

        const annualEntries = Object.entries(specificYearData);

        let reversedSpecificYearData = new Map(annualEntries);

        if (this.sortDesc && this.sortDesc === true) {
          statementDateLabel = `${currentYearValue} / ${currentYearValue - 1}`;
          reversedSpecificYearData = new Map(annualEntries.reverse());
        }

        const modifiedArrayFromReversedKeys = Array.from(reversedSpecificYearData.keys());

        const headingContainer = document.createElement('div');
        headingContainer.setAttribute('class', 'profit-loss--statement-heading');
        profitAndLossContainerElement.innerHTML = ``;
        headingContainer.innerHTML = `
          <div class='statement-heading'>Profit & Loss</div>
          <div>${statementDateLabel}<div>
          
        `;

        const revenueContainer = document.createElement('div');
        revenueContainer.setAttribute('class', 'box');

        const expensesContainer = document.createElement('div');
        expensesContainer.setAttribute('class', 'box');

        const netIncomeContainer = document.createElement('div');
        netIncomeContainer.setAttribute('class', 'box');

        const beforeTaxIncomeContainer = document.createElement('div');
        beforeTaxIncomeContainer.setAttribute('class', 'box');

        modifiedArrayFromReversedKeys.map((yearKey) => {
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

          this.scrollToElement(contentToSave);
          downloadButton.addEventListener('click', () => {
            html2pdf()
              .set({
                html2canvas: {
                  backgroundColor: 'black',
                },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
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

  loadStyles: function () {
    try {
      var style = document.createElement('style');
      style.type = 'text/css';

      var css = `
       body {
        background: #141418;
        color: #fff;
        font-family: 'Public Sans', 'Roboto', 'DM Sans', serif;
        font-optical-sizing: auto;
      }

      .stub-main-container {
        border: 1px solid #2b2b2f;
        box-shadow: 0 12px 72px 0 rgba(0, 0, 0, 0.4);
        margin: 25px;
        padding: 35px 15px;
        display: flex;
        flex-flow: column;
        justify-content: center;
      }

      .file-upload-btn input[type='file'] {
        display: none;
      }

      .dazzle {
        background: linear-gradient(-40deg, #6477e3, #00a86b, #f7d600);
        background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 900;
        user-select: none;
        font-size: 46px;
        line-height: 52px;
        text-align: center;
      }

      .stub-btn {
        background-color: #fff;
        border-radius: 8px;
        color: #32333c;
        padding: 9px 12px;
      }

      .stub-green--bg {
        background-color: #00a86b;
      }

      .stub-green--text {
        color: #00a86b;
      }

      .table-heading {
        font-weight: 900;
        margin-bottom: 5px;
        font-size: 18px;
        text-transform: capitalize;
      }

      .fade-in {
        opacity: 0;
        animation: fadeIn 2s forwards;
      }

      .note-to--user {
        font-size: 14px;
      }

      .income-expense--container {
        background-color: #1f1f23;
        border-radius: 12px;
        width: 100%;
        margin: auto;
        min-height: 250px;
      }

      .title-sub--label {
        text-align: center;
        margin: 5px 0;
      }

      .stub-logo {
        margin: 24px auto;
      }

      .statement-container {
        width: 80%;
        margin: 25px auto;
        background-color: #1f1f23;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        color: #fff;
      }

      .statement-row {
        display: grid;
        grid-template-rows: repeat(1, 1fr);
        padding: 10px;
        border-bottom: 1px solid #2b2b2f;
        text-align: left;
      }

      .statement-row .label {
        text-transform: uppercase;
        display: contents;
      }

      .statement-row .amount {
        text-align: right;
        display: flex;
      }

      .total-row {
        color: #00a86b;
        background: #1f1f23;
        padding: 12px;
        font-weight: 900;
        margin-top: 25px;
        margin-right: 10px;
        border-radius: 12px;
      }

      .total-row .amount {
        color: #fff;
      }

      .profit-loss--statement-heading {
        margin: auto;
        text-align: center;
        margin: 24px 0;
      }

      .profit-loss--statement-heading .statement-heading {
        font-size: 19px;
        font-weight: 900;
        line-height: 24px;
      }

      .profit-loss--container {
        margin: 25px 0;
        padding: 36px;
        border: 1px solid #2b2b2f;
        box-shadow: 0 12px 72px 0 rgba(0, 0, 0, 0.4);
        border-radius: 12px;
      }

      .profit-loss--container .box {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        width: 100%;
      }

      .pre-content--info {
        display: flex;
        justify-content: center;
      }

      .pre-content--info img {
        margin: auto;
      }

      .sub-item {
        display: flex;
      }

      .btn[disabled] {
        opacity: 0.6;
        color: #fff;
        background-color: #9f9faa;
        cursor: not-allowed;
      }

      @media screen and (max-width: 720px) {
        .dazzle {
          font-size: 36px;
          line-height: 42px;
        }

        .stub-main-container {
          padding: 15px;
        }

        .statement-row:last-child {
          border-bottom: none;
        }

        .profit-loss--container .box {
          display: flex;
          padding: 10px;
          flex-direction: column;
        }

        .statement-row .amount {
          text-align: left;
        }

        .statement-row .amount.before-tax,
        .statement-row .amount.after-tax {
          display: block;
        }
      }

      @media screen and (max-width: 380px) {
        .sub-item {
          display: none;
          visibility: hidden;
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
  `;
      style.innerHTML = css;
      document.head.appendChild(style);
    } catch (e) {
      console.log(
        'Failed to load styles. This means that something went horribly wrong! Please reload the page.',
        e.message
      );
    }
  },
  scrollToElement: function s(element) {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  },
};
