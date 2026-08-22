import { algoliasearch, type Algoliasearch } from "algoliasearch";

import {
  getAlgoliaAppId,
  getAlgoliaSearchApiKey,
  getAlgoliaWriteApiKey,
  isAlgoliaSearchConfigured,
  isAlgoliaWriteConfigured,
} from "./config";

let searchClient: Algoliasearch | undefined;
let writeClient: Algoliasearch | undefined;

export function getAlgoliaSearchClient(): Algoliasearch | null {
  if (!isAlgoliaSearchConfigured()) {
    return null;
  }

  if (!searchClient) {
    searchClient = algoliasearch(getAlgoliaAppId()!, getAlgoliaSearchApiKey()!);
  }

  return searchClient;
}

export function getAlgoliaWriteClient(): Algoliasearch | null {
  if (!isAlgoliaWriteConfigured()) {
    return null;
  }

  if (!writeClient) {
    writeClient = algoliasearch(getAlgoliaAppId()!, getAlgoliaWriteApiKey()!);
  }

  return writeClient;
}
