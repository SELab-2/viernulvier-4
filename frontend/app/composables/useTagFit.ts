/**
 * useTagFit: composable to measure tags in a horizontal container and expose how many fit.
 * Returns: { tagsContainer, setTagRef, moreEl, fitCount, scheduleMeasure }
 */

import { ref, nextTick, onMounted, onBeforeUnmount, type ComponentPublicInstance } from 'vue'

/**
 * Composable to measure which tags fit in a container and expose fitCount.
 * Usage:
 * const { tagsContainer, setTagRef, moreEl, fitCount, scheduleMeasure } = useTagFit()
 */
export function useTagFit() {
  const tagsContainer = ref<HTMLElement | null>(null)
  const tagEls = ref<HTMLElement[]>([])
  const moreEl = ref<HTMLElement | null>(null)
  const fitCount = ref(0)

  function setTagRef(el: Element | ComponentPublicInstance | null, idx: number) {
    if (!el) {
      tagEls.value[idx] = undefined as any
      return
    }
    const node = (el as any).$el ?? el
    tagEls.value[idx] = node as HTMLElement
  }

  function measureTags() {
    if (!tagsContainer.value) return
    const container = tagsContainer.value
    const availableWidth = container.clientWidth
    if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
      fitCount.value = tagEls.value.length
      return
    }

    let moreWidth: number
    if (moreEl.value) {
      moreWidth = Math.ceil((moreEl.value.getBoundingClientRect().width) ?? 0)
    } else {
      moreWidth = 60
    }

    const gap = 8
    const widths: number[] = tagEls.value.map((el) => (el ? Math.ceil(el.getBoundingClientRect().width) : 0))

    let used = 0
    let count = 0
    for (let i = 0; i < widths.length; i++) {
      const w = widths[i] ?? 0
      const extraGap = count > 0 ? gap : 0
      const remainingItems = widths.length - (i + 1)
      const needMore = remainingItems > 0
      const reserve = needMore ? moreWidth + gap : 0

      if (used + extraGap + w + reserve <= availableWidth) {
        used += extraGap + w
        count = i + 1
      } else {
        break
      }
    }

    if (count === 0 && widths.length > 0 && (widths[0] ?? 0) <= availableWidth) count = 1
    fitCount.value = count
  }

  function scheduleMeasure() {
    nextTick(() => {
      try { measureTags() } catch (e) { /* ignore */ }
    })
  }

  let ro: ResizeObserver | null = null
  onMounted(() => {
    if (typeof window !== 'undefined') {
      ro = new ResizeObserver(() => scheduleMeasure())
      if (tagsContainer.value) ro.observe(tagsContainer.value)
      window.addEventListener('resize', scheduleMeasure)
    }
  })

  onBeforeUnmount(() => {
    if (ro && tagsContainer.value) ro.unobserve(tagsContainer.value)
    ro = null
    if (typeof window !== 'undefined') window.removeEventListener('resize', scheduleMeasure)
  })

  return { tagsContainer, setTagRef, moreEl, fitCount, scheduleMeasure }
}
