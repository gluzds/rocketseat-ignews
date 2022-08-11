import faunadb, { Client } from 'faunadb';

export const fauna = new faunadb.Client({
  secret: process.env.FAUNA_KEY,
  domain: 'db.us.fauna.com'
})