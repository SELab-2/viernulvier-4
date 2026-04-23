<!--
  components/admin/Editor.vue

  Rich Text Editor Component (TipTap-based)

  This component provides a fully featured rich text editor for the admin panel,
  built on top of TipTap. It supports structured content editing with a modern,
  extensible toolbar and real-time data binding.

  Key features include:
  - Two-way binding via v-model (HTML output)
  - Localized placeholder support that updates dynamically with the active locale
  - Inline text styling such as bold, italic, underline, strike, color, and custom font sizes
  - Block-level formatting including headings, lists, and blockquotes
  - Link management with user prompts
  - Content reset and formatting cleanup actions

  A custom FontSize extension is implemented to allow inline font size changes
  without affecting entire paragraphs (unlike default heading behavior).

  The component automatically:
  - Syncs external modelValue changes with the editor state
  - Emits updates on every content change
  - Reacts to locale changes to keep UI labels and placeholder text in sync

  Designed for use in admin forms where rich, formatted text input is required,
  such as blog descriptions or content management.
-->

<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const { t, locale } = useI18n();

// Inline FontSize extension
// Headings are block-level (the whole paragraph changes).
// This extension applies font-size as an inline mark via TextStyle,
// so you can make a *selection* bigger without affecting the whole line.
const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) =>
              el.style.fontSize ? el.style.fontSize.replace("px", "") : null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}px` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size: number) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    } as any;
  },
});

// computed so labels re-evaluate when the locale changes
const FONT_SIZES = computed(() => [
  { label: t("editor.toolbar.sizeNormal"), value: "" },
  { label: t("editor.toolbar.sizeSmall"), value: "12" },
  { label: t("editor.toolbar.sizeNormalPx"), value: "14" },
  { label: t("editor.toolbar.sizeLarge"), value: "18" },
  { label: t("editor.toolbar.sizeXLarge"), value: "24" },
  { label: t("editor.toolbar.sizeXXLarge"), value: "32" },
]);

// TipTap extensions are created once — Placeholder.configure({ placeholder: "..." })
// bakes the string in at init time. To keep the placeholder in sync with the
// active locale (and with any prop change), we store the resolved text in a ref
// and pass a *function* to the extension so it reads the ref on every render.
// When locale or the prop changes we update the ref and dispatch a no-op
// transaction, which forces ProseMirror to call the function again.
const resolvedPlaceholder = ref(props.placeholder || t("editor.placeholder"));

watch([() => props.placeholder, locale], () => {
  resolvedPlaceholder.value = props.placeholder || t("editor.placeholder");
  // no-op transaction so ProseMirror re-evaluates the placeholder function
  editor.value?.view.dispatch(editor.value.view.state.tr);
});

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    TextStyle,
    Color,
    FontSize,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class:
          "text-blue-600 dark:text-blue-400 underline underline-offset-2 cursor-pointer hover:text-blue-800 dark:hover:text-blue-300 transition-colors",
      },
    }),
    Placeholder.configure({
      placeholder: () => resolvedPlaceholder.value,
    }),
  ],
  onUpdate: () => {
    emit("update:modelValue", editor.value?.getHTML() || "");
  },
});

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value, false);
    }
  },
);

const currentFontSize = computed(() => {
  return (
    editor.value?.getAttributes("textStyle").fontSize?.replace("px", "") || ""
  );
});

function onFontSizeChange(e: Event) {
  const size = (e.target as HTMLSelectElement).value;
  if (!size) {
    editor.value?.chain().focus().unsetFontSize().run();
  } else {
    (editor.value?.chain().focus() as any).setFontSize(Number(size)).run();
  }
}

const setLink = () => {
  const previousUrl = editor.value?.getAttributes("link").href;
  const url = window.prompt(t("editor.toolbar.linkPrompt"), previousUrl);
  if (url === null) return;
  if (url === "") {
    editor.value?.chain().focus().extendMarkRange("link").unsetLink().run();
    return;
  }
  editor.value
    ?.chain()
    .focus()
    .extendMarkRange("link")
    .setLink({ href: url })
    .run();
};

const isActive = (type: string, opts?: object) =>
  editor.value?.isActive(type, opts) ?? false;

onBeforeUnmount(() => editor.value?.destroy());
</script>

<template>
  <div
    class="w-full border border-border rounded-xl bg-card overflow-hidden focus-within:ring-2 ring-ring transition-all"
  >
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/40"
    >
      <!-- Font size (inline — only selected text changes) -->
      <div class="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
        <select
          :title="t('editor.toolbar.fontSize')"
          :value="currentFontSize"
          @change="onFontSizeChange"
          class="toolbar-select"
        >
          <option v-for="s in FONT_SIZES" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
      </div>

      <!-- Text formatting -->
      <div class="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
        <button
          type="button"
          :title="t('editor.toolbar.bold')"
          :class="['toolbar-btn', isActive('bold') && 'toolbar-btn--active']"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <strong class="text-[11px]">B</strong>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.italic')"
          :class="['toolbar-btn', isActive('italic') && 'toolbar-btn--active']"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <em class="text-[11px] not-italic font-serif">I</em>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.underline')"
          :class="[
            'toolbar-btn',
            isActive('underline') && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <span class="text-[11px] underline">U</span>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.strike')"
          :class="['toolbar-btn', isActive('strike') && 'toolbar-btn--active']"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <span class="text-[11px] line-through">S</span>
        </button>
      </div>

      <!-- Headings (block-level — whole paragraph) -->
      <div class="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
        <button
          type="button"
          :title="t('editor.toolbar.h1')"
          :class="[
            'toolbar-btn',
            isActive('heading', { level: 1 }) && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <span class="text-[10px] font-black">H1</span>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.h2')"
          :class="[
            'toolbar-btn',
            isActive('heading', { level: 2 }) && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <span class="text-[10px] font-black">H2</span>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.h3')"
          :class="[
            'toolbar-btn',
            isActive('heading', { level: 3 }) && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <span class="text-[10px] font-black">H3</span>
        </button>
      </div>

      <!-- Lists -->
      <div class="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
        <button
          type="button"
          :title="t('editor.toolbar.bulletList')"
          :class="[
            'toolbar-btn',
            isActive('bulletList') && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <line x1="9" y1="6" x2="20" y2="6" />
            <line x1="9" y1="12" x2="20" y2="12" />
            <line x1="9" y1="18" x2="20" y2="18" />
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.orderedList')"
          :class="[
            'toolbar-btn',
            isActive('orderedList') && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <line x1="10" y1="6" x2="20" y2="6" />
            <line x1="10" y1="12" x2="20" y2="12" />
            <line x1="10" y1="18" x2="20" y2="18" />
            <path
              d="M4 6h1M4 8h2M4 12h2M5 10v2M4 16h1.5a.5.5 0 010 1H4a.5.5 0 000 1h2"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          :title="t('editor.toolbar.blockquote')"
          :class="[
            'toolbar-btn',
            isActive('blockquote') && 'toolbar-btn--active',
          ]"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"
            />
          </svg>
        </button>
      </div>

      <!-- Link + color -->
      <div class="flex items-center gap-0.5 pr-2 mr-1 border-r border-border">
        <button
          type="button"
          :title="t('editor.toolbar.link')"
          :class="['toolbar-btn', isActive('link') && 'toolbar-btn--active']"
          @click="setLink"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div
          class="relative toolbar-btn p-0 overflow-hidden"
          :title="t('editor.toolbar.color')"
        >
          <input
            type="color"
            @input="
              (e) =>
                editor
                  .chain()
                  .focus()
                  .setColor((e.target as HTMLInputElement).value)
                  .run()
            "
            :value="editor.getAttributes('textStyle').color || '#000000'"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <svg
            class="w-3.5 h-3.5 pointer-events-none"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 3L4 20h3l1.5-4h7L17 20h3L12 3z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M8.5 14l3.5-9 3.5 9" stroke-linecap="round" />
          </svg>
        </div>
      </div>

      <!-- Misc -->
      <button
        type="button"
        :title="t('editor.toolbar.hr')"
        class="toolbar-btn"
        @click="editor.chain().focus().setHorizontalRule().run()"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      </button>
      <button
        type="button"
        :title="t('editor.toolbar.clearFormat')"
        class="toolbar-btn ml-auto"
        @click="editor.chain().focus().unsetAllMarks().clearNodes().run()"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Editor content -->
    <EditorContent
      :editor="editor"
      class="admin-tiptap-content p-5 min-h-[280px] outline-none"
    />
  </div>
</template>

<style>
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: var(--foreground);
  cursor: pointer;
  transition:
    background 0.1s,
    color 0.1s;
}
.toolbar-btn:hover {
  background: var(--muted);
}
.toolbar-btn--active {
  background: var(--foreground);
  color: var(--background);
}

.toolbar-select {
  height: 28px;
  padding: 0 6px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--foreground);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
  outline: none;
}
.toolbar-select:focus {
  border-color: var(--accent);
}

/* Editor typography */
.admin-tiptap-content .tiptap {
  outline: none !important;
}

.admin-tiptap-content .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--muted-foreground);
  pointer-events: none;
  height: 0;
}

.admin-tiptap-content .tiptap h1 {
  font-size: 1.75rem;
  font-weight: 900;
  margin: 1.25rem 0 0.5rem;
  line-height: 1.2;
}
.admin-tiptap-content .tiptap h2 {
  font-size: 1.35rem;
  font-weight: 900;
  margin: 1rem 0 0.4rem;
  line-height: 1.25;
}
.admin-tiptap-content .tiptap h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0.75rem 0 0.3rem;
}
.admin-tiptap-content .tiptap p {
  margin: 0.5rem 0;
  line-height: 1.7;
}
.admin-tiptap-content .tiptap ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.admin-tiptap-content .tiptap ol {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.admin-tiptap-content .tiptap li {
  margin: 0.2rem 0;
}
.admin-tiptap-content .tiptap blockquote {
  border-left: 3px solid var(--accent);
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: var(--muted-foreground);
  font-style: italic;
}
.admin-tiptap-content .tiptap hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1rem 0;
}
.admin-tiptap-content .tiptap a {
  color: #2563eb;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.dark .admin-tiptap-content .tiptap a {
  color: #60a5fa;
}
</style>
