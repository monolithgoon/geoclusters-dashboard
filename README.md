# Active Land Asset Visualization & Monitoring Dashboard
*Welcome to the Real-Time Farm Program Management Dashboard repository, where you can explore the capabilities of a dynamic geospatial platform designed to enhance farm operations management.
This server-side rendered dashboard is updated with real-time data, that gives farm program managers a birds-eye view of farmer engagement metrics (farmer demographics, crop types, geo-mapped farm parcels, and other rich contextual information), allowing them to effectively communicate KPIs to institutional partners, and other vested stakeholders*

#### [Dashboard Preview](http://51.20.26.23:9090/landing/)
*Guest Login Credentials*
```javascript
Username - guest@avg-dashboard.com
Password - jungleFever
```

![dashboard-0](https://user-images.githubusercontent.com/60096838/160973371-f393d866-4a73-4a14-8ffe-18e2027faa9d.png)
![dashboard-3](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/41ea1552-af18-4b37-a736-048d2ae9455a)
![dashboard-2](https://user-images.githubusercontent.com/60096838/228781340-f126067e-55b6-4d1f-b229-cfd31e30485a.png)
![Screenshot_20210408-110025_Gallery](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/b7410a3b-3df9-4b8c-b72a-0982a59e6e05)
![sh-clusters-proto](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/0dcfe165-432b-41e3-8e49-07c9e4194d4a)
![sh-clusters-proto-2](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/111853ab-e59b-4b5d-96b3-869d3b297e0d)

## Key Features

- **Live Heat-Map Visualization**
The landing page showcases a real-time Mapbox GL JS 'heat-map' that dynamically updates as new farm programs are added via the backend.

- **Geospatial Data Rendering Engine**
We've created a proprietary geospatial data rendering engine that intelligently displays relevant map features and data based on the user's viewing context, map bounds, and zoom level. This ensures smooth rendering of tens of thousands of data points without browser crashes.

- **Virtual Asset Title (VAT) Framework**
Our innovative VAT framework accurately documents the location and metadata of informal, unstructured assets like farmlands. It conforms to the Nigeria Society of Surveyors plot survey standards.

- **React Component Widgets**
We've developed React component widgets to display insights on various farm operations, including yield, harvest, profitability, and real-time resource deployments. Our approach follows company-wide standards, emphasizing federated React components, Redux state management, and GIS data warehousing best practices.

- **Event-Driven Infrastructure**
Our architecture leverages websockets to provide near real-time visualization of farmer on-boarding data, including biometric and geospatial information. This enhances coordination between managers and field staff and eliminates oversight duplication.

- **Performance Optimization**
We've achieved a 60% reduction in dashboard load time through critical asset pre-loading, geojson resource caching, and non-critical resource sourcing from Content Delivery Networks (CDNs).

- **AWS Cloud Deployment**
Our platform is deployed on the AWS cloud using CI/CD strategies. We leverage AWS services like EC2, S3, and RDS to ensure high availability, scalability, and reliability. Integration with services like DynamoDB, Lambda, and Elastic Load Balancing optimizes performance and cost-efficiency.

## Build & Deployment
*Step-by-step for deploying a Docker image of the app on an AWS EC2 instance*

### Overview

- The whole app is rendered server-side. Backend code resides in `server/`, and the frontend is served via `server/public/src/`
- The main entry point for the Express server is `server/server.js`
- This app consists of just 2 page routes: `/landing` and `/dashboard`
- The main JavaScript module scripts for both pages are in `public/src/js/landing.js` and `public/src/js/dashboard.js` respectively
- All the HTML for the both pages is served up via server-side rendered `PUG` templates via `server/routes/view-routes`
- The landing page HTML is served from `landing.pug` and `landing-index.pug`
- The dashboard SPA HTML is served from `dashboard.pug` and `dashboard-index.pug`

### Docker Compose
- Clone the Github repo from `git clone https://github.com/monolithgoon/avg-dashboard.git`
- Ensure you have [Docker Compose](https://docs.docker.com/compose/install) installed locally.
- Copy the `.env.compose` file and rename it to `.env` in the root of the mono-repo. This file contains default environment variable definitions.
- To run the platform using our pre-built Docker images, execute the following command:
`docker-compose -f docker-compose.demo.yml up`
(Note: it uses the latest images pre-built automatically from the head of the master branch using GitHub CI/CD.)
- If you want to build everything, including code and Docker images, locally, run:
`docker-compose up`
(Note: this process may take a considerable amount of time. The option above is much faster.)
Be patient; it might take some time for our API to seed fake data in the database during the first Docker Compose run, even if you used pre-built Docker images.
- Open `http://localhost:4200` in your browser

### Run the app locally
- Request for a Github personal access token for `https:github.com/monolithgoon/` from the developer
- Clone the app code to your local machine `git clone https://github.com/monolithgoon/avg-dashboard.git`
- Install the `package.json` dependencies by running `npm install`
- Build an obfuscated version of the main app entry code `dashboard.js` by running 'npm run build:secure`
- In order to make the most proprietary code for the dashboard app difficult to copy, an obfuscated version of `dashboard.js` first needs to be built locally, and then commited to the Github repo. Do this by running `npm run build`. You'll find the built script in `/public/dist/jquery-2.3.1.slim.min`. Finally, make sure the module script the HTML is pointing to at the bottom of `dashboard.pug` is the bundled & obfuscated `jquery-2.3.1.slim.min.js` file, and not the original `dashboard.js` file

### Deploying the app to Amazon AWS EC2

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

## Dashboard API Response Envelopes

This is the expected data envelopes for data returned from the geoclusters API

### Parcelized AGCs

`/api/v1/parcelized-agcs/`

This endpoint returns data for AGCs that were processed through the Automated Land Parcelization API

```javascript
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

```javascript
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
