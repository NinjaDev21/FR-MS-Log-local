let response = {};

response.success = async message => {
  return {
    body: JSON.stringify(message),
    statusCode: 200
  }
}

response.failure = async (message, statusCode) => {
  if (!statusCode || statusCode === 500 || typeof statusCode === "undefined") {
    statusCode = 500;    
  }
  if(!message){
    message = "Something went wrong";
  }
  return {
    body: JSON.stringify(message),
    statusCode: statusCode
  }
}

module.exports = response;