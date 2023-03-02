import Fastify from 'fastify'
import path from 'path';
import FastifyStatic from "@fastify/static";

import { fileURLToPath } from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

//import { API } from "../shared/APIContextProvider.js";
import { API } from "./API/index.js";

const fastify = Fastify({logger: false});

fastify.register(FastifyStatic, {
  root: path.join(__dirname, '../client'),
  prefix: '/client/',
})

fastify.register(FastifyStatic, {
  root: path.join(__dirname, '../shared'),
  prefix: '/shared/',
  decorateReply: false
})

for (const key in API) {
  console.log(key);
  fastify.post(`/API/1/${key}`, function (req, reply) {
    if (typeof req.body === "string") {
      const args = JSON.parse(req.body);
      reply.send( API[key](...args) );
    }
    reply.send(null);
  })
}

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
})