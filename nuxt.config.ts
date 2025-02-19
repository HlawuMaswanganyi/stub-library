// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    head: {
      script: [
        {
          src: '/libraries/index.js',
          type: 'text/javascript',
        },
        {
          src: 'https://unpkg.com/@tailwindcss/browser@4',
          type: 'text/javascript',
        },
      ],
    },
  },
  ssr: true,
});
