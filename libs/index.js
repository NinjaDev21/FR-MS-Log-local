'use strict'
/**
 * Below codes are for example only. Please don't touch those files / codes. 
 * Those files and this code block will be removed soon
 */


const config = require('./src/config');
// const example2 = require('./src/example-lib-2');
const response = require('./src/response');
const awsFunctions = require('./src/aws.helper');
const exception = require('./src/exception');
const fileUpload = require('./src/fileUpload');
module.exports = {
    config: config,
    Response: response,
    awshelper: awsFunctions,
    Exception: exception,
    S3Upload: fileUpload
};

