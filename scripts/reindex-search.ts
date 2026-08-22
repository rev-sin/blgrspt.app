import { reindexAllSearchRecords } from "../src/lib/search/sync";

const result = await reindexAllSearchRecords();

console.log(`Indexed ${result.posts} posts and ${result.users} users`);
