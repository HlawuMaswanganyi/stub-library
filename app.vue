<template>
  <MainScreen v-if="componentHasMounted" />
</template>

<script setup>
import { onMounted, ref, onUpdated } from 'vue';

let componentHasMounted = ref(false);

useHead({
  link: [
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap',
    },
  ],
});

onMounted(() => {
  componentHasMounted.value = true;
});

onUpdated(() => {
  const stub = new stubAfrica({
    profitLossContainerSelector: 'profit-loss--container',
    fileInputElementId: 'file-upload',
    createFile: {
      type: 'pdf',
    },
    printOptions: {
      theme: 'dark',
    },
    businessType: 'sbc',
  });

  stub.fileProcessor();
});
</script>
