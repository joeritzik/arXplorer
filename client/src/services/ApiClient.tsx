'use strict';
const fetch = require('node-fetch');
import Article, { AuthorDict, Author, Filters } from '../types/Article';
import Graph, { Link, Node } from '../types/Graph';
// import { Author, Filters } from '../types/Article';

const {
  createAuthorDict,
  createNodesFromDict,
  createLinksFromDict,
  updateAuthorDict,
  addNewArticles,
  deleteAuthorsFromDict,
} = require('./dataHelpers');

const { parseResponse } = require('./apiHelpers');

// interface FetchData(query: string, filters:? Filters) {
//   return {
//     value: parsed;
//   }
// }
interface FetchData<T,S>(query: string, filters?: T) => {
  (val: T): boolean;
}



async function fetchRequest(queryPath: string): Promise<string | null>  {
  if (localStorage.getItem(queryPath))
    return JSON.parse(localStorage.getItem(queryPath));
  const res = await fetch(queryPath);
  const text = await res.text();
  const parsed = parseResponse(text);
  localStorage.setItem(queryPath, JSON.stringify(parsed));
  return parsed;
}

//see where fetched graph data is envoked

export async function fetchGraphData<T>(query: string, filters: Filters): Promise<AuthorDict | boolean | Node | Link > {
  const [articles, metadata] = await fetchRequest(query);
  if (articles) {
    const dict = createAuthorDict(articles, filters);
    const nodes = createNodesFromDict(dict);
    const links = createLinksFromDict(dict);
    return [dict, { nodes, links }, metadata, articles];
  }
  return false;
}

export async function updateAuthorData(oldDict: AuthorDict, newDict: AuthorDict) {
  const dict = updateAuthorDict(oldDict, newDict);
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}

export async function updateArticlesList(oldList: Article[], newList: Article[]): Promise<boolean> {
  return addNewArticles(oldList, newList);
}

export function removeAuthorFromGraph(graphData: Graph, author: Author) {
  const nodes = [...graphData.nodes].filter((node) => node.id !== author);
  const links = [...graphData.links].filter(
    (link) => link.source !== author && link.target !== author
  );
  return { nodes, links };
}

export function shrinkGraph(oldDict, oldLinks, author: Author) {
  const dict = deleteAuthorsFromDict(oldDict, oldLinks, author);
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}
