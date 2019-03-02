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
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@advanced-rest-client/arc-icons/arc-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-scroll-threshold/iron-scroll-threshold.js';
import '@polymer/iron-list/iron-list.js';
import '@polymer/iron-icon/iron-icon.js';
import '@advanced-rest-client/date-time/date-time.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import {html} from '@polymer/polymer/lib/utils/html-tag.js';
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
 * `--google-drive-list-view` | Mixin applied to this elment | `{}`
 * `--google-drive-browser-title` | | `{}`
 * `--google-drive-list-view-item` | | `{}`
 * `--google-drive-list-view-item-disabled-color` | | `rgba(0, 0, 0, 0.45)`
 * `--google-drive-list-view-selected-background-color` | | `#e0e0e0`
 * `--action-button` | | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 */
class GoogleDriveListView extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      position: relative;
      @apply --arc-font-body1;
      @apply --google-drive-list-view;
      height: 100%;
    }

    .container {
      @apply --layout-vertical;
      @apply --layout-flex;
      height: inherit;
    }

    header {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    h2 {
      margin-left: 16px;
      @apply --arc-font-headline;
      @apply --layout-flex;
      @apply --google-drive-browser-title;
    }

    .search {
      margin: 0 16px;
    }

    #list {
      @apply --layout-flex;
    }

    .shared-icon {
      color: var(--google-drive-list-view-file-icon-color, rgba(0, 0, 0, 0.54));
    }

    .search-icon {
      color: var(--google-drive-list-view-search-icon-color, rgba(0, 0, 0, 0.54));
    }

    .list-item {
      @apply --google-drive-list-view-item;
    }

    .list-item.disabled {
      pointer-events: none;
      color: var(--google-drive-list-view-item-disabled-color, rgba(0, 0, 0, 0.45)) !important;
    }

    .iron-selected {
      background-color: var(--google-drive-list-view-selected-background-color, #e0e0e0);
    }

    .main-action {
      @apply --action-button;
      height: 36px;
      font-size: 14px;
    }

    .main-action[disabled] {
      background-color: var(--google-drive-list-view-item-disabled-color, rgba(0, 0, 0, 0.45)) !important;
    }

    .meta {
      margin-right: 8px;
    }

    .download-info {
      @apply --action-button;
      height: 36px;
      font-size: 14px;
    }
    </style>
    <div class="container">
      <header>
        <h2>Open Google Drive file</h2>
        <paper-button data-action="refresh-list" on-click="_refresh">Refresh</paper-button>
      </header>
      <div class="search">
        <paper-input no-label-float="" label="Search" id="search" value="{{query}}" type="search">
          <paper-icon-button slot="suffix" icon="arc:search" class="search-icon" on-click="_searchAction" data-action="search" title="Search"></paper-icon-button>
        </paper-input>
      </div>
      <iron-list items="[[items]]" id="list" selected-as="selected" selection-enabled="">
        <template>
          <div class\$="list-item [[_computeItemClass(selected, item.capabilities.canDownload)]]">
            <paper-icon-item tabindex\$="[[tabIndex]]">
              <iron-icon icon="[[_computeIcon(item.shared)]]" class="shared-icon" slot="item-icon" title="[[_computeIconTitle(item.shared)]]"></iron-icon>
              <paper-item-body two-line="">
                <div class="name-label">[[item.name]]</div>
                <div secondary="">
                  <span class="meta">Created: <date-time date="[[item.createdTime]]" year="numeric" month="short" day="numeric" hour="2-digit" minute="2-digit"></date-time></span>
                  <span class="meta">Size: [[_computeSize(item.size)]]</span>
                </div>
              </paper-item-body>
              <template is="dom-if" if="[[item.isAppAuthorized]]">
                <paper-button class="main-action" data-action="open-item" on-click="_openItem" raised="" disabled="[[!item.capabilities.canDownload]]">Open</paper-button>
              </template>
              <template is="dom-if" if="[[!item.isAppAuthorized]]">
                <paper-button class="download-info" data-action="download-info" on-click="_downloadAppInfo" raised="">Download info</paper-button>
              </template>
            </paper-icon-item>
          </div>
        </template>
      </iron-list>
    </div>
    <iron-scroll-threshold on-lower-threshold="nextPage" id="threshold" scroll-target="list"></iron-scroll-threshold>
`;
  }

  static get properties() {
    return {
      // List of items to display. Query result from the Drive API
      items: Array,
      // Current filter value
      query: {
        type: String,
        notify: true
      },
      // List of bytes sizes suffixes used to compyte file size label
      _sizeSufixes: {
        type: Array,
        value() {
          return ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        }
      }
    };
  }
  static get observers() {
    return [
      'clearTriggers(items.length)'
    ];
  }

  constructor() {
    super();
    this._searchAction = this._searchAction.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.$.search.inputElement.addEventListener('search', this._searchAction);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.$.search.inputElement.removeEventListener('search', this._searchAction);
  }

  /**
   * Fires the `load-next-page` event to inform parent element to load results.
   */
  nextPage() {
    this.dispatchEvent(new CustomEvent('load-next-page'));
  }

  _refresh() {
    this.dispatchEvent(new CustomEvent('refresh-list'));
  }
  /**
   * Clears threshold triggers.
   */
  clearTriggers() {
    this.$.threshold.clearTriggers();
  }

  // Computes selection class name for the row items.
  _computeItemClass(selected, canDownload) {
    if (!canDownload) {
      return 'disabled';
    }
    if (selected) {
      return 'iron-selected';
    }
    return '';
  }
  /**
   * Sends the `drive-file-search` event to parent element with current query.
   */
  _searchAction() {
    this.dispatchEvent(new CustomEvent('drive-file-search', {
      detail: {
        q: this.query
      }
    }));
  }

  _openItem(e) {
    const item = e.model.get('item');
    this.dispatchEvent(new CustomEvent('drive-file-open', {
      detail: {
        item
      }
    }));
  }

  _computeIcon(shared) {
    if (shared) {
      return 'arc:folder-shared';
    }
    return 'arc:insert-drive-file';
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
    return (bytes / Math.pow(1024, i)).toFixed(0) + ' ' + this._sizeSufixes[i];
  }

  _computeIconTitle(starred) {
    if (starred) {
      return 'Shared with you';
    }
    return 'You own this file';
  }

  _downloadAppInfo(e) {
    const item = this.$.list.modelForElement(e.target).get('item');
    this.dispatchEvent(new CustomEvent('app-not-authorized-error', {
      detail: {
        item
      }
    }));
  }
}
window.customElements.define('google-drive-list-view', GoogleDriveListView);
