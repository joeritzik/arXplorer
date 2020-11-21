/* eslint-disable no-unused-vars */
'use strict';

import { ArxivMetadata, Article, QueryFilter } from '../types/Dict';

import { parseString } from 'xml2js';
// import { Response } from 'node-fetch';
const BASE_URL = 'https://export.arxiv.org/api/';

const queryPositions: QueryPositions = { 0: 'ti', 1: 'au', 2: 'jr', 3: 'abs' };

type QueryPositions = {
  [key: number]: string;
};
export function queryPathBuilder(
  title = '',
  author = '',
  journal = '',
  abstract = '',
  filters = {}
): [string, QueryFilter] {
  let queryUrl = BASE_URL + 'query?search_query=';
  queryUrl += [title, author, journal, abstract]
    .map(
      (arg, i) => arg && `${queryPositions[i]}:%22${arg.replace(/\s/g, '+')}%22`
    )
    .filter((a) => a !== '')
    .join('+AND+');
  queryUrl += '&start=0&max_results=25';
  return [queryUrl, filters];
}

export function parseResponse(res: string): [Article[], ArxivMetadata] {
  const metadata: any = {};
  let articles: Article[] = [];
  parseString(res, function (err: Error, result) {
    if (err) throw err;
    Object.assign(metadata, result.feed);
    delete metadata.entry;
    articles = result.feed.entry;
  });
  return [articles, metadata];
}
