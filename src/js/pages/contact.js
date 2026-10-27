import { initShared } from "../main.js";

const cleanup = initShared(document);
if (import.meta.hot) import.meta.hot.dispose(cleanup);
