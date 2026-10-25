import tailwindcss from '@tailwindcss/vite';
import shopifyDevtools, { shopifyDevtoolsConfig } from '@display-studio/vite-plugin-shopify-devtools';
import shopify from '@display-studio/vite-plugin-shopify-theme';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

const ts = 'frontend/entrypoints/ts';
const css = 'frontend/entrypoints/css';

export default defineConfig({
  devtools: shopifyDevtoolsConfig,
  plugins: [
    shopify({
      entries: {
        'main.css': `${css}/main.css`,
        'theme.ts': `${ts}/theme.ts`,
        'index.ts': `${ts}/index.ts`,
        'product.ts': `${ts}/product.ts`,
        'collection.ts': `${ts}/collection.ts`,
        'list-collections.ts': `${ts}/list-collections.ts`,
        'cart.ts': `${ts}/cart.ts`,
        'search.ts': `${ts}/search.ts`,
        'blog.ts': `${ts}/blog.ts`,
        'article.ts': `${ts}/article.ts`,
        'page.ts': `${ts}/page.ts`,
        '404.ts': `${ts}/404.ts`,
        'password.ts': `${ts}/password.ts`,
        'gift-card.ts': `${ts}/gift-card.ts`,
      },
    }),
    tailwindcss(),
    shopifyDevtools({ instrument: 'copy' }),
  ],
  build: {
    cssMinify: 'esbuild',
  },
  resolve: {
    alias: {
      '@ts': fileURLToPath(new URL(`./${ts}`, import.meta.url)),
      '@css': fileURLToPath(new URL(`./${css}`, import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
