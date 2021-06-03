`use strict`;

import {  } from "./avg-controllers/maps-controller.js";
import { DOMLoadEvents, AddEventListeners } from "./avg-controllers/ui-controller.js";

async function initApp () {
   DOMLoadEvents();
   AddEventListeners();
}

initApp();