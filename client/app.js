//import { API } from "../shared/APIContextProvider.js"
import { API } from "./src/API.client.js";

API.func1(1,1).then(console.log);
API.func1(1,1).then(console.log);
API.func2(2,1).then(console.log);

queueMicrotask(()=>{
    queueMicrotask(()=>{
        queueMicrotask(()=>{
            API.func1(1,2).then(console.log);
        })
    })
})