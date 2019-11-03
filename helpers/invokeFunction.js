const fetch = require('node-fetch');

exports.invokeFunction = async (endpoint, query) => {
	return new Promise(async (resolve, reject) => {
		await fetch(endpoint, {
			method: 'POST',
			body: JSON.stringify(query)
		})
			.then(async res => {
				const result = await res.json();
				resolve(result);
			})
			.catch(error => {
				console.log('Error', error);
				reject(error);
			});
	});
};
