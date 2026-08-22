export const DEFAULT_POSTS_INDEX = "posts";
export const DEFAULT_USERS_INDEX = "users";
export const POST_CONTENT_PREVIEW_LENGTH = 4000;

export function getAlgoliaAppId(value = process.env.ALGOLIA_APP_ID): string | undefined {
  return value?.trim() || undefined;
}

export function getAlgoliaSearchApiKey(
  value = process.env.ALGOLIA_SEARCH_API_KEY,
): string | undefined {
  return value?.trim() || undefined;
}

export function getAlgoliaWriteApiKey(
  value = process.env.ALGOLIA_WRITE_API_KEY ?? process.env.ALGOLIA_ADMIN_API_KEY,
): string | undefined {
  return value?.trim() || undefined;
}

export function isAlgoliaSearchConfigured(
  appId = getAlgoliaAppId(),
  apiKey = getAlgoliaSearchApiKey(),
): boolean {
  return Boolean(appId && apiKey);
}

export function isAlgoliaWriteConfigured(
  appId = getAlgoliaAppId(),
  apiKey = getAlgoliaWriteApiKey(),
): boolean {
  return Boolean(appId && apiKey);
}

export function isAlgoliaConfigured(
  appId = getAlgoliaAppId(),
  searchApiKey = getAlgoliaSearchApiKey(),
): boolean {
  return isAlgoliaSearchConfigured(appId, searchApiKey);
}

export function getPostsIndexName(value = process.env.ALGOLIA_POSTS_INDEX): string {
  return value?.trim() || DEFAULT_POSTS_INDEX;
}

export function getUsersIndexName(value = process.env.ALGOLIA_USERS_INDEX): string {
  return value?.trim() || DEFAULT_USERS_INDEX;
}
