import knex from "knex";
export const db = knex({
  client: "pg",
  connection: process.env.POSTGRES_CONNECTION_URL,
});
