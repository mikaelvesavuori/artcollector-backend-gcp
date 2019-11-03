'use strict';

const functions = require('firebase-functions');
const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

exports.readArtworks = async title => {
	const COLLECTION = 'artworks';
	const artworks = [];

	return await firestore
		.collection(COLLECTION)
		.get()
		.then(querySnapshot => {
			querySnapshot.forEach(doc => {
				artworks.push(doc.data());
			});
		})
		.then(() => {
			console.log('Success!');
			return artworks;
		})
		.catch(error => {
			console.warn('Error reading!');
			return error;
		});
};
