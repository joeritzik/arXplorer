import { categoriesDict } from './categories';
import { Html5Entities } from 'html-entities';
const htmlEntities = new Html5Entities();
import {
  Article,
  QueryFilter,
  DictionaryAuthorEntry,
  Dictionary,
  Author,
  ArxivNode,
  CategoryReference,
  ArxivCategory,
} from '../types/Dict';
import { GraphLink, GraphNode } from '../types/Graph';

export const createAuthorDict = (
  articles: Article[],
  filters = {}
): Dictionary => {
  const dict: Dictionary = {};
  articles.forEach((article) => {
    if (
      filterArticleByDate(article, filters) &&
      filterArticleBySubject(article, filters)
    ) {
      const aID = getArticleId(article);
      const collabs = article.author.map((auth: Author) => auth.name).flat();
      const categories = getValidCategoriesFromArticle(article);

      collabs.forEach((author: string) => {
        if (dict[author]) {
          if (!dict[author].ids.includes(aID)) {
            dict[author].ids.push(aID);
            dict[author].articles.push(article);
            dict[author].collabs.push(
              ...collabs.filter(
                (au) => !dict[author].collabs.includes(au) && au !== author
              )
            );
            setCategoryProperties(dict, author, categories);
          }
        } else {
          dict[author] = {
            collabs: [...collabs.filter((au) => au !== author)],
            ids: [aID],
            articles: [article],
            expanded: false,
            main_cat: categories[0],
            categories: {},
          };
          categories.forEach(
            (cat: string) => (dict[author].categories[cat] = 1)
          );
        }
      });
    }
  });
  return dict;
};

export function createNodesFromDict(dict: Dictionary): GraphNode[] {
  const nodes: GraphNode[] = [];
  const colorDict = calculateGroupsFromCategories(dict);
  for (const author in dict) {
    const main_cat = dict[author].main_cat;
    nodes.push({
      id: author,
      weight: dict[author].collabs.length,
      group: colorDict[main_cat],
      cat: main_cat,
      cat_name: categoriesDict[main_cat],
    });
  }
  return nodes;
}

export function createLinksFromDict(dict: Dictionary): GraphLink[] {
  const links: GraphLink[] = [];
  for (const author in dict) {
    dict[author].collabs
      .map((co: string) => ({
        source: author,
        target: co,
      }))
      .forEach((el) => {
        if (links.filter((li) => linkExists(li, el)).length === 0) {
          links.push(el);
        }
      });
  }
  return links;
}

function linkExists(arrOne: GraphLink, arrTwo: GraphLink) {
  return (
    (arrOne.source === arrTwo.source && arrOne.target === arrTwo.target) ||
    (arrOne.source === arrTwo.target && arrOne.target === arrTwo.source)
  );
}

export function updateAuthorDict(
  oldDict: Dictionary,
  newDict: Dictionary
): Dictionary {
  const dict = Object.assign({}, oldDict);
  for (const key in newDict) {
    if (!dict[key]) {
      dict[key] = newDict[key];
    } else {
      newDict[key].articles.forEach((ar) => {
        const aID = getArticleId(ar);
        if (!dict[key].ids.includes(aID)) {
          dict[key].ids.push(aID);
          dict[key].articles.push(ar);

          const categories = getValidCategoriesFromArticle(ar);
          setCategoryProperties(dict, key, categories);
        }
      });
      newDict[key].collabs.forEach((col) => {
        !dict[key].collabs.includes(col) && dict[key].collabs.push(col);
      });
    }
  }
  return dict;
}

export function addNewArticles(prev: Article[], newList: Article[]): Article[] {
  const toAdd: Article[] = [];
  newList.forEach((ar) => {
    prev.filter((old) => old.id[0] === ar.id[0]).length === 0 && toAdd.push(ar);
  });
  return [...prev, ...toAdd];
}

export const sortArticleList = (
  arr: Article[],
  order = 'newest'
): Article[] => {
  return order === 'newest'
    ? [...arr].sort((a, b) => new Date(b.published) - new Date(a.published))
    : [...arr].sort((a, b) => new Date(a.published) - new Date(b.published));
};

export const getArticleId = (article: Article): string =>
  article.id[0].replace('http://arxiv.org/abs/', '');

export const parseGreekLetters = (str: string): string => {
  const parsedStr = str
    .replace(/(\\emph)/g, '')
    .replace(/(\\mathsf)/g, '')
    .replace(/(\$\\)/g, '&')
    .replace(/\$/g, ';')
    .replace(/\{|\}/g, '')
    .replace(/(;*;)/g, '')
    .replace(/\^/g, '&sup');
  return htmlEntities.decode(parsedStr);
};

function getValidCategoriesFromArticle(array: Article) {
  return array.category
    .map((cat: ArxivNode<ArxivCategory> | undefined) => {
      categoriesDict[cat.$.term] ? cat.$.term : undefined;
    })
    .flat()
    .filter((cat) => cat !== undefined);
}

function setCategoryProperties(
  dict: Dictionary,
  key: string,
  categoriesArray: []
): void {
  categoriesArray.forEach((cat: string) => {
    const main_cat: string = dict[key].main_cat;
    if (dict[key].categories[cat]) {
      dict[key].categories[cat]++;
      if (dict[key].categories[cat] > dict[key].categories[main_cat]) {
        dict[key].main_cat = cat;
      }
    } else {
      dict[key].categories[cat] = 1;
    }
  });
}

function calculateGroupsFromCategories(dict: Dictionary): CategoryReference {
  const cats: CategoryReference = {};
  let counter = 1;
  for (const key in dict) {
    const cat = dict[key].main_cat;
    if (!cats[cat]) {
      cats[cat] = counter;
      counter++;
    }
  }
  return cats;
}

function filterArticleByDate(article: Article, filters) {
  if (!filters['date-from'] || !filters['date-to']) return true;
  const articleDate = new Date(article.published);
  return articleDate > filters['date-from'] && articleDate < filters['date-to'];
}

function filterArticleBySubject(article: Article, filters: string[]): boolean {
  const subjects: string[] = Object.keys(filters).filter(
    (cat: string) => filters[cat] === true
  );
  if (subjects.length === 0) return true;
  return (
    article.category.filter((arCat: ArxivNode<ArxivCategory>) => {
      const i: number = arCat.$.term.indexOf('.');
      return subjects.includes(arCat.$.term.slice(0, i));
    }).length > 0
  );
}
