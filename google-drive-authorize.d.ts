/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   google-drive-authorize.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.

import {PolymerElement} from '@polymer/polymer/polymer-element.js';

import {html} from '@polymer/polymer/lib/utils/html-tag.js';

declare namespace UiElements {

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
   */
  class GoogleDriveAuthorize extends PolymerElement {

    /**
     * True to indicate that the app is being authorized.
     */
    authorizing: boolean|null|undefined;

    /**
     * Scope to call with authorize action.
     */
    scope: string|null|undefined;

    /**
     * Sends the `google-autorize` with scope for drive file picker.
     */
    authorize(): void;
  }
}

declare global {

  interface HTMLElementTagNameMap {
    "google-drive-authorize": UiElements.GoogleDriveAuthorize;
  }
}
