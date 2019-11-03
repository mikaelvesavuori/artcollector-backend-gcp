'use strict';

const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();
const uuidv4 = require('uuid/v4');

const { uploadImage } = require('../image/uploadImage');
const { invokeFunction } = require('../../helpers/invokeFunction');
const { REGION, PROJECT_ID, BUCKET_NAME, COLLECTION_NAME } = require('../../configuration');

exports.createArtwork = async ({ artist, imageUrl, title, year, createdByUser }) => {
	if (artist && imageUrl && title && year && createdByUser) {
		const UUID = uuidv4();

		const FILE_FORMAT_SPLIT_POINT = imageUrl.lastIndexOf('.');
		const FILE_FORMAT = imageUrl.slice(FILE_FORMAT_SPLIT_POINT, imageUrl.length);
		const IMAGE_NAME = `${UUID}${FILE_FORMAT}`;

		const DOCUMENT = {
			artist,
			originalImageUrl: imageUrl,
			imageUrl: `https://storage.cloud.google.com/${BUCKET_NAME}/${IMAGE_NAME}`,
			title,
			year,
			uuid: UUID,
			labels: [],
			createdByUser
		};

		const upload = await new Promise(async (resolve, reject) => {
			try {
				await uploadImage(imageUrl, IMAGE_NAME, BUCKET_NAME);
				resolve();
			} catch (error) {
				reject(error);
			}
		});

		const getLabels = await new Promise(async (resolve, reject) => {
			try {
				// Make sure that this exactly matches your own function name from the '/image-service'
				const ENDPOINT = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/getLabels`;
				const labels = await invokeFunction(ENDPOINT, { imageUrl: imageUrl })
					.then(labels => {
						DOCUMENT.labels = labels;
						console.log('Document that will be set in database:', DOCUMENT);
					})
					.then(res => resolve(res));
			} catch (error) {
				console.error('Failed to get labels from image!', error);
				reject(error);
			}
		});

		const addEntry = await new Promise(async (resolve, reject) => {
			try {
				await firestore
					.doc(`${COLLECTION_NAME}/${UUID}`)
					.set(DOCUMENT)
					.then(() => {
						resolve();
					})
					.catch(error => {
						console.error('Error creating entry in Firestore!');
						reject(error);
					});
			} catch (error) {
				console.error('Failed adding entry to Firestore!', error);
				reject(error);
			}
		});

		return await Promise.all([upload, getLabels, addEntry]).then(() => {
			return DOCUMENT;
		});
	} else {
		const ERROR_MESSAGE =
			'Missing one or more required fields: "artist", "imageUrl", "title", "year", "createdByUser"!';
		return ERROR_MESSAGE;
	}
};
