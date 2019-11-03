const { gql } = require('apollo-server-cloud-functions');

const { invokeFunction } = require('../helpers/invokeFunction');

const { helloWorld } = require('../functions/helloWorld');
const { postMessageToPubSub } = require('../functions/postMessageToPubSub');

const { createArtwork } = require('../functions/api/createArtwork');
const { readArtwork } = require('../functions/api/readArtwork');
const { readArtworks } = require('../functions/api/readArtworks');
const { updateArtwork } = require('../functions/api/updateArtwork');
const { deleteArtwork } = require('../functions/api/deleteArtwork');

const { REGION, PROJECT_ID, TOPIC_NAME } = require('../configuration');

const typeDefs = gql`
	# The basic shape of an artwork
	type Artwork {
		artist: String
		imageUrl: String
		originalImageUrl: String
		title: String
		year: Int
		uuid: String
		labels: [String]
		createdByUser: String
	}

	# The shape of artwork input data
	input ArtworkInput {
		artist: String!
		imageUrl: String!
		title: String
		year: Int
		createdByUser: String
	}

	# The shape of artwork (update) input data
	input UpdateArtworkInput {
		artist: String
		imageUrl: String
		title: String
		year: Int
		uuid: String!
	}

	# The basic shape of an image
	type ImageLabels {
		labels: [String]
	}

	type DatabaseEvent {
		success: String
		error: String
	}

	# Any queries that can be made
	type Query {
		helloWorld: String
		getArtworks: [Artwork]
		getArtworkByTitle(title: String!): Artwork
		postMessageToPubSub: String
	}

	# Any mutations that can be made
	type Mutation {
		getLabels(imageUrl: String!): ImageLabels
		createArtwork(artwork: ArtworkInput!): Artwork
		updateArtwork(artwork: UpdateArtworkInput!): DatabaseEvent
		deleteArtwork(uuid: String!): DatabaseEvent
	}
`;

const resolvers = {
	Query: {
		// Function bundled in API, "monolith"
		helloWorld: () => helloWorld(),
		// Get all artworks from a database
		getArtworks: async () => await readArtworks(),
		// Get individual artwork by title
		getArtworkByTitle: async (_, args) => await readArtwork(args.title),
		// Publish a message to a Pub/Sub queue, which will trigger our integration function
		postMessageToPubSub: async () => await postMessageToPubSub(PROJECT_ID, TOPIC_NAME)
	},
	Mutation: {
		// External function
		getLabels: async (_, { imageUrl }) => {
			return new Promise(async (resolve, reject) => {
				const ENDPOINT = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/getLabels`; // Make sure that this does match your own function name from the '/image-service'
				const res = await invokeFunction(ENDPOINT, imageUrl);
				resolve(res);
			}).then(labels => {
				return { labels };
			});
		},
		// Local bundled CRUD functions
		createArtwork: async (_, { artwork }) => await createArtwork(artwork),
		updateArtwork: async (_, { artwork }) => await updateArtwork(artwork),
		deleteArtwork: async (_, { uuid }) => await deleteArtwork(uuid)
	}
};

module.exports = { typeDefs, resolvers };
