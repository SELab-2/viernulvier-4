import type { Ref } from "vue";

export interface ProductionFormStep<TDraft, TOriginal, TPayload = TDraft> {
  id: string;
  draft: Ref<TDraft>;
  original: Ref<TOriginal | null>;
  initialize(context: { mode: "create" | "edit"; id?: string }): Promise<void>;
  reset(): void;
  getChangedFields(): string[];
  extractPayload(): TPayload;
}
