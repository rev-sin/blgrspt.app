import { eq } from "drizzle-orm";

import { db } from "$lib/db";
import { post, user } from "$lib/db/schema";

import { getAlgoliaSearchClient, getAlgoliaWriteClient } from "./client";
import { getPostsIndexName, getUsersIndexName } from "./config";
//  isAlgoliaConfigured
import { highlightFromResult, type PostHighlight } from "./highlight";
import {
  toPostSearchRecord,
  toUserSearchRecord,
  type PostSearchRecordInput,
  type UserSearchRecordInput,
} from "./records";
import { lookupSearchParams, postsIndexSettings, usersIndexSettings } from "./settings";

const postIndexColumns = {
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  tags: post.tags,
  status: post.status,
  visibility: post.visibility,
  authorId: post.authorId,
  authorName: user.name,
  authorEmail: user.email,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  publishedAt: post.publishedAt,
};

// export { isAlgoliaConfigured };

export async function indexPostById(postId: string) {
  const client = getAlgoliaWriteClient();

  if (!client) {
    return;
  }

  const [existing] = await db
    .select(postIndexColumns)
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id))
    .where(eq(post.id, postId))
    .limit(1);

  if (!existing) {
    return;
  }

  await savePostRecord(existing);
}

export async function savePostRecord(input: PostSearchRecordInput) {
  const client = getAlgoliaWriteClient();

  if (!client) {
    return;
  }

  try {
    await client.saveObject({
      indexName: getPostsIndexName(),
      body: toPostSearchRecord(input),
    });
  } catch (error) {
    console.error("ALGOLIA POST INDEX ERROR:", error);
  }
}

export async function removePostFromIndex(postId: string) {
  const client = getAlgoliaWriteClient();

  if (!client) {
    return;
  }

  try {
    await client.deleteObject({
      indexName: getPostsIndexName(),
      objectID: postId,
    });
  } catch (error) {
    console.error("ALGOLIA POST DELETE ERROR:", error);
  }
}

export async function saveUserRecord(input: UserSearchRecordInput) {
  const client = getAlgoliaWriteClient();

  if (!client) {
    return;
  }

  try {
    await client.saveObject({
      indexName: getUsersIndexName(),
      body: toUserSearchRecord(input),
    });
  } catch (error) {
    console.error("ALGOLIA USER INDEX ERROR:", error);
  }
}

export async function searchIndexIds(options: {
  indexName: string;
  query: string;
  page: number;
  hitsPerPage: number;
  filters?: string;
  numericFilters?: string[];
}) {
  const client = getAlgoliaSearchClient();

  if (!client) {
    return null;
  }

  const result = await client.searchSingleIndex({
    indexName: options.indexName,
    searchParams: {
      ...lookupSearchParams,
      query: options.query,
      page: options.page,
      hitsPerPage: options.hitsPerPage,
      filters: options.filters,
      numericFilters: options.numericFilters,
    },
  });

  const highlights = new Map<string, PostHighlight>();

  for (const hit of result.hits) {
    const objectID = String(hit.objectID);
    const highlight = highlightFromResult(
      (hit._highlightResult as Parameters<typeof highlightFromResult>[0] | undefined) ?? {},
    );

    if (highlight) {
      highlights.set(objectID, highlight);
    }
  }

  return {
    objectIDs: result.hits.map((hit) => String(hit.objectID)),
    total: result.nbHits ?? result.hits.length,
    totalPages: result.nbPages ?? 1,
    highlights,
  };
}

export async function reindexAllSearchRecords() {
  const client = getAlgoliaWriteClient();

  if (!client) {
    throw new Error("Algolia write API key is not configured");
  }

  const postsIndex = getPostsIndexName();
  const usersIndex = getUsersIndexName();

  const posts = await db
    .select(postIndexColumns)
    .from(post)
    .innerJoin(user, eq(post.authorId, user.id));

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
    .from(user);

  try {
    await client.setSettings({
      indexName: postsIndex,
      indexSettings: postsIndexSettings,
    });

    await client.setSettings({
      indexName: usersIndex,
      indexSettings: usersIndexSettings,
    });
  } catch (error) {
    console.error("ALGOLIA INDEX SETTINGS ERROR:", error);
  }

  await client.replaceAllObjects({
    indexName: postsIndex,
    objects: posts.map(toPostSearchRecord),
  });

  await client.replaceAllObjects({
    indexName: usersIndex,
    objects: users.map(toUserSearchRecord),
  });

  return {
    posts: posts.length,
    users: users.length,
  };
}
