<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ChevronDown, Check } from 'lucide-vue-next'

const { locale, locales, setLocale } = useI18n()
const isOpen = ref(false)
const dropdownRef = ref(null)

/**
 * Normalizes the locales array into a simple list of strings.
 */
const normalizedLocales = computed(() => {
  return locales.value.map(loc => typeof loc === 'string' ? loc : loc.code)
})

/**
 * Closes the dropdown if a click occurs outside the component.
 */
const closeDropdown = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

/**
 * Closes the dropdown when the 'Escape' key is pressed.
 */
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

const handleResize = () => {
  if (isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeDropdown)
  window.addEventListener('keydown', handleEscape)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('click', closeDropdown)
  window.removeEventListener('keydown', handleEscape)
  window.removeEventListener('resize', handleResize)
})

/**
 * Updates the app locale and closes the menu.
 */
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
            v-for="loc in normalizedLocales"
            :key="loc"
            @click="handleLocaleChange(loc)"
            class="flex w-full items-center justify-between px-4 py-2 text-[11px] font-black uppercase transition-colors outline-none hover:text-[var(--accent)]"
            :class="loc === locale ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'"
          >
            <span>{{ loc.toUpperCase() }}</span>

            <Check
              v-if="loc === locale"
              :size="14"
              stroke-width="3"
              class="ml-2"
            />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>