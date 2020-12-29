/* eslint-disable class-methods-use-this */
/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, html } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@advanced-rest-client/arc-icons/arc-icon.js';
import '@advanced-rest-client/date-time/date-time.js';
import elementStyles from './Browser.styles.js';

export const hasMoreValue = Symbol('hasMoreValue');
export const accessTokenValue = Symbol('accessTokenValue');
export const accessTokenChanged = Symbol('accessTokenChanged');
export const accessTokenSetupTemplate = Symbol('accessTokenSetupTemplate');
export const initializingTemplate = Symbol('initializingTemplate');
export const headerTemplate = Symbol('headerTemplate');
export const searchTemplate = Symbol('searchTemplate');
export const listTemplate = Symbol('listTemplate');
export const setAuthHeader = Symbol('setAuthHeader');
export const headersValue = Symbol('headersValue');
export const computeQuery = Symbol('computeQuery');
export const computeQueryParameters = Symbol('computeQueryParameters');
export const nextPageToken = Symbol('nextPageToken');
export const processApiResult = Symbol('processApiResult');
export const processApiError = Symbol('processApiError');
export const notifyInvalidToken = Symbol('notifyInvalidToken');
export const listItemTemplate = Symbol('listItemTemplate');
export const loadNextTemplate = Symbol('loadNextTemplate');
export const queryInputHandler = Symbol('queryInputHandler');
export const searchHandler = Symbol('searchHandler');
export const pickFileHandler = Symbol('pickFileHandler');
export const scrollHandler = Symbol('scrollHandler');

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('./types').ProjectedFile} ProjectedFile */
/** @typedef {import('./types').DriveListResponse} DriveListResponse */

/**
 * A fields projection requested from the Drive API.
 * Fields listed here are returned by the Drive query endpoint.
 */
export const fieldsProjection = 'files(capabilities/canEdit,capabilities/canDownload,isAppAuthorized' +
  ',createdTime,id,name,shared,size,webViewLink),nextPageToken';

/**
 * An element that renders a Google Drive assets browser that works in Electron.
 */
export class GoogleDriveBrowserElement extends EventsTargetMixin(LitElement) {
  static get styles() {
    return elementStyles;
  }

  /** 
   * @returns {boolean} Whether there are more items to be downloaded.
   */
  get hasMore() {
    return this[hasMoreValue];
  }

  /** 
   * @returns {boolean} Whether there are items to render.
   */
  get hasItems() {
    const { items } = this;
    return Array.isArray(items) && !!items.length;
  }

  /** 
   * @param {string} value The new token to use. This is set only property.
   */
  set accessToken(value) {
    const old = this[accessTokenValue];
    if (old === value) {
      return;
    }
    this[accessTokenValue] = value;
    this.requestUpdate('accessToken', old);
    this[accessTokenChanged](value);
  }

  get accessToken() {
    return null;
  }

  static get properties() {
    return {
      /** 
       * True when requesting data from Google Drive API.
       */
      loading: { type: Boolean, reflect: true, },
      /**
       * File search term entered by the user.
       */
      query: { type: String },
      /**
       * List of files retrieved from Drive API API.
       */
      items: { type: Array },
      /**
       * An error message from the API if any.
       */
      errorMessage: { type: String },
      /**
       * If set it generates a query to Google Drive that contains query to file properties.
       * E.g. (part of the query):
       * ```
       * and properties has { key='propertyKey' and value='propertyValue'}
       * ```
       *
       * Keys of this object will be put into the `key` part of query and
       * value of the key to the `value` property.
       *
       * For example:
       * ```
       * queryProperties = {
       *   'isExport': true
       * }
       * ```
       */
      queryProperties: { type: Object },
      /**
       * If true then it uses a negation for `queryProperties` (adding `not`)
       * before the query
       */
      queryPropertiesNegation: { type: Boolean },
      /**
       * A `pageSize` property value to be send to Drive endpoint.
       * Default: 50
       */
      pageSize: { type: Number },
      /**
       * Mime type of the file to search.
       */
      mimeType: { type: String },
      /** 
       * The OAuth 2 access token to use. The element won't start communicating with the API until this property is set.
       */
      accessToken: { type: String },
      /**
       * API key to use as `key` query parameter in Google Drive communication.
       */
      apiKey: { type: String },
      /**
       * When set it renders narrow view, mobile friendly.
       */
      narrow: { type: Boolean, reflect: true },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean },
      /**
       * Enables material design outlined theme
       */
      outlined: { type: Boolean }
    };
  }

  constructor() {
    super();
    /** @type string */
    this[accessTokenValue] = undefined;
    /** @type string */
    this.apiKey = undefined;
    /** @type boolean */
    this.loading = false;
    /** @type boolean */
    this.narrow = false;
    /** @type boolean */
    this.compatibility = false;
    /** @type boolean */
    this.outlined = false;
    /** @type boolean */
    this.queryPropertiesNegation = false;
    /** @type boolean */
    this[hasMoreValue] = true;
    /** @type string */
    this.query = undefined;
    /** @type string */
    this.errorMessage = undefined;
    /** @type string */
    this.mimeType = undefined;
    /** @type number */
    this.pageSize = 50;
    /** @type ProjectedFile[] */
    this.items = undefined;
    /** @type Record<string, any> */
    this.queryProperties = undefined;
  }

  /**
   * Called when access token changed. Makes the query with new token.
   * @param {string|undefined} token
   */
  [accessTokenChanged](token) {
    this[setAuthHeader](token);
    if (!token) {
      return;
    }
    this.queryNext();
  }

  async refresh() {
    this[nextPageToken] = undefined;
    this[hasMoreValue] = true;
    this.items = undefined;
    await this.queryNext();
  }

  async queryNext() {
    if (this.loading || !this[accessTokenValue] || !this.hasMore) {
      return;
    }
    this.loading = true;
    try {
      const uri = new URL('https://www.googleapis.com/drive/v3/files');
      uri.search = new URLSearchParams(this[computeQueryParameters]()).toString();
      const response = await fetch(uri.toString(), {
        headers: this[headersValue],
      });
      if (response.ok) {
        const data = /** @type DriveListResponse */ (await response.json());
        this[processApiResult](data);
      } else {
        const data = await response.text();
        this[processApiError](response.status, data)
      }
    } catch (e) {
      this.errorMessage = e.message;
    }
    this.loading = false;
  }

  /**
   * Computes and sets headers to be used with requests.
   * @param {string|undefined} token
   */
  [setAuthHeader](token) {
    const headers = /** @type Record<string, string> */ ({});
    if (token) {
      headers.authorization = `Bearer ${token}`;
    }
    this[headersValue] = /** @type Record<string, string> */ (headers);
  }

  /**
   * @returns {Record<string, string>} 
   */
  [computeQueryParameters]() {
    const params = {
      q: this[computeQuery](),
      pageSize: String(this.pageSize),
      fields: fieldsProjection,
      orderBy: 'modifiedTime desc'
    };
    if (this.apiKey) {
      params.key = this.apiKey;
    }
    if (this[nextPageToken]) {
      params.pageToken = this[nextPageToken];
    }
    return params;
  }

  /**
   * Builds the query (`q`) parameter for Google Drive API.
   *
   * @return {string} A value for the `q` query parameter
   */
  [computeQuery]() {
    const params = [];
    const mt = this.mimeType;
    if (mt) {
      params[params.length] = `mimeType="${mt}"`;
    }
    const qp = this.queryProperties;
    if (qp) {
      const negation = this.queryPropertiesNegation ? 'not ' : '';
      Object.keys(qp).forEach((key) => {
        params[params.length] = `${negation}properties has {key='${key}' and value='${qp[key]}'}`;
      });
    }
    if (this.query) {
      params[params.length] = `name contains '${this.query}'`;
    }
    return params.join(' and ');
  }

  /**
   * @param {DriveListResponse} response
   */
  [processApiResult](response) {
    if (!response) {
      return;
    }
    if (response.nextPageToken) {
      this[nextPageToken] = response.nextPageToken;
    }
    let items = response.files;
    if (Array.isArray(items)) {
      items = items.filter((item) => item.isAppAuthorized && item.capabilities.canDownload);
    }
    const hasItems = !!(items && items.length);
    if (!response.nextPageToken || !hasItems) {
      this[hasMoreValue] = false;
    }
    if (!hasItems) {
      return;
    }
    if (!this.items) {
      this.items = items;
      return;
    }
    this.items = [...this.items, ...items];
  }

  /**
   * Handler for the error response from the API.
   * @param {number} status Response status code
   * @param {string|Object} data API call response
   */
  [processApiError](status, data) {
    this.loading = false;
    let response = data;
    let message;
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
    switch (status) {
      case 0:
        message = 'You are offline.';
        break;
      case 400:
        /*
        User error. This can mean that a required field or parameter has not been provided,
        the value supplied is invalid, or the combination of provided fields is invalid.

        This error can be thrown when trying to add a duplicate parent to a Drive item. It can
        also be thrown when trying to add a parent that would create a cycle in the directory graph.
        */
        message = `The app caused the error in request: ${response.error.errors[0].message}`;
        break;
      case 401:
        if (this[accessTokenValue]) {
          this[notifyInvalidToken]();
        }
        return;
      case 403:
        switch (response.error.errors[0].reason) {
          case 'dailyLimitExceeded':
            message = 'API calls limit for the app has been reached. Try again tomorrow.';
            break;
          case 'userRateLimitExceeded':
            message = 'You reached your requests limit for the app. Try again tomorrow.';
            break;
          case 'rateLimitExceeded':
            message = 'You reached your requests limit for Drive. Try again tomorrow.';
            break;
          case 'appNotAuthorizedToFile':
            message = 'This application cannot open the file.';
            break;
          case 'insufficientFilePermissions':
            message = 'You do not have sufficient permissions to the file.';
            break;
          case 'domainPolicy':
            // The policy for the user's domain does not allow access to Google Drive by your app.
            message = 'The policy for your domain does not allow access to Google Drive ' +
              'by your app.';
            break;
          default:
            message = response.error.errors[0].message;
            break;
        }
        break;
      case 404:
        message = 'File not found (404).';
        break;
      case 500:
        message = 'Drive error: an unexpected error occurred while processing the request.';
        break;
      default: 
    }
    this.errorMessage = message;
  }

  [notifyInvalidToken]() {
    this.dispatchEvent(new Event('tokeninvalid'));
  }

  [queryInputHandler](e) {
    this.query = e.target.value;
  }

  [searchHandler]() {
    this.refresh();
  }

  /**
   * @param {Event} e
   */
  [pickFileHandler](e) {
    const node = /** @type HTMLElement */ (e.target);
    const item = /** @type HTMLElement */ (node.closest('.list-item'));
    const id = item.dataset.driveId;
    if (!id) {
      return;
    }
    this.dispatchEvent(new CustomEvent('pick', {
      detail: id,
    }));
  }

  [scrollHandler](e) {
    if (this.loading || !this.hasMore) {
      return;
    }
    const list = /** @type HTMLElement */ (e.target);
    const { scrollTop, offsetHeight, scrollHeight } = list;
    const delta = scrollHeight - (scrollTop + offsetHeight);
    if (delta < 100) {
      this.queryNext();
    }
  }

  // /**
  //  * Download the Google Drive file and reads it as string.
  //  *
  //  * @param {string} id The id of the file.
  //  */
  // async downloadFile(id) {
  //   if (!id) {
  //     return;
  //   }
  //   this.loading = true;
  //   const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
  //   const response = await fetch(url, {
  //     headers: this[headersValue],
  //   });
  //   const data = await response.text();
  //   if (response.ok) {
  //     return data;
  //   } else {
  //     this._handleDriveApiError(response.status, data);
  //   }
  // }

  render() {
    const ac = this[accessTokenValue];
    if (!ac) {
      return this[accessTokenSetupTemplate]();
    }
    const { hasItems, loading } = this;
    if (!hasItems && loading) {
      return this[initializingTemplate]();
    }
    return html`
    ${this[headerTemplate]()}
    ${this[searchTemplate]()}
    ${this[listTemplate]()}
    ${this[loadNextTemplate]()}
    `;
  }

  [accessTokenSetupTemplate]() {
    return html`<p class="init-info">Access token property is not set.</p>`;
  }

  [initializingTemplate]() {
    return html`<p class="init-info">Initializing the view.</p>`;
  }

  /**
   * @returns {TemplateResult} The template for the list header
   */
  [headerTemplate]() {
    const { compatibility } = this;
    return html`
    <header>
      <h2>Open Google Drive file</h2>
      <anypoint-button data-action="refresh-list" @click="${this.refresh}" ?compatibility="${compatibility}">Refresh</anypoint-button>
    </header>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the search input
   */
  [searchTemplate]() {
    const { compatibility, query, outlined } = this;
    return html`
    <div class="search">
      <anypoint-input
        role="textbox"
        title="Search for a file"
        noLabelFloat
        id="search"
        .value="${query}"
        type="search"
        @input="${this[queryInputHandler]}"
        @search="${this[searchHandler]}"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
      >
        <label slot="label">Search</label>
        <anypoint-icon-button
          class="search-icon"
          @click="${this[searchHandler]}"
          data-action="search"
          title="Search"
          ?compatibility="${compatibility}"
          slot="suffix"
          tabindex="-1"
        >
          <arc-icon icon="search"></arc-icon>
        </anypoint-icon-button>
      </anypoint-input>

    </div>
    `;
  }

  /**
   * @returns {TemplateResult} The template for the current results
   */
  [listTemplate]() {
    const { hasItems, items } = this;
    if (!hasItems) {
      return html`<p>No data to show</p>`;
    }
    return html`
    <div class="files-list" @scroll="${this[scrollHandler]}">
      ${items.map((item) => this[listItemTemplate](item))}
    </div>
    `;
  }

  /**
   * @param {ProjectedFile} file
   * @returns {TemplateResult} The template for the list item
   */
  [listItemTemplate](file) {
    const { compatibility } = this;
    const { id, name, shared, createdTime, size, capabilities } = file;
    const iconTite = shared ? 'Shared with you' : 'You own this file';
    return html`
    <div class="list-item" data-drive-id="${id}">
      <div class="icon-item" title="${iconTite}">
        <arc-icon icon="${ shared ? 'folderShared' : 'insertDriveFile' }"></arc-icon>
      </div>
      <div class="item-body">
        <div>${name}</div>
        <div class="secondary">
          <span class="meta">Created:
            <date-time
              .date="${createdTime}"
              year="numeric"
              month="short"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
            ></date-time>
          </span>
          <span class="meta">Size: ${size}</span>
        </div>
      </div>
      <anypoint-button
        class="main-action"
        data-action="open-item"
        @click="${this[pickFileHandler]}"
        emphasis="medium"
        ?disabled="${!capabilities.canDownload}"
        ?compatibility="${compatibility}"
      >Open</anypoint-button>
    </div>
    `;
  }

  /**
   * @returns {TemplateResult|string} The template for the load more button
   */
  [loadNextTemplate]() {
    const { hasMore, compatibility } = this;
    if (!hasMore) {
      return '';
    }
    return html`
    <anypoint-button ?compatibility="${compatibility}" @click="${this.queryNext}" ?disabled="${this.loading}">Load more</anypoint-button>
    `;
  }
}
