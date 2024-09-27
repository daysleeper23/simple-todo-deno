const portConfig = { port: 7777 };
const todos = [{item: "name"}];

const handleGetRoot = async (_request) => {
  return new Response("Hello world!");
};

const handleGetFavicon = async (_request) => {
  return new Response("Hello world! No favicon!");
};

const handleGetTodos = async (_request) => {
  return Response.json(todos)
}

const handlePostTodo = async (request) => {

  try {
    const todo = await request.json()
    console.log('item', todo)
    if (!todo.item) {
      return new Response("Bad request", { status: 400 })
    }
    todos.push(todo);
    return new Response("OK", { status: 200 })
  }
  catch(error) {
    return new Response("Bad request", { status: 400 })
  }
}

const urlMapping = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handleGetTodos,
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/todos" }),
    fn: handlePostTodo,
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/favicon.ico"}),
    fn: handleGetFavicon
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    fn: handleGetRoot,
  },
];

const handleRequest = async (request) => {
  const mapping = await urlMapping.find(url =>
    url.method === request.method && url.pattern.test(request.url)
  )

  if (!mapping) {
    return new Response("Not found", { status: 404 })
  }

  const mappingResult = mapping.pattern.exec(request.url)
  return await mapping.fn(request, mappingResult)
}

const handleHttpConnection = async (conn) => {
  for await (const requestEvent of Deno.serveHttp(conn)) {
    requestEvent.respondWith(await handleRequest(requestEvent.request));
  }
}

for await (const conn of Deno.listen(portConfig)) {
  handleHttpConnection(conn)
}

Deno.serve(portConfig, handleRequest);