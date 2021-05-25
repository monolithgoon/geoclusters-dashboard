`use strict`;

import { initMaps } from "./maps-controller.js";
import { AddEventListeners } from "./ui-controller.js";
import { GET_PARCELIZED_AGC_API_DATA } from "./data-controller.js";

initMaps();
AddEventListeners();
GET_PARCELIZED_AGC_API_DATA();