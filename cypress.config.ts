import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'f88nv7',
  e2e: {
    baseUrl: 'http://localhost:8000',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: false,
  },
});
