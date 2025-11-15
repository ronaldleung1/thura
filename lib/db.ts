import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { pgTable, uuid, varchar, decimal, json, timestamp, text } from 'drizzle-orm/pg-core';

// Schema for user APIs
export const userApis = pgTable('user_apis', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  endpoint: text('endpoint').notNull(), // e.g., "https://api.mapbox.com/geocoding/v5/mapbox.places/{query}.json"
  apiKey: text('api_key').notNull(), // User's actual API key (would encrypt in production)
  httpMethod: varchar('http_method', { length: 10 }).notNull(), // "GET" or "POST"
  costPerCall: decimal('cost_per_call', { precision: 10, scale: 6 }).notNull(), // e.g., "0.0005"
  budgetLimit: decimal('budget_limit', { precision: 10, scale: 2 }).notNull(), // e.g., "5.00"
  spendAmount: decimal('spend_amount', { precision: 10, scale: 2 }).notNull().default('0'), // Tracks total spend
  parameterSchema: json('parameter_schema').notNull(), // e.g., { "query": "string", "limit": "number" }
  description: text('description').notNull(), // "Get lat/long for an address"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Initialize drizzle with Vercel Postgres
export const db = drizzle(sql);
