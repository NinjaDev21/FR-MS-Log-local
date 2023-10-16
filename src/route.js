"use strict";
const middy = require("middy");
const { cors, httpErrorHandler, jsonBodyParser } = require("middy/middlewares");
const messages = require("./handler");
const { mongo } = require("fr-mongodb");
// route endpoints
const updateLogPath = '/update-log';
const routes = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let httpMethod = event.httpMethod;
  let path = event.path;
  let splitPath = path.split('/');
  if (splitPath[1] == 'fetch-group' || splitPath[1] == 'fetch-segment' || splitPath[1] == 'fetch-segments' || splitPath[1] == 'fetch-groups') {
    path = event.path.replace(/\/[^/]*$/, '')
  }
  switch (true) {
    case httpMethod === "POST" && path === updateLogPath:
      try {
        return await messages.updateLog(event, context);
      } catch (e) {
        throw new Error("Error while compose a message : " + e.message);
      }

  }
};

const handler = middy(routes)
  .use(cors())
  .use(httpErrorHandler())
  .use(jsonBodyParser());

module.exports = { handler };
