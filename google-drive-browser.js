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
import {PolymerElement} from '../../@polymer/polymer/polymer-element.js';
import {EventsTargetMixin} from '../../@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
import '../../@polymer/polymer/lib/utils/render-status.js';
import '../../@polymer/iron-pages/iron-pages.js';
import '../../@polymer/iron-ajax/iron-ajax.js';
import '../../@polymer/paper-progress/paper-progress.js';
import '../../@polymer/iron-flex-layout/iron-flex-layout.js';
import '../../@advanced-rest-client/error-message/error-message.js';
import '../../@advanced-rest-client/arc-icons/arc-icons.js';
import './google-drive-authorize.js';
import './google-drive-list-view.js';
import './google-drive-app-not-authorized.js';
/**
 * A file browser for Google Drive
 *
 * This component needs an access token to be provided in order to get data from user's Drive.
 *
 * ## List sizing
 *
 * The list uses `iron-list` which requires to be sized. It has to have
 * a height otherwise it will have height of 0.
 *
 * You can use flex layout to streach the component to the height of the page
 * or just add `height: 100%` to the element styles.
 *
 * ## Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--google-drive-browser` | Mixin applied to the element | `{}`
 * `--arc-font-headline` | Mixin applied to the header | `{}`
 * `--action-button` | Mixin applied to the main action button | `{}`
 * `--secondary-action-button-color` | Color of the secondary acction button | `--primary-color`
 * `--google-drive-browser-title` | Mixin applied to the headers | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 * @appliesMixin EventsTargetMixin
 */
class GoogleDriveBrowser extends EventsTargetMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      height: inherit;
      min-height: inherit;
      @apply --layout-vertical;
      @apply --arc-font-body1;
      @apply --google-drive-browser;
    }

    iron-pages {
      @apply --layout-vertical;
      @apply --layout-flex;
    }

    paper-progress {
      width: calc(100% - 32px);
      margin: 0 16px;
    }

    .main-action {
      @apply --action-button;
      height: 36px;
      font-size: 14px;
    }

    google-drive-list-view {
      @apply --layout-vertical;
      @apply --layout-flex;
    }
    </style>
    <template is="dom-if" if="[[loading]]">
      <paper-progress indeterminate=""></paper-progress>
    </template>
    <iron-pages selected="[[selectedView]]">
      <google-drive-authorize scope="[[scope]]"></google-drive-authorize>
      <google-drive-list-view items="[[items]]" on-load-next-page="_queryFiles" on-drive-file-search="_onSearch" on-drive-file-open="_onOpenFile" on-refresh-list="refresh" on-app-not-authorized-error="_appNotAuthorizedHandler"></google-drive-list-view>
      <section>
        <error-message>
          <p>[[errorMessage]]</p>
          <paper-button on-click="showList" class="main-action">Back to the list</paper-button>
        </error-message>
      </section>
      <google-drive-app-not-authorized on-back="showList"></google-drive-app-not-authorized>
    </iron-pages>
    <iron-ajax id="query" url="https://www.googleapis.com/drive/v3/files" params="[[queryParams]]" handle-as="json" on-response="_onDriveListResponse" on-error="_handleDriveApiError" debounce-duration="300"></iron-ajax>
    <iron-ajax id="download" url="https://www.googleapis.com/drive/v3/files/[[_fileId]]?alt=media" handle-as="text" on-response="_handleDownloadResponse" on-error="_handleDriveApiError" debounce-duration="300"></iron-ajax>
`;
  }

  static get is() {return 'google-drive-browser';}
  static get properties() {
    return {
      // True if Google Drive operation pending
      loading: {
        type: Boolean,
        notify: true
      },
      /**
       * File search term entered by the user.
       */
      query: String,
      /**
       * List of files retreived from Drive API.
       */
      items: Array,
      /**
       * OAuth2 scope for drive.
       */
      scope: {
        type: String,
        value() {
          let scope = 'https://www.googleapis.com/auth/drive.file ';
          scope += 'https://www.googleapis.com/auth/drive.install';
          return scope;
        }
      },
      /**
       * An error message from the API if any.
       */
      errorMessage: String,
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
      queryProperties: Object,
      /**
       * If true then it uses a negation for `queryProperties` (adding `not`)
       * before the query
       */
      queryPropertiesNegation: Boolean,
      // A `pageSize` property value to be send to Drive endpoint.
      querySize: {
        type: Number,
        value: 50
      },
      /**
       * Mime type of the file to search.
       */
      mimeType: String,
      /**
       * Currently opened view
       */
      selectedView: {
        type: Number,
        readOnly: true
      },
      /**
       * Query parameters to be set with a file query call.
       */
      queryParams: {
        type: Object,
        readOnly: true
      },
      // OAuth 2 access token.
      accessToken: {
        type: String,
        observer: '_accessTokenChanged'
      },
      /**
       * API key to use as `key` query parameter.
       */
      apiKey: String,
      /**
       * Used when paginating over results, returned from Drive API.
       */
      _nextPageToken: String,
      /**
       * Current drive file ID.
       */
      _fileId: String,
      // True when there's no more result for current query.
      hasMore: {
        type: Boolean,
        readOnly: true,
        value: true,
        notify: true
      },
      /**
       * A fileds projection requested from the Drive API.
       * Fields listed here are returned by the Drive query endpoint.
       */
      fieldsProjection: {
        type: String,
        readOnly: true,
        value() {
          let fields = 'files(capabilities/canEdit,capabilities/canDownload,isAppAuthorized';
          fields += ',createdTime,id,name,shared,size,webViewLink),nextPageToken';
          return fields;
        }
      }
    };
  }

  constructor() {
    super();
    this._signedinHandler = this._signedinHandler.bind(this);
    this._signoutHandler = this._signoutHandler.bind(this);
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
  /**
   * Handler for the `google-signin-success` event. If the `scope`
   * property set on the `detail` object matches `scope` set on this element
   * then it sets the `accessToken` property from detail's `token` property.
   *
   * @param {CustomEvent} e
   */
  _signedinHandler(e) {
    this.shadowRoot.querySelector('google-drive-authorize').authorizing = false;
    if (!this._hasScope(e.detail.scope)) {
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
    this.shadowRoot.querySelector('google-drive-authorize').authorizing = false;
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
      let localScope = scopes[i].trim();
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
      return this._setSelectedView(0);
    }
    this._setSelectedView(1);
    if (!this.items) {
      this._queryFiles();
    }
  }
  // Resets the view when token value change.
  _accessTokenChanged(token) {
    this._setAuthHeader(token);
    if (!token) {
      this._setSelectedView(0);
    } else {
      this._setSelectedView(1);
      if (!this.items) {
        this._queryFiles();
      }
    }
  }

  // Forces the view to display list view.
  showList() {
    this._setSelectedView(1);
  }

  /**
   * Query for the files on Google Drive.
   */
  _queryFiles() {
    if (this.loading || !this.accessToken || !this.hasMore) {
      return;
    }
    this.loading = true;
    this._setQueryParameters();
    this.$.query.generateRequest();
  }
  /**
   * Builds the query (`q`) parameter for Google Drive API.
   *
   * @return {String} A value for the `q` query parameter
   */
  _buildQuery() {
    let q = 'trashed = false';
    const mt = this.mimeType;
    if (mt) {
      q += ' and mimeType="' + mt + '"';
    }
    const qp = this.queryProperties;
    if (qp) {
      const negation = this.queryPropertiesNegation ? ' not' : '';
      Object.keys(qp).forEach((key) => {
        q += ` and${negation} properties has {key='${key}' and value='${qp[key]}'}`;
      });
    }
    if (this.query) {
      q += ` and name contains '${this.query}'`;
    }
    return q;
  }
  /**
   * Updates the `queryParams` property for current UI state.
   */
  _setQueryParameters() {
    const params = {
      'q': this._buildQuery(),
      'pageSize': this.querySize,
      'fields': this.fieldsProjection,
      'orderBy': 'modifiedTime desc'
    };
    if (this.apiKey) {
      params.key = this.apiKey;
    }
    if (this._nextPageToken) {
      params.pageToken = this._nextPageToken;
    }
    this._setQueryParams(params);
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
    this.$.query.headers = headers;
    this.$.download.headers = headers;
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
    this._setHasMore(true);
    this.items = undefined;
    this._queryFiles();
  }

  /**
   * Handler for the Drive list response.
   */
  _onDriveListResponse() {
    this.loading = false;
    const response = this.$.query.lastResponse;
    this._nextPageToken = response.nextPageToken;
    const items = response.files;
    const hasItems = !!(items && items.length);
    if (!response.nextPageToken || !hasItems) {
      this._setHasMore(false);
    }
    if (!hasItems) {
      return;
    }
    if (!this.items) {
      this.set('items', items);
      return;
    }
    response.files.forEach((item) => {
      this.push('items', item);
    });
  }

  /**
   * Ajax call to Drive API error handler
   * @param {CustomEvent} e
   */
  _handleDriveApiError(e) {
    this.loading = false;
    let message;
    let response = e.detail.request.xhr.response;
    if (typeof response === 'string') {
      response = JSON.parse(response);
    }
    switch (e.detail.request.status) {
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
        this._setSelectedView(0);
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
            // The requesting app is not on the ACL for the file. The user never explicitly opened
            // the file with this Drive app.
            const id = this._fileId;
            const file = this.items.find((item) => item.id === id);
            this._explainAppNotAuthorized(file);
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
    this._setSelectedView(2);
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
    this.shadowRoot.querySelector('google-drive-app-not-authorized').item = file;
    this._setSelectedView(3);
  }
  /**
   * Handler when user select a file from file picker.
   *
   * @param {CustomEvent} e
   */
  _onOpenFile(e) {
    this._downloadFile(e.detail.item.id);
  }
  /**
   * Download and read a Google Drive item.
   *
   * @param {String} id An item ID. This will show an error if the file wasn't created by this app
   * (e.g. old version of the app).
   */
  _downloadFile(id) {
    if (!id) {
      console.error('Trying to open Drive item without ID');
      return;
    }
    this.loading = true;
    this._fileId = id;
    this.$.download.generateRequest();
  }
  /**
   * Ajax call success handler for file download.
   */
  _handleDownloadResponse() {
    this.loading = false;
    const response = this.$.download.lastResponse;
    this.dispatchEvent(new CustomEvent('drive-file-picker-data', {
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
    const item = e.detail.item;
    this._explainAppNotAuthorized(item);
  }
  /**
   * Fired when the file content is ready.
   *
   * @event drive-file-picker-data
   * @param {String} content File content downloaded from the drive.
   * @param {String} driveId Drive file ID
   */
}
window.customElements.define(GoogleDriveBrowser.is, GoogleDriveBrowser);
