'use strict';

const jwt = require("jsonwebtoken");
const ResponseMessages = require("./authorizerRespMsgs");
const ServerlessClient = require("serverless-postgres");

const clientRead = new ServerlessClient({
  host: "fr-ms-auth-cluster.cluster-ro-c5gueqzmxskh.us-east-1.rds.amazonaws.com",
  user: "fr_auth",
  database: "fr_auth",
  password: "!Aworker2#",
  port: 5432,
  debug: Boolean(true),
  delayMs: Number(3000),
});

const localAuthorizer = async (event, context, callback) => {
  console.log("validation with local Authorizers ...")  
  try {
    // Decode token, it will throw exception if anything is wrong
    var decoded = jwt.verify(event.authorizationToken, process.env.JWT_SECRETE);
   
    console.log("authorizer email", decoded.email)

    // Connect to the db after jwt verify so if jwt failed it'll return response faster
    await clientRead.connect();

    let query = "SELECT * from users where email = '"+ decoded.email +"' AND status = '1'";
    let authUser = await clientRead.query(query);
    
    console.log("Is auth user exist? ", authUser.rows.length)
   
    // Throw exception if user does not exist
    if (!authUser.rows.length) throw new Error("Unauthorized")

    console.log("authorizer pass")

    // Lets grant the access
    return context.done(null, generatePolicy(decoded.id, 'Allow', event.methodArn, decoded))


  }
  catch (err) {

    let error = {
      error: err.name,
      messageString: ResponseMessages[err.name] || err.message
    }
    console.log("Authorization failed: ", error)
    context.done(null, generatePolicy('user', 'Deny', event.methodArn, error));

  }

};

/**
 * Generate policy
 * @param {string} principalId 
 * @param {string Allow|Deny} effect 
 * @param {string method arn} resource 
 * @param {object} context 
 * @returns {object}
 */
const generatePolicy = (principalId, effect, resource, context) => {
  let authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    let policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    let statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  if (context) authResponse.context = context;
  return authResponse;
};

module.exports = {localAuthorizer};

