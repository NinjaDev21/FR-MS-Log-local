"use strict";

module.exports.notfound = async (event, context, callback) => {
  callback(null, {
    statusCode: 404,
    body: '{ "Message": "Not found" }',
    headers: { "Content-Type": "application/json" },
  });
};
