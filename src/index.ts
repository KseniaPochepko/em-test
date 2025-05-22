import { App } from '@backend/app';

(async function main() {
  const app = new App();
  await app.init();
})();
