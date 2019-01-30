/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   google-drive-app-not-authorized.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../iron-flex-layout/iron-flex-layout.d.ts" />

declare namespace UiElements {

  /**
   * An element that explains why the user can't open the file with
   * the application because the app is not on file's ACL list.
   *
   * Custom property | Description | Default
   * ----------------|-------------|----------
   * `--google-drive-app-not-authorized` | Mixin applied to this elment | `{}`
   * `--google-drive-browser-title` | | `{}`
   * `--google-drive-app-not-authorized-hint-color` | | `rgba(0,0,0,0.54)`
   */
  class GoogleDriveAppNotAuthorized extends Polymer.Element {

    /**
     * A drive file object
     */
    item: object|null|undefined;
    back(): void;
    openDrive(): void;
    _dispatchOpenExtarnal(url: any): any;
  }
}

interface HTMLElementTagNameMap {
  "google-drive-app-not-authorized": UiElements.GoogleDriveAppNotAuthorized;
}
