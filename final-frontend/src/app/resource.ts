const url = 'https://webdev-dummy.herokuapp.com'

const resource = (method, endpoint, payload) => {
    const options: RequestInit = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }
    if (payload) {
        options.body = JSON.stringify(payload);
    }

    return fetch(`${url}/${endpoint}`, options)
        .then(r => {
            if (r.status === 200) {
                if (r.headers.get('Content-Type').indexOf('json') > 0) {
                    return r.json();
                } else {
                    return r.text();
                }
            } else {
                // useful for debugging, but remove in production
                console.error(`${method} ${endpoint} ${r.statusText}`);
                throw new Error(r.statusText);
            }
        })
}

const toggle = (show) => {
    const toggleElement = _show => id => {
        const el = document.querySelector(id);
        if (el) {
            el.style.display = _show ? 'inline' : 'none';
        }
    };
    ['#username', '#password', '#login'].forEach(toggleElement(show));
    ['#logout', '#headline', '#newHeadline'].forEach(toggleElement(!show));
};

const getMethod = (options) => (options && options.method) ? options.method : 'GET'

const fetch: any = (url, options) => {
    return new Promise((resolve, reject) => {
        const method = getMethod(options)
        if (!_mocks[method] || !_mocks[method][url] || _mocks[method][url].length == 0) {
            reject(new Error(`No mock available for ${method} ${url} : ${options}`))
        }
        resolve(_mocks[method][url].shift())
    })
}

fetch.isMock = () => true

const _mocks = {}

const mock = (url, options) => {
    const method = getMethod(options)
    if (!_mocks[method]) {
        _mocks[method] = {}
    }
    if (!_mocks[method][url]) {
        _mocks[method][url] = []
    }

    var response = <any>{};

    Object.keys(options).forEach(key => {
        response[key] = options[key]
    })
    if (!response.status) {
        response.status = 200
    }
    if (!response.headers) {
        response.headers = {}
    }
    response.headers.get = (key) => options.headers[key]
    response.json = () => new Promise((resolve, reject) => resolve(options.json))
    response.text = () => new Promise((resolve, reject) => resolve(options.text))
    _mocks[method][url].push(response)
}

export { url, mock, fetch, resource };