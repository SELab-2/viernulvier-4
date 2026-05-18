export interface SearchSuggestion {
  display: string;
  context?: string;
  searchValue: string;
  association?: SearchAssociation;
}

export enum SearchAssociation {
  Production,
  Blog,
  Print,
}
