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
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-button/anypoint-icon-button.js';
import '@anypoint-web-components/anypoint-item/anypoint-icon-item.js';
import '@anypoint-web-components/anypoint-item/anypoint-item-body.js';
import '@anypoint-web-components/anypoint-input/anypoint-input.js';
import '@anypoint-web-components/anypoint-listbox/anypoint-listbox.js';
import '@advanced-rest-client/arc-scroll-threshold/arc-scroll-threshold.js';
import '@advanced-rest-client/date-time/date-time.js';
import { folderShared, insertDriveFile, search } from '@advanced-rest-client/arc-icons/ArcIcons.js';
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
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .search [type="search"] {
      flex: 1;
      flex-basis: 0.000000001px;
      margin: 16px 0px;
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

    .selected {
      background-color: var(--google-drive-list-view-selected-background-color, #e0e0e0);
    }

    .meta {
      margin-right: 8px;
    }

    .icon {
      display: block;
      fill: currentColor;
      width: 24px;
      height: 24px;
    }`;
  }

  _listItemTeamplate(item, compatibility) {
    const icon = this._computeIcon(item.shared);
    const iconTitle = this._computeIconTitle(item.shared);
    const itemClass = this._computeItemClass(item.capabilities.canDownload);
    const itemSize = this._computeSize(item.size);
    return html`
    <anypoint-icon-item
      data-drive-id="${item.id}"
      class="list-item ${itemClass}"
    >
      <span
        class="icon shared-icon"
        slot="item-icon"
        title="${iconTitle}"
      >${icon}</span>
      <anypoint-item-body twoline>
        <div class="name-label">${item.name}</div>
        <div secondary>
          <span class="meta">Created:
            <date-time
              .date="${item.createdTime}"
              year="numeric"
              month="short"
              day="numeric"
              hour="2-digit"
              minute="2-digit"
            ></date-time>
          </span>
          <span class="meta">Size: ${itemSize}</span>
        </div>
      </anypoint-item-body>
      ${item.isAppAuthorized ?
        html`<anypoint-button
          class="main-action"
          data-action="open-item"
          @click="${this._openItem}"
          emphasis="high"
          ?disabled="${!item.capabilities.canDownload}"
          ?compatibility="${compatibility}"
        >Open</anypoint-button>` :
        html`<anypoint-button
          class="main-action"
          data-action="download-info"
          @click="${this._downloadAppInfo}"
          emphasis="high"
          ?compatibility="${compatibility}"
        >Info</anypoint-button>`
}
    </anypoint-icon-item>`;
  }

  _listTemplate(items, compatibility) {
    if (!items || !items.length) {
      return;
    }
    return html`
    <anypoint-listbox
      class="list"
      id="list"
      selectable=":not(.disabled)",
      ?compatibility="${compatibility}"
    >
    ${items.map((item) => this._listItemTeamplate(item, compatibility))}
    </anypoint-listbox>
    <arc-scroll-threshold
      @lower-threshold="${this.nextPage}"
      id="threshold"
      scrolltarget="list"></arc-scroll-threshold>`;
  }

  render() {
    const { query, compatibility, outlined, items } = this;
    return html`
    <div class="container">
      <header>
        <h2>Open Google Drive file</h2>
        <anypoint-button
          data-action="refresh-list"
          @click="${this._refresh}"
          ?compatibility="${compatibility}">Refresh</anypoint-button>
      </header>
      <div class="search">
        <anypoint-input
          role="textbox"
          title="Search for a file"
          nolabelfloat
          id="search"
          .value="${query}"
          type="search"
          @input="${this._queryInputHandler}"
          @search="${this._searchAction}"
          ?compatibility="${compatibility}"
          ?outlined="${outlined}"
        >
          <label slot="label">Search</label>
          <anypoint-icon-button
            class="search-icon"
            @click="${this._searchAction}"
            data-action="search"
            title="Search"
            ?compatibility="${compatibility}"
            slot="suffix"
            tabindex="-1"
          >
            <span class="icon">${search}</span>
          </anypoint-icon-button>
        </anypoint-input>

      </div>
      ${this._listTemplate(items, compatibility)}
    </div>`;
  }

  static get properties() {
    return {
      // List of items to display. Query result from the Drive API
      items: { type: Array },
      // Current filter value
      query: { type: String },
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

  get _search() {
    if (!this.shadowRoot) {
      return null;
    }
    return this.shadowRoot.querySelector('anypoint-input[type="search"]');
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
      if (current.nodeName !== 'ANYPOINT-ICON-ITEM') {
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
   * Computes an icon for an item.
   * @param {Boolean} shared Item's shared flag
   * @return {String} Icon full name.
   */
  _computeIcon(shared) {
    return shared ? folderShared : insertDriveFile;
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
