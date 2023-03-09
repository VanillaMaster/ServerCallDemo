
/**
 * @typedef { (reason?: any) => void } rejectType
 * @typedef { (value: any) => void } resolveType
 * @typedef { { name: string; args: string; rejects: rejectType[]; resolves: resolveType[] } } task
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
     * @param { task } task 
     */
    async call(task) {
        let raw, data;
        try {
            raw = await fetch(`/API/1/${task.name}`, {
                body: task.args,
                method: "POST"
            });
            data = await raw.json();
        } catch (e) {
            for (const reject of task.rejects) reject(e);
            return;
        }

        for (const resolve of task.resolves) resolve(data);

    }

    #tick = CallQueue.#genericTcik.bind(this);

    /**@type { Map<string, task> } */
    #queue = new Map();
    #delay = 0;
    get delay(){
        return this.#delay;
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
            for (const task of this.#queue.values()) { this.call(task) }
            this.#queue.clear();
        }
    }

}