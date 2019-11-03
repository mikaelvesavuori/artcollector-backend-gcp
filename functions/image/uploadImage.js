const fetch = require('node-fetch');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

// https://github.com/googleapis/nodejs-storage/issues/506#issuecomment-436403257
exports.uploadImage = async (image, imageName, bucketName) => {
	const bucket = storage.bucket(bucketName);
	const file = bucket.file(imageName);
	const writeStream = file.createWriteStream();

	return await fetch(image).then(res => {
		res.body.pipe(writeStream);
	});
};
