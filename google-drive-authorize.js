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
import '@polymer/paper-spinner/paper-spinner.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
/**
 * Authorize app screen for Google Drive file browser.
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
 *
 * @customElement
 * @demo demo/authorize.html
 * @demo Drive Picker demo/index.html
 * @memberof UiElements
 */
class GoogleDriveAuthorize extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    h2 {
      margin-left: 16px;
      font-size: var(--arc-font-headline-font-size, initial);
      font-weight: var(--arc-font-headline-font-weight, initial);
      letter-spacing: var(--arc-font-headline-letter-spacing, initial);
      line-height: var(--arc-font-headline-line-height, initial);
    }

    p {
      margin-left: 16px;
    }

    .main-action {
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .actions {
      margin-top: 40px;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
    }

    paper-spinner {
      margin-left: 12px;
    }

    :host([narrow]) .actions {
      display: flex;
      justify-content: center;
    }

    :host([narrow]) .main-action {
      flex: 1;
      flex-basis: 0.000000001px;
    }`;
  }

  render() {
    const { authorizing, compatibility } = this;
    return html`<h2>Authorization required</h2>
    <div>
      <p>Authorize the application to have access to your Google Drive.</p>
      <p>Authorization scope:</p>
      <ul>
        <li>
          <b>View and manage Google Drive files and folders that you have opened or created with this app</b><br>
          The app will have access to files that has been created by the app or previously opened by it.
          The app will search for it's own type of files only.
        </li>
        <li>
          <b>Add itself to Google Drive</b><br>
          The application will install itself in Google Drive UI so you'll be able to open files
          from Google Drive website.
        </li>
      </ul>
      <div class="actions">
      ${authorizing ?
        html`<p>Waiting for authorization...</p><paper-spinner active></paper-spinner>`:
        html`<anypoint-button
          emphasis="high"
          class="main-action"
          @click="${this.authorize}"
          ?compatibility="${compatibility}"
        >Authorize application</anypoint-button>`}
      </div>
    </div>`;
  }

  static get properties() {
    return {
      // True to indicate that the app is being authorized.
      authorizing: { type: Boolean },
      // Scope to call with authorize action.
      scope: { type: String },
      /**
       * Enables compatibility with Anypoint platform
       */
      compatibility: { type: Boolean }
    };
  }

  constructor() {
    super();
    this._authHandler = this._authHandler.bind(this);
  }

  connectedCallback() {
    /* istanbul ignore next */
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    window.addEventListener('google-signin-success', this._authHandler);
    window.addEventListener('google-signout', this._authHandler);
  }

  disconnectedCallback() {
    /* istanbul ignore next */
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    window.removeEventListener('google-signin-success', this._authHandler);
    window.removeEventListener('google-signout', this._authHandler);
  }
  /**
   * Handler for Google auth events. Resets `authorizing` state when handled.
   */
  _authHandler() {
    if (this.authorizing) {
      this.authorizing = false;
    }
  }
  /**
   * Dispatches `google-authorize` with scope for drive file picker.
   * Also sets `authorizing` to `true`.
   */
  authorize() {
    this.authorizing = true;
    this.dispatchEvent(new CustomEvent('google-authorize', {
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
   * @event google-authorize
   * @param {String} scope A scope to authorize
   */
}
window.customElements.define('google-drive-authorize', GoogleDriveAuthorize);
