export class FetchStub {
  constructor() {
    this.orig = window.fetch;
    this.actions = [];
  }

  install() {
    window.fetch = (url, opt) => this.fetch(url, opt);
  }

  restore() {
    window.fetch = this.orig;
    this.actions = [];
  }

  async fetch(url, opts) {
    const action = this._getAction(url);
    if (!action) {
      return this.orig(url, opts);
    }
    let body;
    if (typeof action.data === 'function') {
      body = await action.data();
    } else {
      body = action.data;
    }
    const response = new Response(body, action.options);
    return Promise.resolve(response);
  }

  respondWith(url, data, options) {
    this.actions.push({
      url,
      data,
      options
    });
  }

  _getAction(url) {
    return this.actions.find((item) => {
      const actionUrl = item.url;
      if (typeof actionUrl.test === 'function') {
        return actionUrl.test(url);
      }
      return actionUrl === url;
    });
  }
}
