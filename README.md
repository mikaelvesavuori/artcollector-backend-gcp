# ArtCollector serverless backend/API for Google Cloud Platform

This is the serverless backend/API for [ArtCollector](https://github.com/mikaelvesavuori/artcollector-frontend-gcp), an example app for serverless technologies.

The application consists of a frontend (written in React) and a backend (using an API deployed with Serverless Framework) together with a separate microservice that does labeling of images.

This repository assumes that you are going to deploy to Google Cloud Platform, using Cloud Functions. There will be additional versions available for AWS and Azure as well.

## Prerequisites

- You will need a Google Cloud Platform account; if you don't have one, [set one up for free and get credit to use](https://cloud.google.com/free/)
- I am assuming that you will use [Serverless Framework](https://serverless.com) to deploy it (however you can certainly do that manually), which necessitates that you install it
- Configure `serverless.yml` with your project ID and a path to your keyfile/credentials
- [Set up Firebase authentication](https://firebase.google.com/docs/auth) and double-check that your domains (local as well as potential online domains) are white-listed
- [Create a Firestore database](https://firebase.google.com/docs/firestore/quickstart)
- [Create a Cloud Storage bucket](https://cloud.google.com/storage/docs/creating-buckets)
- Make sure to configure the required settings in `configuration.js`; this includes values such as your GCP project ID and the Cloud Storage bucket name you want to add images to
- Manually deploy the Firestore-triggered Cloud Function (see `Deploying the Firestore trigger`)
- Labeling the images will try to invoke an external (micro)service: the repo for that code is at [xxxx](); clone and deploy it like you would with this repo

## Instructions

### Deployment of the API

If you are using Serverless Framework, you just need to run `sls deploy`.

### Deploying the Firestore trigger

I am using a Firestore Trigger to detect that a document was deleted in Firestore. The trigger will then remove the associated image file in Cloud Storage. While this should be possible to do through Serverless Framework, I am at least personally finding no progress. The function and package.json is included under `/firestoreTrigger-deleteImage`. Just deploy it manually through the Cloud Console with the below settings and it should work.

I'm pretty sure that I had to set the environment variable `GCLOUD_PROJECT` to my project ID for this to work. Obviously, you should also set a dedicated and/or limited service account to the function instead of the over-privileged App Engine one.

![Cloud Functions: Firestore trigger function `deleteImage`](docimages/trigger-function-1.png)

_Overall settings for the Firestore trigger_

![Cloud Functions: Firestore trigger function `deleteImage`](docimages/trigger-function-2.png)

_Advanced options panel for Firestore trigger_

## Using the API

If you are using the [ArtCollector frontend](https://github.com/mikaelvesavuori/artcollector-frontend-gcp), then any usage would normally be through that frontend. Please see that repository's source code for how it is used (hint: it's just regular calls with the browser's `Fetch`).

For the below queries, they are (as per usual with GraphQL) only using a single endpoint, which would normally look similar to `https://{REGION}-{PROJECT_ID}.cloudfunctions.net/api`.

### Get ("read") artworks

```
query {
  getArtworks {
    artist
    imageUrl
    title
    year
    labels
    uuid
    createdByUser
  }
}
```

### Get artwork by title (not used in the frontend)

```
query {
  getArtworkByTitle(title: "Splotch #3") {
    artist
    imageUrl
    title
    year
    labels
    uuid
    createdByUser
  }
}
```

### Create artwork

```
mutation {
  createArtwork(artwork: {
    artist: "Sol LeWitt"
    imageUrl: "https://uploads4.wikiart.org/images/sol-lewitt/splotch-3-2000.jpg"
    createdByUser: "someuser@somedomain.net"
  }) {
    artist
    originalImageUrl
    imageUrl
    labels
    title
    year
    uuid
    createdByUser
  }
}
```

### Update artwork

```
mutation {
  updateArtwork(artwork: {
    artist: "Some OtherPerson"
    uuid: "92f77263-8ce8-4d26-b333-d50a9b4bddcd"
    year: 2000
  }) {
    success
    error
  }
}
```

If this call is successful, it will currently only send back `null` for `success` and `error`.

### Delete artwork

```
mutation {
  deleteArtwork(uuid: "82abddcb-55c9-4cf1-98be-8d05f5620cb5") {
    success
    error
  }
}
```

If this call is successful, it will currently only send back `null` for `success` and `error`.

### Post message to Cloud Pub/Sub

```
{
  postMessageToPubSub
}
```

## Services and tech used in this repo

- [Cloud Functions](https://cloud.google.com/functions/) is an event-driven, serverless _function-as-a-service_ offering that enables us to run backends without any server management
- [Cloud Vision API](https://cloud.google.com/vision/) uses machine learning to infer labels from images
- [Firestore](https://cloud.google.com/firestore/), a massively-scalable document database, contains the actual artworks/posts
- [Cloud Storage](https://cloud.google.com/storage/) hosts copies of the artworks/images
- [Cloud Pub/Sub](https://cloud.google.com/pubsub/) which handles messaging
- The API itself uses [GraphQL](https://graphql.org/) based on the [Cloud Functions](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-cloud-functions) package
