export interface ProductionFormStep<TDraft, TOriginal, TPayload = TDraft> {
  id: string;
  draft: TDraft;
  original: TOriginal | null;
  reset(): void;
  getChangedFields(): string[];
  extractPayload(): TPayload;
}
