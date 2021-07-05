/* eslint-disable */

export const hideAlert = () => {
    const el = document.querySelector('.login-alert');
    if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, message) => {
    hideAlert();
    const markup = `
        <div class="login-alert login-alert--${type}">
            ${message}
        </div>
    `;
    document.querySelector('.login-alert-wrapper').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 8000);
};