"use strict";
const { Response } = require("../libs");
var path = require("path");
var fs = require("fs");
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
      throw new Error("logMessage is required!");
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const auth = event.requestContext.authorizer;
    const date = new Date(now);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const bucketName = process.env.AWS_BUCKET;
    const uploadPath = 'logs/';
    let fileName = event.body.fbUserId
      ? `${event.body.fbUserId}_${month}_${year}.log`
      : `${Number(auth.id)}_${month}_${year}.log`;

    let existingContent = '';

    try {
      const getObjectResponse = await s3.getObject({ Bucket: bucketName, Key: uploadPath + fileName }).promise();
      existingContent = getObjectResponse.Body.toString('utf-8');
    } catch (error) {
      if (error.code !== 'NoSuchKey') {
        throw error;
      }
    }

    const newContent = existingContent + '\n' + now + ' ' + event.body.logMessage;

    await s3.putObject({
      Bucket: bucketName,
      Key: uploadPath + fileName,
      Body: newContent,
    }).promise();

    const fileUrl = `https://s3.amazonaws.com/${bucketName}/${uploadPath}${fileName}`;
    const payload = {
      body: 'File uploaded successfully!',
      fileUrl: fileUrl,
    };
    response = await Response.success(payload);
  } catch (e) {
    console.log("error", e);
    response = await Response.failure(e.message, e.status);
  }
  return response;
};


module.exports = {
  updateLog
};
