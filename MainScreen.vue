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
            class="stub-btn text-white font-semibold py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform opacity-75 transition-opacity hover:opacity-100 flex items-center justify-between"
          >
            Choose CSV file
            <input type="file" id="file-upload" name="file" class="hidden" accept=".csv, text/csv" />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="ml-2"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14C4.69 14 1 10.31 1 8S4.69 2 8 2s7 3.69 7 7-3.69 7-7 7zm-1-7H5v2h2V7zm3 0H8v2h2V7z"
              />
            </svg>
          </label>
        </div>
      </div>

      <div class="profit-loss--container">
        <div class="pre-content--info remove-on-statement--load">
          <p class="p-12 font-light text-center items-center">
            <img class="dm" src="https://stub.africa/_nuxt/growth.dm.Cs2KInFV.svg" alt="Growth" />
            Dear customer, your profit & loss statement will appear here after processing.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
