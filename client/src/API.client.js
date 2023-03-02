import { CallQueue } from "./CallQueue.js";

/**
 * @template { (...args: any) => any } T
 * @typedef { (...args: Parameters<T>) => ReturnType<T> extends infer U extends Promise<any> ? U : Promise<ReturnType<T>> } AsyncWrapper
 */
/**
 * @typedef { import("../../server/API/index.js")["API"] } ServerAPI
 * @typedef { { [K in keyof ServerAPI]: AsyncWrapper<ServerAPI[K]> } } API
 */

export const queue = new CallQueue();

export const API = /**@type { API } */ (new Proxy(/**@type {Partial<API>}*/({}), {
    /**
     * @template { keyof API } K
     * @param { K } prop
     * @returns { API[K] }
     */
    get(target, prop) {
        const resp = target[prop];
        if (resp) { return resp; }

        return target[prop] =
        /**
         * @param  {...any} args 
         */
        (...args) => new Promise((resolve, reject)=>{ queue.enqueue(prop, args, resolve, reject); });
    }
}))

