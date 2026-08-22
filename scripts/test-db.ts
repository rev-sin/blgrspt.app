import { testDatabase } from "../src/lib/db";

const res = await testDatabase();
console.log(res);
