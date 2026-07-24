import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default {
  root: 'public',
  cacheDir: '../node_modules/.vite',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'scripts/pages/**/*.html', dest: '.' },
        {
          // logo.png is already emitted (hashed) via index.html's <img> tag, so
          // it's excluded here. icon.png is kept: it's also referenced by its
          // stable, unhashed path from app.webmanifest's `icons[0].src`, which
          // Vite doesn't parse/rewrite, so that raw copy is load-bearing.
          src: ['images/*', '!images/logo.png', '!images/.DS_Store'],
          dest: '.',
        },
      ],
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    fileParallelism: false,
    setupFiles: ['./vitest.setup.js'],
    include: ['**/*.test.js'],
    exclude: ['e2e/**'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    css: false, // disable CSS processing to quiet warnings
  },
};
