import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { writeFileSync } from "fs";

export default defineConfig({
    plugins: [
        react(),
        {
            name: "copy-htaccess",
            closeBundle() {
                // Copia el archivo .htaccess a la carpeta dist
                const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>`;
                writeFileSync("dist/.htaccess", htaccessContent);
            },
        },
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: "dist",
        assetsDir: "assets",
        emptyOutDir: true,
        sourcemap: false,
    },
    base: "/",
});
