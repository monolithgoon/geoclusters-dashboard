const INTERVALS = {
  LOGIN_NAVIGATION_DELAY: 1500,
  LOGIN_MESSAGE_DELAY: 10000,
  BASE_DATA_QUERY_INTERVAL: 60000,
  AUTO_DATA_QUERY_INTERVAL_INCREMENT: 500,
  AUTO_WORKER_INTERVAL_LIMIT: 65000 // the collections data retreival auto worker will quit when the interval reaches this limit
}

export default INTERVALS;