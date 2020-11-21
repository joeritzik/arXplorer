'use strict';
import fetch from 'node-fetch';
import { QueryFilter, ArxivMetadata, Article, Dictionary } from '../types/Dict';
import { GraphData } from '../types/Graph';

import {
  createAuthorDict,
  createNodesFromDict,
  createLinksFromDict,
  updateAuthorDict,
  addNewArticles,
  // deleteAuthorsFromDict,
} from './dataHelpers';

import { parseResponse } from './apiHelpers';

// interface FetchData(query: string, filters:? Filters) {
//   return {
//     value: parsed;
//   }
// }

// interface FetchData<T,S>(query: string, filters?: T) => {

// }
//define T when call the function

//type ApiResonse = X & X

//this should be 2 - should local storage and do a fetch request
//only fetch - no get and parse and test it

//TODO: look up local storage & type definitions convert all require to import from

async function fetchRequest(
  queryPath: string
): Promise<[Article[], ArxivMetadata]> {
  if (localStorage.getItem(queryPath))
    return JSON.parse(localStorage.getItem(queryPath)) as [
      Article[],
      ArxivMetadata
    ];
  const res = await fetch(queryPath); //replace with new function?
  const text = await res.text();
  const parsed = parseResponse(text);
  localStorage.setItem(queryPath, JSON.stringify(parsed));
  return parsed;
}

//see where fetched graph data is envoked

export async function fetchGraphData(
  query: string,
  filters?: QueryFilter
): Promise<[Dictionary | GraphData[] | ArxivMetadata | Article[]] | boolean> {
  const [articles, metadata] = await fetchRequest(query);
  if (articles) {
    const dict = createAuthorDict(articles, filters);
    const nodes = createNodesFromDict(dict);
    const links = createLinksFromDict(dict);
    return [dict, { nodes, links }, metadata, articles];
  }
  return false;
}

export async function updateAuthorData(
  oldDict: Dictionary,
  newDict: Dictionary
): Promise<[Dictionary, GraphData]> {
  const dict = updateAuthorDict(oldDict, newDict);
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}

export async function updateArticlesList(
  oldList: Article[],
  newList: Article[]
): Promise<Article[]> {
  return addNewArticles(oldList, newList);
}

export function removeAuthorFromGraph(
  graphData: GraphData,
  author: string
): GraphData {
  const nodes = [...graphData.nodes].filter((node) => node.id !== author);
  const links = [...graphData.links].filter(
    (link) => link.source !== author && link.target !== author
  );
  return { nodes, links };
}

export function shrinkGraph(
  oldDict: Dictionary
  // oldLinks: GraphLink[],
  // author: string
): [Dictionary, GraphData] {
  // const dict = deleteAuthorsFromDict(oldDict, oldLinks, author);
  const dict = oldDict;
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}
