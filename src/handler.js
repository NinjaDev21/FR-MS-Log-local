"use strict";
const { Response, Exception, config } = require("../libs");
var path = require("path");
var fs = require("fs");
const { mongo } = require("fr-mongodb");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  region: process.env.REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});
/**
 * Function to crete and update user log file
 * @param {*} event 
 * @param {*} context 
 * @returns 
 */
const updateLog = async (event, context) => {
  let response;
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    if (!event.body.logMessage) {
      throw new Exception.BadRequest("logMessage is required!");
    }
    let now = new Date().toISOString().slice(0, 19).replace("T", " ");
    let auth = event.requestContext.authorizer;
    const date = new Date(now);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const bucketName = process.env.AWS_BUCKET;
    const uploadPath = 'logs/';
    const fileName = event.body.fbUserId + "_" + month + "_" + year + ".log";
    if (!event.body.fbUserId) {
      fileName = Number(auth.id) + "_" + month + "_" + year + ".log";
    }
    let existingContent = '';
    try {
      // Attempt to get the existing content of the file
      const getObjectResponse = await s3.getObject({ Bucket: bucketName, Key: uploadPath + fileName }).promise();
      existingContent = getObjectResponse.Body.toString('utf-8');
    } catch (error) {
      // Handle the case where the file doesn't exist
      if (error.code === 'NoSuchKey') {
        // Create the file if it doesn't exist
        let fileObject = await s3.putObject({
          Bucket: bucketName,
          Key: uploadPath + fileName,
          Body: '',
        }).promise();
      } else {
        // Handle other errors
        throw error;
      }
    }
    // Modify the content or append to it as needed
    const newContent = existingContent + '\n' + now + " " + event.body.logMessage;
    // Update the file in S3 with the new content
    let fileObject = await s3.putObject({
      Bucket: bucketName,
      Key: uploadPath + fileName,
      Body: newContent,
    }).promise();
    let fileUrl = `https://s3.amazonaws.com/${bucketName}/${uploadPath}${fileName}`
    let payload = {
      statusCode: 200,
      body: 'File uploaded successfully!',
      fileUrl: fileUrl
    };
    response = await Response.success(payload);
  } catch (e) {
    console.log("error", e);
    response = await Response.failure(e.message, e.status);
  }

  return response;
}

module.exports = {
  updateLog
};
