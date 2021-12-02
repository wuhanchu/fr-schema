import { fetch } from 'dva';
import { Collapse } from 'antd';
import hash from 'hash.js';
import oauth, { OAuthToken } from './oauth';
import * as _ from 'lodash';
import { getDvaApp } from 'umi';

const { Panel } = Collapse;

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新增或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新增或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。请确认是否已经上传证书！',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

/**
 * 检查返回数据是否是错误的
 * @param  response
 */
const checkStatus = async (response) => {
    if (response.status >= 200 && response.status < 300) {
        return response;
    }

    const error = new Error();
    error.status = response.status;
    error.response = response;
    const text = await response.text();

    try {
        const data = JSON.parse(text);
        error.message = data.description || data.message;
        error.detail = data.detail || data.traceback;
    } catch (e) {
        error.message =
            codeMessage[response.status] ||
            `请求[${response.url}],后台返回无法解析的错误！详情查看开发工具Network标签中的相关请求。`;
        error.detail = text;
    }

    throw error;
};

const cachedSave = (response, hashcode) => {
    /**
     * Clone a response data and store it in sessionStorage
     * Does not support data other than json, Cache only json
     */
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.match(/application\/json/i)) {
        // All data is saved as text
        response
            .clone()
            .text()
            .then((content) => {
                sessionStorage.setItem(hashcode, content);
                sessionStorage.setItem(`${hashcode}:timestamp`, Date.now());
            })
            .catch((e) => {
                console.log('cachedSave', e.message);
            });
    }
    return response;
};

/**
 * create the fetch head
 */
export function getXhrOptions() {
    let options = { headers: {} };
    let token = localStorage.getItem('token');
    if (token) {
        token = JSON.parse(token);
        options.headers = [{ key: 'Authorization', value: `Bearer ${token.access_token}` }];
    }

    return options;
}

function isJSON(str) {
    return !_.isError(_.attempt(JSON.parse, str));
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *  skipConvert
 *  skipOauth
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(obj, options = {}) {
    // adapt the other param
    let url = obj;
    if (obj instanceof Object) {
        url = obj.url;
    }

    if (!options) {
        options = {};
    }

    /**
     * Produce fingerprints based on url and parameters
     * Maybe url has the same parameters
     */
    const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
    const hashcode = hash.sha256().update(fingerprint).digest('hex');

    const defaultOptions = {
        credentials: 'include',
        header: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        },
    };

    const newOptions = {
        ...defaultOptions,
        body: obj.data,
        ...obj,
        ...options,
    };
    if (
        newOptions.method === 'POST' ||
        newOptions.method === 'PUT' ||
        newOptions.method === 'PATCH' ||
        newOptions.method === 'DELETE'
    ) {
        if (!(newOptions.body instanceof FormData)) {
            newOptions.headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json; charset=utf-8',
                ...newOptions.headers,
            };
            newOptions.body = JSON.stringify(newOptions.body);
        } else {
            // newOptions.body is FormData
            newOptions.headers = {
                Accept: 'application/json',
                ...newOptions.headers,
            };
        }
    }

    const expirys = options.expirys;
    // options.expirys !== false, return the cache,

    if (options.expirys) {
        const cached = sessionStorage.getItem(hashcode);
        const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
        if (cached !== null && whenCached !== null) {
            const age = (Date.now() - whenCached) / 1000;
            if (age < expirys) {
                const response = new Response(new Blob([cached]));
                return response.json();
            }
            sessionStorage.removeItem(hashcode);
            sessionStorage.removeItem(`${hashcode}:timestamp`);
        }
    }

    return new Promise((resolve, reject) => {
        let token = localStorage.getItem('token');
        if (!token || options.skipOauth) {
            resolve(null);
            return;
        }

        token = JSON.parse(token);
        if (!token.expires || token.expires > Date.now()) {
            resolve(token);
        } else if (!options.skipOauth) {
            return new OAuthToken(oauth(), token)
                .refresh()
                .then((token) => {
                    token.data.expires = token.expires.getTime();
                    // 设置
                    localStorage.setItem('token', JSON.stringify(token.data));
                    resolve(token.data);
                })
                .catch((e) => {
                    getDvaApp()._store.dispatch({
                        type: 'login/logout',
                    });
                });
        } else {
            resolve(null);
        }
    })
        .then((token) => {
            if (token) {
                newOptions.headers = newOptions.headers || {};
                newOptions.headers.Authorization = `Bearer ${token.access_token}`;
            }

            return fetch(url, newOptions);
        })
        .then(checkStatus)
        .then((response) => cachedSave(response, hashcode))
        .then(async (response) => {
            if (options.skipConvert) {
                return response;
            }

            const type = response.headers.get('content-type');

            //  文件
            if (!type) {
                return;
            }

            if (type.indexOf('wav') > -1 || type.indexOf('zip') > -1) {
                return response.blob();
            } else if (type.indexOf('json') > -1) {
                const result = await response.json();
                let contentRange = response.headers.get('content-range');
                let total = null;
                if (!_.isNil(contentRange)) {
                    total = contentRange.split('/')[1];
                }
                if (Array.isArray(result)) {

                    contentRange = response.headers.get('content-range');
          
                    return { list: result, total: total && parseInt(total) };
                } else if (result.data && result.data.list) {
                    return { list: result.data.list, total: result.data.total, ...result };
                } else {
                    return { list: result.data, total: result.count || (total && parseInt(total)), ...result, contentRange };
                }
            } else {
                let txt = await response.text();
                // let temp = JSON.parse(txt)
                let temp = _.attempt(JSON.parse, txt);
                if (_.isError(temp)) {
                    return txt;
                } else {
                    return temp;
                }
            }
        })
        .catch((e) => {
            const status = e.status;
            if (status === 401 && getDvaApp()._store) {
                if (!window.location.href.includes('login')) {
                    getDvaApp()._store.dispatch({
                        type: 'login/logout',
                    });
                    throw e;
                }

                if (window.location.pathname == '/' || window.location.pathname == '/user/login') {
                    return new Promise((resolve, reject) => {
                        resolve(e);
                    });
                }
            }

            return new Promise((resolve, reject) => {
                reject(e);
            });
        });
}
