<script setup lang="ts">
import { HelloWorldSchema } from '@repo/common';

async function fetchHelloWorld() {
  const { data, status, error, refresh } = await useFetch("/", { baseURL: config.public.apiBase });
  
  if (error.value || !data.value) {
    return {text: null, error: error.value};
  }

  const hw = HelloWorldSchema.parse(data.value);
  return {
    text: hw.text,
    error: error,
  };
}

const config = useRuntimeConfig()
const { text, error } = await fetchHelloWorld();
</script>

<template>
  <div>
    <div v-if="text">
      {{ text }}
    </div>

    <div v-else-if="error" style="color: red; border: 1px solid red; padding: 10px;">
      <p><strong>Error Detected:</strong></p>
      <pre>{{ error }}</pre>
    </div>

    <div v-else>
      Loading...
    </div>
  </div>
</template>
