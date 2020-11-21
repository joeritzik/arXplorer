export interface QueryFilter {
  cs?: boolean;
  physics?: boolean;
  math?: boolean;
  eess?: boolean;
  econ?: boolean;
  'q-bio'?: boolean;
  'q-fin'?: boolean;
  stat?: boolean;
  'date-from'?: string;
  'date-to'?: string;
}
export interface CategoryReference {
  [key: string]: number;
}
export interface Author {
  name: string[];
}
// follows after $
export type ArxivNode<T> = { $?: T };
export interface ArxivSchemaDescription {
  'xmlns:arxiv'?: string;
  scheme?: string;
}
export interface ArxivOpenSearchDescription {
  'xmlns:opensearch': string;
}
export interface ArxivComment extends ArxivNode<ArxivSchemaDescription> {
  _: string;
}
export interface OpenSearchResponse
  extends ArxivNode<ArxivOpenSearchDescription> {
  _: string;
}
export interface ArxivTypedObject {
  type: string;
}
export interface ArxivTitleMetadata extends ArxivNode<ArxivTypedObject> {
  _: string;
}
export interface ArxivCategory extends ArxivSchemaDescription {
  term: string;
}
export interface ArxivLink {
  href: string;
  rel: string;
  title: string;
}
export interface Article {
  'arxiv:comment'?: ArxivComment[];
  'arxiv:doi'?: ArxivComment[];
  'arxiv:journal_ref'?: ArxivComment[];
  'arxiv:primary_category': ArxivNode<ArxivCategory>[];
  author: Author[];
  category: ArxivNode<ArxivCategory>[];
  id: string[];
  link: ArxivNode<ArxivLink>[];
  // published: string[];
  published: string | number | Date;
  summary: string[];
  title: string[];
  updated: string[];
}
export interface ArxivMetadata extends ArxivNode<ArxivSchemaDescription> {
  id: string[];
  link: ArxivNode<ArxivLink>[];
  'opensearch:itemsPerPage': OpenSearchResponse[];
  'opensearch:startIndex': OpenSearchResponse[];
  'opensearch:totalResults': OpenSearchResponse[];
  title: ArxivTitleMetadata[];
  updated: string[];
}
export interface DictionaryAuthorEntry {
  articles: Article[];
  categories: CategoryReference;
  collabs: string[];
  expanded: boolean;
  ids: string[];
  main_cat: string;
}
export interface Dictionary {
  [key: string]: DictionaryAuthorEntry;
}
