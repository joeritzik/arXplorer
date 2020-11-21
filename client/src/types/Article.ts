import Category from './Category';
import { Link } from './Graph';
/// what is the date format on published

export default interface Article {
  title: string[];
  author: Author[];
  abstract: string;
  category: Category[];
  summary: string[];
  link: Link[];
  published: string[];
}

export type Author = {
  name: string;
};

//also known as Dict
export interface AuthorDict {
  id?: Author;
  articles: Article[];
  categories: Category[];
  collabs: Author[];
  expanded: boolean;
  ids: [string];
  main_cat: string;
}

export type Filters = {
  cat: any;
  //   cat: boolean | any;
};
