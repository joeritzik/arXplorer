'use strict';
const fetch = require('node-fetch');
import { Author } from '../types/Article';

const {
  createAuthorDict,
  createNodesFromDict,
  createLinksFromDict,
  updateAuthorDict,
  addNewArticles,
  deleteAuthorsFromDict,
} = require('./dataHelpers');

const { parseResponse } = require('./apiHelpers');

async function fetchRequest(queryPath: string) {
  if (localStorage.getItem(queryPath))
    return JSON.parse(localStorage.getItem(queryPath));
  const res = await fetch(queryPath);
  console.log(queryPath);
  const text = await res.text();
  const parsed = parseResponse(text);
  console.log(parsed);
  localStorage.setItem(queryPath, JSON.stringify(parsed));
  return parsed;
}

//see where fetched graph data is envoked
export async function fetchGraphData(query: string, filters) {
  const [articles, metadata] = await fetchRequest(query);
  if (articles) {
    const dict = createAuthorDict(articles, filters);
    const nodes = createNodesFromDict(dict);
    const links = createLinksFromDict(dict);
    return [dict, { nodes, links }, metadata, articles];
  }
  return false;
}

export async function updateAuthorData(oldDict, newDict) {
  const dict = updateAuthorDict(oldDict, newDict);
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}

export async function updateArticlesList(oldList, newList) {
  return addNewArticles(oldList, newList);
}

export function removeAuthorFromGraph(graphData, author: Author) {
  const nodes = [...graphData.nodes].filter((node) => node.id !== author);
  const links = [...graphData.links].filter(
    (link) => link.source !== author && link.target !== author
  );
  return { nodes, links };
}

export function shrinkGraph(oldDict, oldLinks, author) {
  const dict = deleteAuthorsFromDict(oldDict, oldLinks, author);
  const nodes = createNodesFromDict(dict);
  const links = createLinksFromDict(dict);
  return [dict, { nodes, links }];
}
