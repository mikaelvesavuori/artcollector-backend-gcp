'use strict';

const functions = require('firebase-functions');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();

const BUCKET_NAME = 'art-collector-demo'; // EDIT THIS to your own bucket name

// Reference: https://firebase.google.com/docs/functions/firestore-events
exports.deleteImage = functions.firestore
	.document('artworks/{artworkUuid}')
	.onDelete(async (change, context) => {
		const OLD_DATA = change.data();
		const IMAGE_URL = OLD_DATA.imageUrl;
		const FILE_FORMAT_SPLIT_POINT = IMAGE_URL.lastIndexOf('.');
		const FILE_FORMAT = IMAGE_URL.slice(FILE_FORMAT_SPLIT_POINT, IMAGE_URL.length);
		const ARTWORK_UUID = context.params.artworkUuid;
		console.log(`Removing ${ARTWORK_UUID}${FILE_FORMAT}`);

		return await storage
			.bucket(BUCKET_NAME)
			.file(`${ARTWORK_UUID}${FILE_FORMAT}`)
			.delete();
	});
