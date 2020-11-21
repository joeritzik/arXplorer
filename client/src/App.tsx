/* eslint-disable no-unused-vars */
import './App.css';
import React, { FunctionComponent, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import Graph from './components/Graph';
import Home from './components/Home';
import Search from './components/Search';
import Navbar from './components/Navbar';
import ArticlesList from './components/ArticlesList';
import {
  Article,
  Author,
  Dictionary,
  DictionaryAuthorEntry,
  QueryFilter,
  ArxivMetadata,
} from './types/Dict';

import { GraphData } from './types/Graph';

import {
  fetchGraphData,
  removeAuthorFromGraph,
  updateArticlesList,
  updateAuthorData,
} from './services/ApiClient';
import { queryPathBuilder } from './services/apiHelpers';

const App: FunctionComponent = () => {
  const [authorDict, setAuthorDict] = useState<DictionaryAuthorEntry | {}>({});
  const [graphData, setGraphData] = useState<typeof Graph | {}>({});
  const [articleList, setArticleList] = useState<Article[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<string>('');
  const [emptySearch, setEmptySearch] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [tooLarge, setTooLarge] = useState<boolean>(false);

  const handleSearchForm = async (
    title: string,
    author: string,
    journal: string,
    abstract: string,
    filters?: QueryFilter
  ): Promise<boolean> => {
    const [query, searchFilters] = queryPathBuilder(
      title,
      author,
      journal,
      abstract,
      filters
    );
    setLoading(true);
    try {
      const [dict, data, articles] = await fetchGraphData(
        query as string,
        searchFilters as QueryFilter
      );
      if (data.links.length > 1000) {
        setTooLarge(true);
        setTimeout(() => setTooLarge(false), 5000);
      } else {
        setAuthorDict(() => dict);
        setGraphData((init) => {
          return {
            ...init,
            ...data,
          };
        });
        setArticleList(articles);
      }
      setLoading(false);
      return true;
    } catch (err) {
      setEmptySearch(true);
      setLoading(false);
      setTimeout(() => setEmptySearch(false), 5000);
      return false;
    }
  };

  const handleQuickSearch = (author: string) => {
    if (articleList.length === 0) {
      handleSearchForm('', author, '', '');
    } else {
      handleGraphExpand(author);
    }
  };

  const handleGraphExpand = async (author: string): Promise<void> => {
    const [query, _] = queryPathBuilder('', author);
    setLoading(true);
    try {
      const [dict, data, metadata, articles]:
        | boolean
        | [
            Article[] | Dictionary | GraphData[] | ArxivMetadata
          ] = await fetchGraphData(query);
      const [updatedDict, updatedData]: [
        Dictionary,
        GraphData
      ] = await updateAuthorData(
        authorDict as DictionaryAuthorEntry, // is this just authos?
        dict
      );

      const updatedArticles = await updateArticlesList(articleList, articles);
      setEmptySearch(false);
      setLoading(false);
      if (updatedData.links.length > 1000) {
        setTooLarge(true);
        setTimeout(() => setTooLarge(false), 5000);
      } else {
        setGraphData(updatedData);
        setAuthorDict(updatedDict);
        setArticleList(updatedArticles);
      }
    } catch (err) {
      setEmptySearch(true);
      setLoading(false);
      setTimeout(() => setEmptySearch(false), 5000);
    }
  };

  const removeSelectedAuthor = (author: string) => {
    setGraphData(() =>
      removeAuthorFromGraph(graphData as GraphData, author as string)
    );
    setSelectedAuthor('');
  };

  const killGraph = () => {
    setGraphData({});
    setAuthorDict({});
    setArticleList([]);
    setSelectedAuthor('');
  };

  return (
    <div className="App">
      <Navbar />
      <Switch>
        <Route exact path="/">
          <Home handleQuickSearch={handleQuickSearch} />
        </Route>
        <Route exact path="/search">
          <Search
            handleSearchForm={handleSearchForm}
            loading={loading}
            setSelectedAuthor={setSelectedAuthor}
          />
        </Route>
        <Route exact path="/graph">
          <Graph
            graphData={graphData}
            handleGraphExpand={handleGraphExpand}
            authorDict={authorDict}
            selectedAuthor={selectedAuthor}
            setSelectedAuthor={setSelectedAuthor}
            setSelectedArticle={setSelectedArticle}
            removeSelectedAuthor={removeSelectedAuthor}
            handleQuickSearch={handleQuickSearch}
            killGraph={killGraph}
            emptySearch={emptySearch}
            loading={loading}
            tooLarge={tooLarge}
            setTooLarge={setTooLarge}
          />
        </Route>
        <Route exact path="/list">
          <ArticlesList
            authorDict={authorDict}
            articleList={articleList}
            selectedAuthor={selectedAuthor}
            setSelectedAuthor={setSelectedAuthor}
            selectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
          />
        </Route>
      </Switch>
    </div>
  );
};

export default App;
