
/**
 * @typedef { (reason?: any) => void } rejectType
 * @typedef { (value: any) => void } resolveType
 * @typedef { { name: string; args: string; rejects: rejectType[]; resolves: resolveType[] } } callContainer
 */

export class CallQueue {
    constructor(){}

    static MINDELAY = 3;

    /**
     * @param { string } name 
     * @param { any[] } args 
     * @param { rejectType } resolve
     * @param { resolveType } reject
     */
    enqueue(name, args, resolve, reject){
        const argsStr = JSON.stringify(args);
        const key = `${name}:${argsStr}`;

        let container = this.#queue.get(key);
        if ( container == undefined) {
            container = {
                name: name,
                args: argsStr,
                rejects: [],
                resolves: []
            }
            this.#queue.set(key, container);
        }

        container.resolves.push(resolve);
        container.rejects.push(reject);

        if (this.#delay <= 0) {
            this.#delay = CallQueue.MINDELAY;
            queueMicrotask(this.#tick);
        }

    }

    /**
     * @this { CallQueue }
     */
    static #genericTcik(){
        this.#delay--;
        if (this.#delay > 0) {
            queueMicrotask(this.#tick);
        } else {
            console.log(`server call (${this.#queue.size})`);
            //make calls
            for (const value of this.#queue.values()) {
                fetch(`/API/1/${value.name}`, {
                    body: value.args,
                    method: "POST"
                }).then(async (raw)=>{
                    if (raw.ok) {
                        const resp = await raw.json();
                        for (const resolve of value.resolves) resolve(resp);
                    } else {
                        for (const reject of value.rejects) reject();
                    }
                })
            }
            this.#queue.clear();
        }
    }

    #tick = CallQueue.#genericTcik.bind(this);

    /**@type { Map<string, callContainer> } */
    #queue = new Map();
    #delay = 0;
    get delay(){
        return this.#delay;
    }
}