// Require the framework and instantiate it
const fastify = require('fastify')()
const now = require('fastify-now');
const path = require("path");

fastify.register(require("fastify-cors"), {
  origin: "*",
  methods: ["POST", "GET", "PUT", "DELETE"]
});

fastify.register(now, {
    routesFolder: path.join(__dirname, './routes'),
});

// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    console.log(err)
    process.exit(1)
  }
}
start()