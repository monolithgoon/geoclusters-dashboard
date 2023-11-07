# Active Land Asset Visualization & Monitoring Dashboard
#### [Dashboard Preview](http://51.20.26.23:9090/landing/)
*A dynamic geospatial platform designed to enhance farm operations management. This server-side rendered dashboard is updated with real-time data, that gives farm program managers a birds-eye view of farmer engagement metrics (farmer demographics, crop types, geo-mapped farm parcels, and other rich contextual information), allowing them to effectively communicate KPIs to institutional partners, and other vested stakeholders*

*Guest Login Credentials*
```javascript
Username - guest@avg-dashboard.com
Password - jungleFever
```
![dashboard-0](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/b0702e3b-fb8a-4e8b-9081-89e213f47932)
![dashboard-3](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/41ea1552-af18-4b37-a736-048d2ae9455a)

<details>
  <summary>More Screens</summary>
  
  ![dashboard-2](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/5d847afb-befe-494e-bab7-a36321b93651)
  
  ![Screenshot_20210408-110025_Gallery](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/b7410a3b-3df9-4b8c-b72a-0982a59e6e05)
  
  ![sh-clusters-proto](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/0dcfe165-432b-41e3-8e49-07c9e4194d4a)
  
  ![sh-clusters-proto-2](https://github.com/monolithgoon/geoclusters-dashboard/assets/60096838/111853ab-e59b-4b5d-96b3-869d3b297e0d)
</details>

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

#### With Docker Compose, the following services will be run
- **[PostgreSQL](https://www.postgresql.org/)** - Primary Database
- **[Pgweb](https://sosedoff.github.io/pgweb/)** - Cross-platform client for PostgreSQL databases, available on [http://localhost:8081](http://localhost:8081)
- **[Dejavu](https://github.com/appbaseio/dejavu)** - Web UI for ElasticSearch, available on [http://localhost:1358](http://localhost:1358)
- **[MinIO](https://min.io/)** - Multi-Cloud Object Storage (AWS S3 compatible)
- **[Jitsu](https://jitsu.com/)** - An open-source Segment alternative. Fully-scriptable data ingestion engine for modern data teams
- **Redis** - In-memory data store/caching (also used by Jitsu).

### Run the app locally
- Request for a Github personal access token for `https:github.com/monolithgoon/` from the developer
- Clone the app code to your local machine `git clone https://github.com/monolithgoon/avg-dashboard.git`
- Install the `package.json` dependencies by running `npm install`
- Build an obfuscated version of the main app entry code `dashboard.js` by running 'npm run build:secure`
- In order to make the most proprietary code for the dashboard app difficult to copy, an obfuscated version of `dashboard.js` first needs to be built locally, and then commited to the Github repo. Do this by running `npm run build`. You'll find the built script in `/public/dist/jquery-2.3.1.slim.min`. Finally, make sure the module script the HTML is pointing to at the bottom of `dashboard.pug` is the bundled & obfuscated `jquery-2.3.1.slim.min.js` file, and not the original `dashboard.js` file

### Deploying the app to Amazon AWS EC2
- Request for the `avg.pem` key from the admin.
- **Connect via SSH to the AWS EC2 Ubuntu machine** From the directory where the `avg.pem` key is located, run `ssh -i "avg.pem" ubuntu@ec2-54-225-80-233.compute-1.amazonaws.com`
- Navigate to the application directory
```bash
cd /apps
cd /avg-dashboard
```

## Environment Variables

Instructions for setting up essential environment variables required for the project. Replace the placeholders (e.g., `*****`) with the actual values relevant to your setup.

```bash
NODE_ENV=production
ATLAS_DB_STRING=*****
ATLAS_DB_PASSOWRD=*****
GEOCLUSTERS_DASHBOARD_PORT=9090
AUTO_LAND_SUBDIVISION_HOST_URL=http://51.20.26.23:9443
JWT_SECRET=*****
JWT_EXPIRES_IN_DAYS=3600000
JWT_COOKIE_EXPIRES_IN_DAYS=1
EMAIL_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=*****
MAILTRAP_PASSWORD=*****
CLOUDINARY_URL=*****
```

*To run the app in `development` mode, create a file called `development.env` in the `/server` directory, set the Node.js environment variable to `NODE_ENV=development`, and load the variables with the `dotenv` package*

***Keep these values secure and do not expose them in public repositories.***

### Node Environment

```bash
NODE_ENV=production
```
Set the Node.js environment to "production" in your server or application configuration for production deployments. 

### Geoclusters Dashboard 
```bash
GEOCLUSTERS_DASHBOARD_PORT=9090
```
To specify the port number where this app will run, set the `GEOCLUSTERS_DASHBOARD_PORT` environment variable. This value is used by the configuration file located at `/server/config/config.js`

### MongoDB Atlas Configuration
```bash
ATLAS_DB_STRING=*****
```
Visit the MongoDB Atlas [website](https://www.mongodb.com/cloud/atlas). Log in or create an account, and create a new cluster or select an existing one. Locate the connection string for your MongoDB cluster and replace `*****` with the actual connection string.

```bash
ATLAS_DB_PASSWORD=*****
```
Use the password associated with your MongoDB Atlas cluster.

### Auto Land Subdivision API Service
```bash
AUTO_LAND_SUBDIVISION_HOST_URL=http://51.20.26.23:9443
```
The URL where the Auto Land Subdivision service is hosted. Keep this as is. It's currently being hosted on an AWS EC2 instance. If this isn't working, ask the admin for a working link.

### JSON Web Token (JWT)
```bash
JWT_SECRET=*****
```
Generate a strong and secure secret key for JWT (JSON Web Tokens). It's used for authentication and authorization. Replace `*****` with your secret key.

```bash
JWT_EXPIRES_IN_DAYS=3600000
JWT_COOKIE_EXPIRES_IN_DAYS=1
```
These values determine the expiration time for JWT tokens. Adjust them as needed for your application.

### Email Provider Configuration

```bash
EMAIL_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USERNAME=*****
MAILTRAP_PASSWORD=*****
````
Visit the Mailtrap [website](https://mailtrap.io). Sign in or create an account, and create a new project. In your project settings, you'll find the SMTP host, port, username, and password. Replace the placeholders (`*****`) with these values.

### Cloudinary Integration

```bash
CLOUDINARY_URL=*****
```
Visit the Cloudinary [website](https://cloudinary.com). Log in or create an account, and obtain your Cloudinary API URL and replace `*****` with the actual URL.

## Map Provider API Tokens

Because the main maps for the dashboard are rendered on the frontend, the API tokens required can't be added to, or read from the server environment variables in the `/server/production.env` file. 

Instead, add the map provider API tokens to this file `/server/public/js/src/constants/maps-api-tokens.js`

***In production, do not use the map provider API tokens included in this code repository. They are for development only***

The `/landing` page uses Mapbox GL JS only.
The `/dashboard` page uses 2 mapping providers: Bing Maps for the main centerfold map that renders all the clusters, and Mapbox GL JS for the right sidebar, cluster plot features sidebar map.

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
