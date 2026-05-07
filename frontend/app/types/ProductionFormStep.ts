export interface ProductionFormStep<TDraft, TOriginal, TPayload = TDraft> {
  reset(draft: TDraft, original: TOriginal | null): void;

  getChangedFields(draft: TDraft, original: TOriginal | null): string[];

  extractPayload(draft: TDraft, original: TOriginal | null): TPayload;
}
