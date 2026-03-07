<script lang="ts" setup>
const config = useRuntimeConfig();

const { error } = await useFetch("/", { baseURL: config.public.apiBase });
const connected = !error.value;
</script>

<template>
  <div>
    <div v-if="connected">API connection established</div>
    <div v-else style="color: red; border: 1px solid red; padding: 10px">
      <p><strong>Could not connect to API</strong></p>
      <pre>{{ error }}</pre>
    </div>
  </div>
</template>
