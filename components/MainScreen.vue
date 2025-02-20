<template>
  <div class="fade-in">
    <header>
      <img
        class="stub-logo"
        height="45"
        width="99"
        src="https://stub.africa/_nuxt/stub-logo-inverted.CZnQK275.svg"
        alt="Stub"
      />
    </header>

    <div class="stub-main-container">
      <h1 class="dazzle">Profit & Loss Statement</h1>
      <p class="title-sub--label">Your business's revenue and expenses</p>
      <div id="file-info" class="mt-4 text-center text-gray-700"></div>

      <div class="income-expense--container flex flex-col items-center justify-center">
        <div class="my-12 file-upload-btn mb-10">
          <label
            for="file-upload"
            class="stub-btn text-white py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform opacity-75 transition-opacity hover:opacity-100 flex items-center justify-between"
          >
            Choose CSV file
            <input type="file" id="file-upload" name="file" class="hidden" accept=".csv, text/csv" />
          </label>
        </div>
      </div>

      <div class="profit-loss--container">
        <div class="pre-content--info remove-on-statement--load">
          <div class="p-12 text-center items-center">
            <img src="https://stub.africa/_nuxt/emptyjar.dm.Bv0eIRex.svg" alt="Empty" />
            <p>Upload your file above, grab a nice coffee and wait a bit.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
