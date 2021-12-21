import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
export const constants = {
  __filename: fileURLToPath(import.meta.url),
  __dirname: dirname(fileURLToPath(import.meta.url)),
};
// console.log(constants);
// console.log(resolve());
