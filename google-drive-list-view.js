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
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@advanced-rest-client/arc-scroll-threshold/arc-scroll-threshold.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import '@advanced-rest-client/date-time/date-time.js';
/**
 * Units for file size
 * @type {Array<String>}
 */
const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
/**
 * Google Drive files list view.
 *
 * It renders items using model returend by Google Drive API.
 *
 * Required properties of model items:
 * - capabilities.canDownload
 * - shared
 * - name
 * - createdTime
 * - size
 * - isAppAuthorized
 *
 * ## Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--arc-font-body1-font-size` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-font-weight` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-body1-line-height` | ARC theme variable. Applied to the element. | `inherit`
 * `--arc-font-headline-font-size` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-font-weight` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-letter-spacing` | ARC theme. Applied to the title | `initial`
 * `--arc-font-headline-line-height` | ARC theme. Applied to the title | `initial`
 * `--action-button-background-color` | ARC theme. Applied to action button | ``
 * `--action-button-background-image` | ARC theme. Applied to action button | ``
 * `--action-button-color` | ARC theme. Applied to action button | ``
 * `--action-button-transition`| ARC theme. Applied to action button | ``
 * `--google-drive-list-view-file-icon-color` | | `rgba(0, 0, 0, 0.54)`
 * `--google-drive-list-view-search-icon-color` | | `rgba(0, 0, 0, 0.54)`
 * `--google-drive-list-view-item-disabled-color` | | `rgba(0, 0, 0, 0.45)`
 * `--google-drive-list-view-selected-background-color` | | `#e0e0e0`
 *
 * @customElement
 * @demo demo/list-view.html
 * @demo Drive Picker demo/index.html
 * @memberof UiElements
 */
class GoogleDriveListView extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      position: relative;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
      height: 100%;
    }

    .container {
      display: flex;
      flex-direction: column;
      flex: 1;
      flex-basis: 0.000000001px;
      height: inherit;
    }

    header {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    :host([narrow]) header {
      flex-direction: column;
    }

    h2 {
      margin-left: 16px;
      font-size: var(--arc-font-headline-font-size, initial);
      font-weight: var(--arc-font-headline-font-weight, initial);
      letter-spacing: var(--arc-font-headline-letter-spacing, initial);
      line-height: var(--arc-font-headline-line-height, initial);
      flex: 1;
      flex-basis: 0.000000001px;
    }

    .search {
      margin: 0 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .search [type="search"] {
      flex: 1;
      flex-basis: 0.000000001px;
    }

    .list {
      flex: 1;
      flex-basis: 0.000000001px;
      overflow: auto;
    }

    .shared-icon {
      color: var(--google-drive-list-view-file-icon-color, rgba(0, 0, 0, 0.54));
    }

    .search-icon {
      color: var(--google-drive-list-view-search-icon-color, rgba(0, 0, 0, 0.54));
    }

    .list-item.disabled {
      pointer-events: none;
      color: var(--google-drive-list-view-item-disabled-color, rgba(0, 0, 0, 0.45)) !important;
    }

    .iron-selected {
      background-color: var(--google-drive-list-view-selected-background-color, #e0e0e0);
    }

    .main-action {
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .main-action[disabled] {
      background: var(--action-button-disabled-background-color);
      color: var(--action-button-disabled-color);
      cursor: auto;
      pointer-events: none;
    }

    .main-action:not([disabled]):hover {
      background-color: var(--action-button-hover-background-color);
      color: var(--action-button-hover-color);
    }

    .meta {
      margin-right: 8px;
    }`;
  }

  _listItemTeamplate(item, iconPrefix) {
    return html`<paper-icon-item data-drive-id="${item.id}"
      class="list-item ${this._computeItemClass(item.capabilities.canDownload)}">
      <iron-icon .icon="${this._computeIcon(item.shared, iconPrefix)}"
        class="shared-icon" slot="item-icon" title="${this._computeIconTitle(item.shared)}"></iron-icon>
      <paper-item-body two-line>
        <div class="name-label">${item.name}</div>
        <div secondary>
          <span class="meta">Created:
            <date-time .date="${item.createdTime}" year="numeric" month="short" day="numeric"
              hour="2-digit" minute="2-digit"></date-time>
          </span>
          <span class="meta">Size: ${this._computeSize(item.size)}</span>
        </div>
      </paper-item-body>
      ${item.isAppAuthorized ?
        html`<paper-button class="main-action" data-action="open-item"
          @click="${this._openItem}" raised ?disabled="${!item.capabilities.canDownload}">Open</paper-button>` :
        html`<paper-button class="main-action" data-action="download-info"
          @click="${this._downloadAppInfo}" raised>Info</paper-button>`
}
    </paper-icon-item>`;
  }

  _listTemplate(items, iconPrefix) {
    if (!items || !items.length) {
      return;
    }
    return html`<paper-listbox class="list" id="list" selectable=":not(.disabled)">
    ${items.map((item) => this._listItemTeamplate(item, iconPrefix))}
    </paper-listbox>
    <arc-scroll-threshold
      @lower-threshold="${this.nextPage}"
      id="threshold"
      scrolltarget="list"></arc-scroll-threshold>`;
  }

  render() {
    const { query, iconPrefix, items } = this;
    return html`
    <div class="container">
      <header>
        <h2>Open Google Drive file</h2>
        <paper-button data-action="refresh-list" @click="${this._refresh}">Refresh</paper-button>
      </header>
      <div class="search">
        <paper-input
          role="textbox"
          title="Search for a file"
          label="Search"
          no-label-float
          id="search"
          .value="${query}"
          type="search"
          @input="${this._queryInputHandler}"></paper-input>
        <paper-icon-button
          .icon="${this._computeSearchIcon(iconPrefix, 'search')}"
          class="search-icon"
          @click="${this._searchAction}"
          data-action="search"
          title="Search"></paper-icon-button>
      </div>
      ${this._listTemplate(items, iconPrefix)}
    </div>`;
  }

  static get properties() {
    return {
      // List of items to display. Query result from the Drive API
      items: { type: Array },
      // Current filter value
      query: { type: String },
      /**
       * Icon prefix from the svg icon set. This can be used to replace the set
       * without changing the icon.
       *
       * Defaults to `arc`.
       */
      iconPrefix: { type: String }
    };
  }

  get _search() {
    if (!this.shadowRoot) {
      return null;
    }
    return this.shadowRoot.querySelector('paper-input[type="search"]');
  }

  get items() {
    return this._items;
  }

  set items(value) {
    const old = this._items;
    if (old === value) {
      return;
    }
    this._items = value;
    this.requestUpdate('items', old);
    this.clearTriggers();
  }

  /**
   * @return {Function|null|undefined} Prefiously registered callback for `refresh-list`.
   */
  get onrefreshlist() {
    return this._onrefreshlist;
  }
  /**
   * Registers event listener for `refresh-list` event.
   * @param {?Function} value Function to register. Pass null or undefined to clear
   * registered function.
   */
  set onrefreshlist(value) {
    this.__registerCallback('onrefreshlist', 'refresh-list', value);
  }

  /**
   * @return {Function|null|undefined} Prefiously registered callback for `load-next`.
   */
  get onloadnext() {
    return this._onloadnext;
  }
  /**
   * Registers event listener for `load-next` event.
   * @param {?Function} value Function to register. Pass null or undefined to clear
   * registered function.
   */
  set onloadnext(value) {
    this.__registerCallback('onloadnext', 'load-next', value);
  }

  /**
   * @return {Function|null|undefined} Prefiously registered callback for `file-open`.
   */
  get onfileopen() {
    return this._onfileopen;
  }
  /**
   * Registers event listener for `file-open` event.
   * @param {?Function} value Function to register. Pass null or undefined to clear
   * registered function.
   */
  set onfileopen(value) {
    this.__registerCallback('onfileopen', 'file-open', value);
  }

  /**
   * @return {Function|null|undefined} Prefiously registered callback for `file-auth-info`.
   */
  get onfileauthinfo() {
    return this._onfileauthinfo;
  }
  /**
   * Registers event listener for `file-auth-info` event.
   * @param {?Function} value Function to register. Pass null or undefined to clear
   * registered function.
   */
  set onfileauthinfo(value) {
    this.__registerCallback('onfileauthinfo', 'file-auth-info', value);
  }

  /**
   * @return {Function|null|undefined} Prefiously registered callback for `search`.
   */
  get onsearch() {
    return this._onsearch;
  }
  /**
   * Registers event listener for `search` event.
   * @param {?Function} value Function to register. Pass null or undefined to clear
   * registered function.
   */
  set onsearch(value) {
    this.__registerCallback('onsearch', 'search', value);
  }

  constructor() {
    super();
    this._searchAction = this._searchAction.bind(this);
    this.iconPrefix = 'arc';
  }

  connectedCallback() {
    /* istanbul ignore next */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    const search = this._search;
    if (search) {
      search.inputElement.addEventListener('search', this._searchAction);
    }
  }

  disconnectedCallback() {
    /* istanbul ignore next */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._search.inputElement.removeEventListener('search', this._searchAction);
  }

  firstUpdated() {
    this._search.inputElement.addEventListener('search', this._searchAction);
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
   * Dispatches `load-next` event to inform parent element to load results.
   */
  nextPage() {
    this.dispatchEvent(new CustomEvent('load-next'));
  }
  /**
   * Dispatches `refresh-list` event to inform parent element to load results.
   */
  _refresh() {
    this.dispatchEvent(new CustomEvent('refresh-list'));
  }
  /**
   * Clears threshold triggers.
   */
  clearTriggers() {
    const threshold = this.shadowRoot.querySelector('arc-scroll-threshold');
    if (!threshold) {
      return;
    }
    threshold.clearTriggers();
  }

  // Computes selection class name for the row items.
  _computeItemClass(canDownload) {
    if (!canDownload) {
      return 'disabled';
    }
    return '';
  }
  /**
   * Sends the `drive-file-search` event to parent element with current query.
   */
  _searchAction() {
    this.dispatchEvent(new CustomEvent('search', {
      detail: {
        q: this.query
      }
    }));
  }
  /**
   * @param {Event} e
   * @return {Object|undefined} A list item associated with current event.
   */
  _getTargetItem(e) {
    let current = e.target;
    let id;
    while (current) {
      if (current.nodeName !== 'PAPER-ICON-ITEM') {
        current = current.parentElement;
        continue;
      }
      id = current.dataset.driveId;
      break;
    }
    if (!id) {
      return;
    }
    return this.items.find((item) => item.id === id);
  }
  /**
   * Computes human readable size label from file size.
   *
   * @param {Number} bytes File size in bytes
   * @return {String} Human readable size
   */
  _computeSize(bytes) {
    if (!bytes) {
      return '0 Bytes';
    }
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + sizeUnits[i];
  }
  /**
   * Computes value for search icon button's icon property.
   * @param {?String} prefix Icons set prefix
   * @param {String} iconName Search icon name.
   * @return {String}
   */
  _computeSearchIcon(prefix, iconName) {
    let icon = '';
    if (prefix) {
      icon = prefix + ':';
    }
    return icon + iconName;
  }
  /**
   * Computes an icon for an item.
   * @param {Boolean} shared Item's shared flag
   * @param {?String} prefix Icons set prefix
   * @return {String} Icon full name.
   */
  _computeIcon(shared, prefix) {
    let icon = '';
    if (prefix) {
      icon = prefix + ':';
    }
    if (shared) {
      icon += 'folder-shared';
    } else {
      icon += 'insert-drive-file';
    }
    return icon;
  }
  /**
   * Computes "title" attribute for the item's icon.
   * @param {Boolean} shared Item's shared flag
   * @return {String}
   */
  _computeIconTitle(shared) {
    if (shared) {
      return 'Shared with you';
    }
    return 'You own this file';
  }
  /**
   * Handler for "open" button click. Dispatches `file-auth-info` event.
   * @param {MouseEvent} e
   */
  _openItem(e) {
    const item = this._getTargetItem(e);
    this.dispatchEvent(new CustomEvent('file-open', {
      detail: item
    }));
  }
  /**
   * Handler for "info" button click. Dispatches `file-auth-info` event.
   * @param {MouseEvent} e
   */
  _downloadAppInfo(e) {
    const item = this._getTargetItem(e);
    this.dispatchEvent(new CustomEvent('file-auth-info', {
      detail: item
    }));
  }
  /**
   * Handler for `input` event on search input field.
   * @param {Event} e
   */
  _queryInputHandler(e) {
    this.query = e.target.value;
  }
  /**
   * Dispatched when the user click on `Info` button.
   * Info is rendered when current application cannot open selected file.
   * The application should render a dialog explaining that the application
   * didn't created the file and was never opened by it so access is limited.
   * To open the file the user has to go to Google Drive web application and choose
   * to "open with" the file. If the application is not installed in Google Drive
   * then the file won't be opened with this application.
   *
   * The detail object contains a single item as returned by Drive v3 API.
   *
   * @event file-auth-info
   */

  /**
   * Dispatched when the user request to open a Drive file.
   *
   * The detail object contains a single item as returned by Drive v3 API.
   *
   * @event file-open
   */

  /**
   * Dispatched when the user requested to search for a file.
   *
   * @event search
   * @param {?String} q A seatch term.
   */

  /**
   * Dispatched when the user scrolled to the end of list and new page of results should be presented.
   *
   * @event load-next
   */

  /**
   * Dispatched when the user reequested to refresh the list of results.
   *
   * @event refresh-list
   */
}
window.customElements.define('google-drive-list-view', GoogleDriveListView);
