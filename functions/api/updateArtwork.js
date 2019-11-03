'use strict';

const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.updateArtwork = async artwork => {
	const COLLECTION = 'artworks';

	const UUID = artwork.uuid;
	const DOCUMENT = {
		...artwork
	};

	return await firestore
		.collection(COLLECTION)
		.doc(UUID)
		.update(DOCUMENT)
		.then(success => {
			console.log('Success!', success);
			return {
				statusCode: 200,
				something: newValue
			};
		})
		.catch(() => {
			console.warn('Error updating!');
			return {
				statusCode: 400,
				something: null
			};
		});
};
