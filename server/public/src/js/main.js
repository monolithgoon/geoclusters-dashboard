`use strict`;
import { DOMLoadEvents, AddEventListeners } from "./avg-controllers/ui-controller.js";
import { _clientSideRouter } from "./routers/router.js";


async function initApp () {
   DOMLoadEvents();
   AddEventListeners();
};


initApp();


// // SANDBOX
// window.addEventListener(`DOMContentLoaded`, async () => {

//    document.body.addEventListener('click', e => {
//       if (e.target.matches("[data-bs-target]")) {
//          console.log('client side routed')
//          e.preventDefault();
//          _navigateTo(e.target.href);
//       }
//    });

//       // SANDBOX
//    // init. the client side router
//    _clientSideRouter();

// })