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
import '../../@polymer/paper-spinner/paper-spinner.js';
import '../../@polymer/paper-button/paper-button.js';
import {html} from '../../@polymer/polymer/lib/utils/html-tag.js';
/**
 * Authorize app screen for Google Drive file browser.
 *
 * ## Styling
 *
 * Custom property | Description | Default
 * ----------------|-------------|----------
 * `--google-drive-authorize` | Mixin applied to the element | `{}`
 * `--arc-font-headline` | Mixin applied to the header | `{}`
 * `--action-button` | Mixin applied to the main action button | `{}`
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 * @memberof UiElements
 */
class GoogleDriveAuthorize extends PolymerElement {
  static get template() {
    return html`
    <style>
    :host {
      display: block;
      @apply --arc-font-body1;
      @apply --google-drive-authorize;
    }

    h2 {
      margin-left: 16px;
      @apply --arc-font-headline;
      @apply --google-drive-browser-title;
    }

    p {
      margin-left: 16px;
    }

    .main-action {
      @apply --action-button;
      height: 36px;
      font-size: 14px;
    }

    .actions {
      margin-top: 40px;
    }
    </style>
    <h2>Authorization required</h2>
    <div>
      <p>Authorize the application to have access to your Google Drive.</p>
      <p>Authorization scope:</p>
      <ul>
        <li><b>View and manage Google Drive files and folders that you have opened or created with this app</b><br>The app will have access to files that has been created by the app or previously opened by it. The app will search for it's own type of files only.</li>
        <li><b>Add itself to Google Drive</b> <br>The app will install itself in Google Drive UI so you'll be able to open files from Google Drive website.</li>
      </ul>
      <div class="actions" hidden\$="[[authorizing]]">
        <paper-button raised="" class="main-action" on-click="authorize">Authorize application</paper-button>
      </div>
      <template is="dom-if" if="[[authorizing]]" restamp="">
        <p>Waiting for authorization...</p>
        <paper-spinner></paper-spinner>
      </template>
    </div>
`;
  }

  static get properties() {
    return {
      // True to indicate that the app is being authorized.
      authorizing: Boolean,
      // Scope to call with authorize action.
      scope: String
    };
  }
  // Sends the `google-autorize` with scope for drive file picker.
  authorize() {
    this.authorizing = true;
    this.dispatchEvent(new CustomEvent('google-autorize', {
      composed: true,
      bubbles: true,
      cancelable: true,
      detail: {
        scope: this.scope
      }
    }));
  }
  /**
   * Fired when app authorization is required.
   *
   * @event google-autorize
   * @param {String} scope A scope to authorize
   */
}
window.customElements.define('google-drive-authorize', GoogleDriveAuthorize);
