# Active Land Asset Visualization (AVG) & Monitoring Dashboard

A server-side generated, SPA dashboard that helps managers discover insights about their work with farmers, and communicate KPIs transparently and effectively institutional partners and the general public

### [Geoclusters Dashboard Preview](http://13.53.36.35:9090/landing/)

![dashboard-0](https://user-images.githubusercontent.com/60096838/160973371-f393d866-4a73-4a14-8ffe-18e2027faa9d.png)

![dashboard-2](https://user-images.githubusercontent.com/60096838/228781340-f126067e-55b6-4d1f-b229-cfd31e30485a.png)

## Build & Deployment

> *This is a step-by-step guide for deploying code for the AVG Dashboard app on an AWS EC2 instance*

### Overview

- The whole app is rendered server-side. Backend code resides in `server/`, and the frontend is served via `server/public/src/`

- The main entry point for the Express server is `server/server.js`

- This app consists of just 2 page routes: `/landing` and `/dashboard`

- The main JavaScript module scripts for both pages are in `public/src/js/landing.js` and `public/src/js/dashboard.js` respectively

- All the HTML for the both pages is served up via server-side rendered `PUG` templates via `server/routes/view-routes`

- The landing page HTML is served from `landing.pug` and `landing-index.pug`

- The dashboard SPA HTML is served from `dashboard.pug` and `dashboard-index.pug`

- In order to make the most proprietary code for the dashboard app difficult to copy, an obfuscated version of `dashboard.js` first needs to be built locally, and then commited to the Github repo. Do this by running `npm run build`. You'll find the built script in `/public/dist/jquery-2.3.1.slim.min`. Finally, make sure the module script the HTML is pointing to at the bottom of `dashboard.pug` is the bundled & obfuscated `jquery-2.3.1.slim.min.js` file, and not the original `dashboard.js` file

### 1. Run the app locally

Request for a Github personal access token for `https:github.com/monolithgoon/` from the developer

Clone the app code to your local machine

```bash
git clone https://github.com/monolithgoon/avg-dashboard
```

Install the `package.json` dependencies by running

```bash
npm install
```

Build an obfuscated version of the main app entry code `dashboard.js` by running

```bash
npm run build:secure
```

### 2. Deploying the app on Ubuntu

1. Request for the `avg.pem` key from the admin.

2. Connect via SSH to the AWS EC2 Ubuntu machine

   From the directory where the `avg.pem` key is located, run

   ```bash
   ssh -i "avg.pem" ubuntu@ec2-54-225-80-233.compute-1.amazonaws.com
   ```

3. Navigate to the application directory

```bash
cd /apps
cd /avg-dashboard
```

## Geoclusters API Response Envelopes

This is the expected data envelopes for data returned from the geoclusters API

### Parcelized AGCs

`/api/v1/parcelized-agcs/`

This endpoint returns data for AGCs that were processed through the Automated Land Parcelization API

```bash
const response = {

   status: "success",

   requested_at: request.requestTime,

   num_parcelized_agcs: returnedAGCData.length,

   // additional information related to the API response
   data: {

     // parcelized AGCs
     parcelized_agcs: returnedAGCData,

     // parcelized AGCs (repeat)
     collection_docs: returnedAGCData,

     // string representing name of the collection
     collection_name: `parcelized-agcs`,

     // number of parcelized AGC docs.
     docs_count: returnedAGCData.length,
   },
};

```

### Parcelized AGCs Metadata

`/api/v1/parcelized-agcs/metadata`

This endpoint returns only METADATA for AGCs that were processed through the Land Parcelization API

```bash
const response = {

   status: "success",

   requested_at: request.requestTime,

   data: {

     collection_metadata: {

        // array of unique ids of the parcelized AGCs in the collection
        ids: parcelizedAgcIds,

        // integer indicating the number of parcelized AGC docs.
        docs_count: parcelizedAgcs.length,

        // string representing the name of the collection
        collection_name: `parcelized-agcs`,
     },
   },
};
```

### Processed Legacy AGCs

`api/v2/legacy-agcs/processed/`

This endpoint returns mappable legacy AGCs that were recovered from NIRSAL'S funded AGC `.csv` files
These processed legacy AGCs are appended with farmer biometric data.

### Clustered Farm Programs

33/legacy-agcs/processed/`

This endpoint returns mappable legacy AGCs that were recovered from NIRSAL'S funded AGC `.csv` files
These processed legacy AGCs are appended with farmer biometric data.

## Constants

### Backend

`server/constants`

1. `server/constants/api-urls.js`

   This module exports an object `API_URLS` that stores the URLs for various API endpoints used in the application.

   It contains a property `GEOCLUSTERS` which provides information specific to the geoclusters API.

   The `GEOCLUSTERS` property has an object `HOST` which contains the URLs for the different hosts of the geoclusters API, including `localhost`, Heroku, and AWS.

   The `GEOCLUSTERS` property has a second property `RESOURCE_PATHS` that is an array `[]` of resource paths for `parcelized-agcs`, `legacy-agcs`, `processed-legacy-agcs` from the geoclusters API. The `processed-legacy-agcs` is legacy AGCs whose data has been scrubbed, and transformed into GeoJSON for presentation, and enhanced with farmer biometric data.

2. `server/constants/nga-geo-pol-regions.js`

3. `server/constants/words-to-capitalize

   ```bash
   /**
    * Const that contains a list of words in the retreived geocluster name/title
    * that need to be capitalized after the cluster is imported from the DB
    */
   const CAPITALIZE_THESE_WORDS = ['Agc', 'Pmro', 'Fct', "Nfgcs", "Ompcs", "Mpcs"];
   ```

### Frontend

`server/public/js/src/constants`

1. `/alert-messages.js`

2. `/api-urls.js`

3. `/attribution`

4. `/intervals.js`

5. `/maps-tile-sources.js`

   This module exports an object `LEAFLET_MAP_TILES_SOURCES` that stores the URLs for various map tile sources used to render the two Leaflet JS maps in this app. The object is frozen to prevent changes to its properties.

   The object has properties for different map tile providers, including Google, OSM, Bing, ERSI, Stamen, Carto, and Mapbox. Each provider property is an object containing the URLs for different map styles provided by the provider.

   These tile URLs are imported into `maps-config.js`, and converted into Leaflet JS Layers, and exported to the rest of the application.

   On the dashboard, the tiles is for the centerfold base map is set in the `LeafletMapsSetup` IIFE funciton in `../src/js/avg-controllers/maps-controller.js`

6. `/maps-api-tokens.js`

   **Add the map provider API tokens to this file.**

   **In production, do not use the map provider API tokens included in this code repository. They are for development only**

   > The `/landing` page uses Mapbox GL JS only.
   > The `/dashboard` page uses 2 mapping providers: Bing Maps for the main centerfold map that renders all the clusters, and Mapbox GL JS for the right sidebar, cluster features map.

   To get a Mapbox GL JS API token, you can follow these steps:

   - Go to the Mapbox [website](https://www.mapbox.com/)
   - Create a free account or sign in if you already have one
   - Go to the Access Tokens [page](https://account.mapbox.com/access-tokens/)
   - Generate a new access token and give it a descriptive name

   To get a Bing Maps token, you can follow these steps:

   - Go to the Bing Maps Dev Center [website](https://www.bingmapsportal.com/)
   - Create a free account or sign in if you already have one
   - Go to the My Account [page](https://www.bingmapsportal.com/Application)
   - Create- a new Bing Maps key and give it a descriptive name

## Environment Variables

### Development

```bash
NODE_ENV=development
PORT=9090
AUTO_LAND_SUBDIVISION_HOST_URL=http://18.213.158.252:8443
ATLAS_DB_STRING=*****
ATLAS_DB_PASSOWRD=dooksie
JWT_SECRET=*****
JWT_EXPIRES_IN_DAYS=5
JWT_COOKIE_EXPIRES_IN_DAYS=1
MAIL_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=*****
MAILTRAP_PASSWORD=*****
CLOUDINARY_URL=*****
APP_DEVELOPER="FieldDev Group"
APP_OWNER="Koala Technology"
APP_TITLE="AVG Dashboard - SSR Beta V1.0"```

### Production

```bash
NODE_ENV=production
PORT=9090
AUTO_LAND_SUBDIVISION_HOST_URL=http://18.213.158.252:8443
ATLAS_DB_STRING=*****
ATLAS_DB_PASSOWRD=dooksie
JWT_SECRET=*****
JWT_EXPIRES_IN_DAYS=5
JWT_COOKIE_EXPIRES_IN_DAYS=1
MAIL_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=*****
MAILTRAP_PASSWORD=*****
CLOUDINARY_URL=*****
APP_DEVELOPER="FieldDev Group"
APP_OWNER="Koala Technology"
APP_TITLE="AVG Dashboard - SSR Beta V1.0"
```
