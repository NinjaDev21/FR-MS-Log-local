'use strict'
const AWS = require("aws-sdk");
const https = require('https');
// for local below code snippet might need to enable
// const credentials = new AWS.SharedIniFileCredentials({ profile: 'friender-dev' });
// AWS.config.credentials = credentials;

const s3 = new AWS.S3({
  region: process.env.REGION,
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET,
});

const imageUpload = async (bucket, base64File, imageName, S3key = null, allowedFileSizeInKB = null) => {
	try {
		const mimeTypes = [
			'image/png',
			'image/jpg',
			'image/jpeg',
			'image/gif'
		]
		const imgB64 = base64File;
		const fileName = imageName;
		const mimType = base64MimeType(imgB64);
		const buf = Buffer.from(imgB64.replace(/^data:image\/\w+;base64,/, ""), 'base64');
		const uid = Date.now();
		const originalKey = (S3key !== null) ? S3key.replace(/\/$/, '') + `/${fileName}` : `${fileName}`;
		// console.log("Image Type", mimType);
		// Image Size
		const stringLength = imgB64.length - 'data:image/png;base64,'.length;
		const sizeInBytes = 4 * Math.ceil((stringLength / 3)) * 0.5624896334383812;
		const sizeInKb = sizeInBytes / 1000;
		// Image Size
		if (allowedFileSizeInKB !== null && sizeInKb > allowedFileSizeInKB) throw new Error(`File size should not be grater than ${fileSizeInKB}`);
		if (mimeTypes.includes(mimType) === false) throw new Error("Only jpg, jpeg,png and gif files are allowed");
		const imgData = {
			Bucket: bucket,
			Key: originalKey,
			Body: buf,
			ContentEncoding: 'base64',
			ContentType: mimType
		};
		/**
		 * Upload the image
		 */
		const originalFile = await s3.upload(imgData).promise();
		/**
		 * Retrive uploaded files url
		 */
		const signedOriginalUrl = s3.getSignedUrl("getObject", {
			Bucket: originalFile.Bucket,
			Key: originalKey,
			Expires: 60000
		});
		const publicUrl = getUrlFromBucket(bucket, originalKey);
		// console.log(signedOriginalUrl);

		const response = {
			id: uid,
			mimeType: mimType,
			originalKey: originalFile.key,
			bucket: originalFile.Bucket,
			fileName: fileName,
			originalUrl: signedOriginalUrl,
			originalSize: buf.byteLength,
			publicUrl: publicUrl
		};
		return response;
	} catch (e) {
		console.log("Error in image upload", e)
		return e;
	}
};

const base64MimeType = (encoded) => {
	var result = null;
	if (typeof encoded !== 'string') {
		return result;
	}
	var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
	if (mime && mime.length) {
		result = mime[1];
	}
	return result;
};

const getUrlFromBucket = (s3Bucket, fileName) => {
	return `https://s3.amazonaws.com/${s3Bucket}/${fileName}`
};

/**
 * Function to download an image from URL and convert into base64 string
 */
const imageUrltoBase64 = (url) => {
	return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const data = [];
      response.on('data', (chunk) => {
				data.push(chunk);
			});
      response.on('end', async () => {
				const base64data = "data:" + response.headers["content-type"] + ";base64," + Buffer.concat(data).toString('base64');
        resolve(base64data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = {
	imageUpload,
	base64MimeType,
	getUrlFromBucket,
	imageUrltoBase64
}