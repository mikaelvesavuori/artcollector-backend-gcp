'use strict';

const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.readArtwork = async title => {
	const COLLECTION = 'artworks';

	return await firestore
		.collection(COLLECTION)
		.where('title', '==', title)
		.then(artwork => {
			console.log('Success!');
			return artwork;
		})
		.catch(error => {
			console.warn('Error reading!');
			return error;
		});
};
