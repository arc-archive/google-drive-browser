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
import '@polymer/paper-button/paper-button.js';
/**
 * An element that explains why the user can't open the file with
 * the application because the app is not on file's ACL list.
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
 * `--secondary-action-button-color` | ARC theme. Applied to secondary button | `--primary-color`
 * `--google-drive-app-not-authorized-hint-color` | Hint color | `currentColor`
 * `--google-drive-app-not-authorized-link-block-background-color` | | `rgba(0, 0, 0, 0.2)`
 *
 * @customElement
 * @demo demo/app-not-authorized.html
 * @demo Drive Picker demo/index.html
 * @memberof UiElements
 */
class GoogleDriveAppNotAuthorized extends LitElement {
  static get styles() {
    return css`:host {
      display: block;
      padding-left: 16px;
      padding-right: 16px;

      display: flex;
      flex-direction: column;
      flex: 1;
      flex-basis: 0.000000001px;

      font-size: var(--arc-font-body1-font-size, inherit);
      font-weight: var(--arc-font-body1-font-weight, inherit);
      line-height: var(--arc-font-body1-line-height, inherit);
    }

    h2 {
      font-size: var(--arc-font-headline-font-size, initial);
      font-weight: var(--arc-font-headline-font-weight, initial);
      letter-spacing: var(--arc-font-headline-letter-spacing, initial);
      line-height: var(--arc-font-headline-line-height, initial);
    }

    p {
      margin: 1em 0;
    }

    p.hint {
      margin: 1em 0;
      color: var(--google-drive-app-not-authorized-hint-color, currentColor);
    }

    .actions {
      margin: 12px 0;
    }

    .main-action {
      background-color: var(--action-button-background-color);
      background-image: var(--action-button-background-image);
      color: var(--action-button-color);
      transition: var(--action-button-transition);
    }

    .secondary-action {
      color: var(--secondary-action-button-color, var(--primary-color));
    }

    .link-info {
      background-color: var(--google-drive-app-not-authorized-link-block-background-color, rgba(0, 0, 0, 0.2));
      padding: 8px;
    }

    label {
      font-weight: 500;
    }

    code {
      display: block;
    }

    #itemViewLink:hover {
      text-decoration: underline;
      cursor: pointer;
    }

    :host([narrow]) .actions {
      display: flex;
      justify-content: center;
    }

    :host([narrow]) .actions paper-button {
      flex: 1;
      flex-basis: 0.000000001px;
    }`;
  }

  render() {
    let { item } = this;
    if (!item) {
      item = {};
    }
    return html`<h2>Open file via Drive UI</h2>
    <div>
      <p>
        The file <b>${item.name}</b> can't be opened by the app because it <b>wasn't created by this application</b>.
      </p>
      <p>
        Please, open Google Drive web application, select the file and choose "Open with"
        and then this application name.
      </p>

      <p class="hint">You have to do this only once for each file.</p>

      <section class="link-info">
        <label for="itemViewLink">Link to the file</label>
        <code id="itemViewLink" @click="${this.openDrive}">${item.webViewLink}</code>
      </section>

      <div class="actions">
        <paper-button raised class="main-action" @click="${this.openDrive}">Open file in Drive UI</paper-button>
        <paper-button @click="${this.back}" class="secondary-action">Back to the list</paper-button>
      </div>
    </div>`;
  }

  static get properties() {
    return {
      // A drive file object
      item: { type: Object }
    };
  }

  back() {
    this.dispatchEvent(new CustomEvent('back'));
  }

  openDrive() {
    const url = this.item.webViewLink;
    const e = this._dispatchOpenExtarnal(url);
    /* istanbul ignore else */
    if (e.defaultPrevented) {
      return;
    }
    /* istanbul ignore next */
    window.open(url);
  }

  _dispatchOpenExtarnal(url) {
    const e = new CustomEvent('open-external-url', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        url
      }
    });
    this.dispatchEvent(e);
    return e;
  }
}
window.customElements.define('google-drive-app-not-authorized', GoogleDriveAppNotAuthorized);
