<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'

const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref(null)

// Close dropdown when clicking on something else
const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => window.addEventListener('click', closeDropdown))
onUnmounted(() => window.removeEventListener('click', closeDropdown))

const handleLocaleChange = (code) => {
  setLocale(code)
  isOpen.value = false
}

</script>

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      type="button"
      class="btn-outline flex items-center gap-2 min-w-[70px] justify-between"
      :class="{ 'bg-[var(--foreground)] text-[var(--background)]': isOpen }"
    >
      <span>{{ locale.toUpperCase() }}</span>
      <ChevronDown
        :size="14"
        class="transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-[110] mt-2 w-full origin-top-right rounded-md border-2 border-[var(--foreground)] bg-[var(--background)] shadow-lg outline-none"
      >
        <div class="py-1">
          <button
            v-for="loc in locales"
            :key="typeof loc === 'string' ? loc : loc.code"
            @click="handleLocaleChange(typeof loc === 'string' ? loc : loc.code)"
            class="flex w-full items-center px-4 py-2 text-[11px] font-black uppercase transition-colors outline-none"
            :class="[
              (typeof loc === 'string' ? loc : loc.code) === locale
                ? 'text-[var(--accent)] hover:bg-[var(--foreground)] hover:text-[var(--accent)]'
                : 'text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)]'
            ]"
          >
            {{ (typeof loc === 'string' ? loc : loc.code).toUpperCase() }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>