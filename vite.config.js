import { defineConfig } from 'vite';

/**
 * CSP hanya disuntikkan saat build agar Vite dev (HMR/WebSocket) tidak terganggu.
 * modulepreload polyfill dimatikan supaya tidak ada inline script di dist/.
 */
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
  },
  plugins: [
    {
      name: 'costestant-csp',
      apply: 'build',
      transformIndexHtml(html) {
        const meta = `    <meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`;
        return html.replace('<head>', `<head>\n${meta}`);
      },
    },
  ],
});
