# Playwright base image ships Chromium plus every OS dependency it needs,
# which the Road Trip Map Maker uses for server-side print rendering.
# Keep this tag in sync with the "playwright" version in package.json.
FROM mcr.microsoft.com/playwright:v1.49.1-jammy

WORKDIR /app

ENV NODE_ENV=production \
    # Browsers are already baked into the image at /ms-playwright.
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY lib ./lib
COPY website ./website

EXPOSE 3000

CMD ["node", "server.js"]
