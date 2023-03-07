`use strict`
const chalk = require("./chalk-messages.js");
const axios = require("axios");

async function _fetchData(url, options = {}) {
  try {
    const response = await axios({
      method: options.method || "GET",
      url,
      crossDomain: true,
      responseType: options.responseType || "application/json",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        ...options.headers,
      },
      data: options.data || {},
      timeout: options.timeout || 30000,
    });

    return response.data;
  } catch (error) {
    console.error(chalk.fail(`Axios error: ${error.message}`));
    return null;
  }
}

module.exports = _fetchData;