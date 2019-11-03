'use strict';

const { PubSub } = require('@google-cloud/pubsub');

exports.postMessageToPubSub = async (projectId, topicName) => {
	const pubsub = new PubSub({ projectId });

	const data = JSON.stringify({ foo: 'bar' });
	const dataBuffer = Buffer.from(data);

	const messageId = await pubsub.topic(topicName).publish(dataBuffer);
	console.log(`Message ${messageId} published.`);
	return `Message ${messageId} published.`;
};
