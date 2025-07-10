import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/database/schema.ts",
    out: "./src/database/migrations",
    dialect: "mysql",
    dbCredentials: {
        host: process.env.DB_HOST || "localhost" as string,
        user: process.env.DB_USER || "root" as string,  
        password: process.env.DB_PASSWORD || "" as string,
        database: process.env.DB_NAME || "mmn3" as string
        // url: process.env.DB_URL || `mysql://root@localhost/mmn3` as string,
    },
    verbose: true,
    strict: true
});