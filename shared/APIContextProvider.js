/** @type { import("../client/src/API.client.js").API } */
export const API = (typeof window === 'undefined')?
(await import("../server/API/index.js")).API:// node
(await import("../client/src/API.client.js")).API;// browser