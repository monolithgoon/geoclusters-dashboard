# AVG Dashboard Build & Deployment

This is a step-by-step guide for deploying code for the AVG Dashboard app on an AWS EC2 instance.

## Preface

> This app consists of just 2 page routes: `/landing` and `/dashboard`
> The scripts for both pages are in `public/src/js/landing.js` and `public/src/js/dashboard.js` respectively
> All the HTML for the both pages is served up via server-side rendered `pug` templates.
> The landing page HTML is served from `landing.pug` and `landing-index.pug`
> The dashboard SPA HTML is served from `dashboard.pug` and `dashboard-index.pug`
> In order to make the most critical code for the dashboard app difficult to copy, an obfuscated version of `dashboard.js` first needs to be built locally, and then commited to the Github repo.

## 1. Run the app locally

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

## 2. Connect to the AWS EC2 Ubuntu machine

### 1. Request for the `avg.pem` key

### 2. Connect via SSH to the EC2 machine by running

```bash
ssh -i "avg.pem" ubuntu@ec2-54-225-80-233.compute-1.amazonaws.com
```

### 3. Navigate to the application directory

```bash
cd /apps
cd /avg-dashboard
```
