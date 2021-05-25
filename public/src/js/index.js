`use strict`

import { getLegacyAGCs } from "./data-controller.js";
import { initMaps } from "./maps-controller.js";
import { AddEventListeners, passJSONToDOM } from "./ui-controller.js";

async function getLegacyAGCData() {
   
   const apiResponse = await getLegacyAGCs();
   const legacyAGCs = apiResponse.legacy_agcs;

   passJSONToDOM(legacyAGCs)
}

getLegacyAGCData();
initMaps();
AddEventListeners();