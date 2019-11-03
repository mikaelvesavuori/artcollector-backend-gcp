'use strict';

const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.deleteArtwork = async uuid => {
	const COLLECTION = 'artworks';

	return await firestore
		.collection(COLLECTION)
		.doc(uuid)
		.delete()
		.then(() => {
			console.log('Success!');
			return {
				statusCode: 200
			};
		})
		.catch(() => {
			console.warn('Error deleting!');
			return {
				statusCode: 400
			};
		});
};
