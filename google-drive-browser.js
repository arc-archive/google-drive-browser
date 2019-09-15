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
import { LitElement, html, css } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-progress/paper-progress.js';
import '@advanced-rest-client/error-message/error-message.js';;
import './google-drive-authorize.js';
import './google-drive-list-view.js';
import './google-drive-app-not-authorized.js';
/**
 * A fileds projection requested from the Drive API.
 * Fields listed here are returned by the Drive query endpoint.
 */
const fieldsProjection = 'files(capabilities/canEdit,capabilities/canDownload,isAppAuthorized' +
  ',createdTime,id,name,shared,size,webViewLink),nextPageToken';
/**
 * A file browser for Google Drive
 *
 * This component needs an access token to be provided in order to get data from user's Drive.
 *
 * ## Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--arc-font-body1-font-size` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-font-weight` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-line-height` | ARC theme variable. Applied to the element. | `inherit`
 * `--action-button-background-color` | ARC theme. Applied to action button | ``
 * `--action-button-background-image` | ARC theme. Applied to action button | ``
 * `--action-button-color` | ARC theme. Applied to action button | ``
 * `--action-button-transition`| ARC theme. Applied to action button | ``
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 */
class GoogleDriveBrowser extends EventsTargetMixin(LitElement) {
  static get styles() {
    return css`
    :host {
      display: block;
      height: inherit;
      min-height: inherit;
      display: flex;
      flex-direction: column;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    iron-pages {
      display: flex;
      flex-direction: column;
      flex: 1;
      flex-basis: 0.000000001px;
    }

    paper-progress {
      width: calc(100% - 32px);
      margin: 0 16px;
    }

    google-drive-list-view {
      display: flex;
      flex-direction: column;
      flex: 1;
      flex-basis: 0.000000001px;
    }`;
  }

  _renderView(selectedView, narrow) {
    const { compatibility, outlined } = this;
    switch (selectedView) {
      case 0: return html`<google-drive-authorize
        .scope="${this.scope}"
        ?authorizing="${this.authorizing}"
        ?narrow="${narrow}"
        ?compatibility="${compatibility}"></google-drive-authorize>`;
      case 1: return html`<google-drive-list-view
        .items="${this.items}"
        ?narrow="${narrow}"
        ?compatibility="${compatibility}"
        ?outlined="${outlined}"
        @load-next="${this._queryFiles}"
        @refresh-list="${this.refresh}"
        @search="${this._onSearch}"
        @file-open="${this._onOpenFile}"
        @file-auth-info="${this._appNotAuthorizedHandler}"></google-drive-list-view>`;
      case 2: return html`<section>
        <error-message ?compatibility="${compatibility}">
          <p>${this.errorMessage}</p>
          <anypoint-button
            @click="${this.showList}"
            class="main-action"
          >Back to the list</anypoint-button>
        </error-message>
      </section>`;
      case 3: return html`<google-drive-app-not-authorized
        .item="${this._authErrorItem}"
        ?narrow="${narrow}"
        ?compatibility="${compatibility}"
        @back="${this.showList}"></google-drive-app-not-authorized>`;
    }
  }

  render() {
    const { loading, selectedView, narrow } = this;
    return html`
    ${loading ? html`<paper-progress indeterminate></paper-progress>` : undefined}
    ${this._renderView(selectedView, narrow)}`;
  }

  static get properties() {
    return {
      // True if Google Drive operation pending
      loading: { type: Boolean },
      /**
       * File search term entered by the user.
       */
      query: { type: String },
      /**
       * List of files retreived from Drive API.
       */
      items: { type: Array },
      /**
       * OAuth2 scope for drive.
       */
      scope: { type: String },
      /**
       * An error message from the API if any.
       */
      errorMessage: { type: String },
      /**
       * If set it generates a query to Google Drive that contains query to file
       * properies.
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
       *
       * @type {Number}
       */
      querySize: { type: Number },
      /**
       * Mime type of the file to search.
       */
      mimeType: { type: String },
      /**
       * Currently opened view
       */
      selectedView: { type: Number },
      /**
       * Query parameters to be set with a file query call.
       */
      _queryParams: { type: Object },
      // OAuth 2 access token.
      accessToken: { type: String },
      /**
       * API key to use as `key` query parameter.
       */
      apiKey: { type: String },
      /**
       * Used when paginating over results, returned from Drive API.
       */
      _nextPageToken: { type: String },
      // True when there's no more result for current query.
      _hasMore: { type: Boolean },
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

  get accessToken() {
    return this._accessToken;
  }

  set accessToken(value) {
    const old = this._accessToken;
    if (old === value) {
      return;
    }
    this._accessToken = value;
    this.requestUpdate('accessToken', value);
    this._accessTokenChanged(value);
  }

  get ongoogleauthorize() {
    return this._ongoogleauthorize;
  }

  set ongoogleauthorize(value) {
    this.__registerCallback('ongoogleauthorize', 'google-authorize', value);
  }

  get ondrivefile() {
    return this._ondrivefile;
  }

  set ondrivefile(value) {
    this.__registerCallback('ondrivefile', 'drive-file', value);
  }

  get onoauth2tokeninvalid() {
    return this._onoauth2tokeninvalid;
  }

  set onoauth2tokeninvalid(value) {
    this.__registerCallback('onoauth2tokeninvalid', 'oauth-2-token-invalid', value);
  }

  constructor() {
    super();
    this._signedinHandler = this._signedinHandler.bind(this);
    this._signoutHandler = this._signoutHandler.bind(this);

    let scope = 'https://www.googleapis.com/auth/drive.file ';
    scope += 'https://www.googleapis.com/auth/drive.install';
    this.scope = scope;
    this.querySize = 50;
    this._hasMore = true;
  }

  _attachListeners(node) {
    node.addEventListener('google-signin-success', this._signedinHandler);
    node.addEventListener('google-signout', this._signoutHandler);
    this._initView();
  }

  _detachListeners(node) {
    node.removeEventListener('google-signin-success', this._signedinHandler);
    node.removeEventListener('google-signout', this._signoutHandler);
  }

  __registerCallback(prop, eventName, value) {
    const key = '_' + prop;
    if (this[key]) {
      this.removeEventListener(eventName, this[key]);
    }
    if (typeof value !== 'function') {
      this[key] = null;
      return;
    }
    this[key] = value;
    this.addEventListener(eventName, value);
  }
  /**
   * Handler for the `google-signin-success` event. If the `scope`
   * property set on the `detail` object matches `scope` set on this element
   * then it sets the `accessToken` property from detail's `token` property.
   *
   * @param {CustomEvent} e
   */
  _signedinHandler(e) {
    this.authorizing = false;
    if (e.detail.scope && !this._hasScope(e.detail.scope)) {
      return;
    }
    this.accessToken = e.detail.token;
  }
  /**
   * Handler for the `google-signin-success` custom event.
   * Clears the `accessToken` property.
   */
  _signoutHandler() {
    this.accessToken = undefined;
    this.authorizing = false;
  }
  /**
   * Checks if current `scope` matches passed `scope` value.
   * @param {String} scope Scope to check
   * @return {Boolean} True if `scope` set on this element matches passed value.
   */
  _hasScope(scope) {
    if (!scope) {
      return false;
    }
    const localScope = this.scope;
    if (!localScope) {
      return true;
    }
    const scopes = localScope.split(' ');
    let hasScope = false;
    for (let i = 0, len = scopes.length; i < len; i++) {
      const localScope = scopes[i].trim();
      if (!localScope) {
        continue;
      }
      if (scope.indexOf(localScope) !== -1) {
        hasScope = true;
        break;
      }
    }
    return hasScope;
  }
  // Chooses a view depending on athorization value.
  _initView() {
    if (!this.accessToken) {
      this.selectedView = 0;
      return;
    }
    this.selectedView = 1;
    if (!this.items) {
      this._queryFiles();
    }
  }
  // Resets the view when token value change.
  _accessTokenChanged(token) {
    this._setAuthHeader(token);
    if (!token) {
      this.selectedView = 0;
    } else {
      this.selectedView = 1;
      if (!this.items) {
        this._queryFiles();
      }
    }
  }

  // Forces the view to display list view.
  showList() {
    this.selectedView = 1;
    this._authErrorItem = undefined;
  }

  /**
   * Query for the files on Google Drive.
   */
  async _queryFiles() {
    if (this.loading || !this.accessToken || !this._hasMore) {
      return;
    }
    this.loading = true;
    this._setQueryParameters();
    let url = 'https://www.googleapis.com/drive/v3/files?';
    Object.keys(this._queryParams).forEach((key, i) => {
      if (i !== 0) {
        url += '&';
      }
      const param = window.encodeURIComponent(key);
      const value = window.encodeURIComponent(this._queryParams[key]);
      url += param + '=' + value;
    });
    const response = await fetch(url, {
      headers: this._headers
    });
    if (response.ok) {
      const data = await response.json();
      this._onDriveListResponse(data);
    } else {
      const data = await response.text();
      this._handleDriveApiError(response.status, data);
    }
  }
  /**
   * Builds the query (`q`) parameter for Google Drive API.
   *
   * @return {String} A value for the `q` query parameter
   */
  _buildQuery() {
    const params = [];
    const mt = this.mimeType;
    if (mt) {
      params[params.length] = 'mimeType="' + mt + '"';
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
   * Updates the `queryParams` property for current UI state.
   */
  _setQueryParameters() {
    const params = {
      q: this._buildQuery(),
      pageSize: this.querySize,
      fields: fieldsProjection,
      orderBy: 'modifiedTime desc'
    };
    if (this.apiKey) {
      params.key = this.apiKey;
    }
    if (this._nextPageToken) {
      params.pageToken = this._nextPageToken;
    }
    this._queryParams = params;
  }
  /**
   * Sets the authorization header on the Ajax request objects. It affects
   * query and download requests.
   *
   * @param {String} at Access token value. If empty it clears the headers.
   */
  _setAuthHeader(at) {
    const headers = {};
    if (at) {
      headers.authorization = 'Bearer ' + this.accessToken;
    }
    this._headers = headers;
  }

  refresh() {
    this._resetQuery();
  }
  /**
   * Called when user accept search query.
   * @param {CustomEvent} e
   */
  _onSearch(e) {
    this.query = e.detail.q;
    this._resetQuery();
  }
  /**
   * Reset current query data.
   */
  _resetQuery() {
    this._nextPageToken = undefined;
    this._hasMore = true;
    this.items = undefined;
    this._queryFiles();
  }

  /**
   * Handler for the Drive list response.
   * @param {?Object} response API call response
   */
  _onDriveListResponse(response) {
    this.loading = false;
    if (!response) {
      return;
    }
    this._nextPageToken = response.nextPageToken;
    const items = response.files;
    const hasItems = !!(items && items.length);
    if (!response.nextPageToken || !hasItems) {
      this._hasMore = false;
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
   * Ajax call to Drive API error handler
   * @param {Number} status Response status code
   * @param {String|Object} response API call response
   */
  _handleDriveApiError(status, response) {
    this.loading = false;
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
        message = 'The app caused the error in request: ' + response.error.errors[0].message;
        break;
      case 401:
        this.selectedView = 0;
        if (this.accessToken) {
          this._notifyInvalidToken();
        }
        return;
      case 403:
        switch (response.error.errors[0].reason) {
          case 'dailyLimitExceeded':
            message = 'API calls limit for the app has been reqached. Try again tomorrow.';
            break;
          case 'userRateLimitExceeded':
            message = 'You reached your requests limit for the app. Try again tomorrow.';
            break;
          case 'rateLimitExceeded':
            message = 'You reached your requests limit for Drive. Try again tomorrow.';
            break;
          case 'appNotAuthorizedToFile':
            this._appNotAuthorizedToFile();
            return;
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
    }
    this.errorMessage = message;
    this.selectedView = 2;
  }
  /**
   * The requesting app is not on the ACL for the file. The user never explicitly opened
   * the file with this Drive app.
   */
  _appNotAuthorizedToFile() {
    const id = this._fileId;
    const file = this.items.find((item) => item.id === id);
    this._explainAppNotAuthorized(file);
  }
  /**
   * If an item wasn't created by the application or never opened by it,
   * it is not possible to open an item with the API> User has to gi to
   * Drive UI and opend with ARC using Drive UI.
   * This opens the page that describe the issue.
   *
   * @param {Object} file
   */
  _explainAppNotAuthorized(file) {
    this.selectedView = 3;
    this._authErrorItem = file;
  }
  /**
   * Handler when user select a file from file picker.
   *
   * @param {CustomEvent} e
   */
  _onOpenFile(e) {
    this._downloadFile(e.detail.id);
  }
  /**
   * Download and read a Google Drive item.
   *
   * @param {String} id An item ID. This will show an error if the file wasn't created by this app
   * (e.g. old version of the app).
   */
  async _downloadFile(id) {
    if (!id) {
      return;
    }
    this.loading = true;
    this._fileId = id;
    const url = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;
    const response = await fetch(url, {
      headers: this._headers
    });
    const data = await response.text();
    if (response.ok) {
      this._handleDownloadResponse(data);
    } else {
      this._handleDriveApiError(response.status, data);
    }
  }
  /**
   * Ajax call success handler for file download.
   *
   * @param {String} response API call response
   */
  _handleDownloadResponse(response) {
    this.loading = false;
    this.dispatchEvent(new CustomEvent('drive-file', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        content: response,
        diveId: this._fileId
      }
    }));
    this._fileId = undefined;
  }
  // Handles event sent by the list to display download info.
  _appNotAuthorizedHandler(e) {
    const item = e.detail;
    this._explainAppNotAuthorized(item);
  }
  /**
   * Dispatches `oauth-2-token-invalid` event
   */
  _notifyInvalidToken() {
    this.dispatchEvent(new CustomEvent('oauth-2-token-invalid', {
      composed: true,
      bubbles: true,
      detail: {
        accessToken: this.accessToken,
        scope: this.scope
      }
    }));
  }
  /**
   * Fired when the file content is ready.
   *
   * @event drive-file
   * @param {String} content File content downloaded from the drive.
   * @param {String} driveId Drive file ID
   */

  /**
   * Dispatched when `accessToken` is set but the server returned 401 status
   * code.
   *
   * @event oauth-2-token-invalid
   * @param {String} accessToken Current access token
   * @param {String} scope Current scope value.
   */
}
window.customElements.define('google-drive-browser', GoogleDriveBrowser);
