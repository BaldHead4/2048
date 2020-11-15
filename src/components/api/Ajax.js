import axios from 'axios';

/**
 *
 * @param {string} method
 * @param {string} url
 * @param {Object} args
 * @returns {Promise}
 */
export function Ajax(method, url, args) {
    return axios({
        method: method,
        url: `https://water.guangpuhui.com:8090${url}`,
        // url: `http://localhost:8090${url}`,
        params: method === 'GET' ? args : null,
        data: method === 'POST' ? args : null,
    })
}
