'use strict';

/**
 * @file A JavaScript function to handle the return to landing button click event.
 * @author [Your Name]
 */

/**
 * A constant to store the return to landing button element from the HTML document.
 * @constant
 * @type {Element}
 */
const returnToLandingBtn = document.getElementById("return_to_landing_btn");

/**
 * An event listener to disable the return to landing page button when it is clicked.
 */
if (returnToLandingBtn) {
  returnToLandingBtn.addEventListener("click", (e) => {
    returnToLandingBtn.disabled = true;
  });
}
