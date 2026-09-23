// Quick live check of the user's Supabase cloud DB via the local TCP forwarder
import { SQL } from "bun";

const url = "postgres://postgres.uvnuhhazklixymhtcshq:mm4you%2C%2CA..@127.0.0.1:6543/postgres";
const sql = new SQL(url, { max: 1, tls: { rejectUnauthorized: false } });

const rows = await sql`
  SELECT
    (SELECT count(*) FROM "Product" WHERE "published" = true)  AS published_products,
    (SELECT count(*) FROM "Product")                          AS total_products,
    (SELECT count(*) FROM "ProductVariant")                   AS variants,
    (SELECT count(*) FROM "ProductImage")                     AS images,
    (SELECT count(*) FROM "Category")                         AS categories,
    (SELECT count(*) FROM "User" WHERE role = 'ADMIN')        AS admins
`;
console.log("CLOUD DB LIVE STATUS:", rows[0]);

const sample = await sql`
  SELECT p.name, p."published" AS active, p.price
  FROM "Product" p WHERE p."published" = true
  ORDER BY p."createdAt" DESC LIMIT 3
`;
console.log("SAMPLE ACTIVE PRODUCTS:", sample);

await sql.end();
process.exit(0);
