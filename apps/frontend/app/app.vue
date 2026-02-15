<script setup lang="ts">
const config = useRuntimeConfig()

const { data, status, error, refresh } = await useFetch("/", {
  baseURL: config.public.apiBase // Uses the APIBase configured in the Config.
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <div v-if="data">
      {{ data }}
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
