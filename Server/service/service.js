import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const readFile = (path) => require(path);
export default readFile;
