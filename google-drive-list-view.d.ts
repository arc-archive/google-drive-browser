/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   google-drive-list-view.html
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

/// <reference path="../polymer/types/polymer-element.d.ts" />
/// <reference path="../paper-icon-button/paper-icon-button.d.ts" />
/// <reference path="../arc-icons/arc-icons.d.ts" />
/// <reference path="../paper-input/paper-input.d.ts" />
/// <reference path="../iron-scroll-threshold/iron-scroll-threshold.d.ts" />
/// <reference path="../iron-list/iron-list.d.ts" />
/// <reference path="../iron-icon/iron-icon.d.ts" />
/// <reference path="../date-time/date-time.d.ts" />
/// <reference path="../paper-button/paper-button.d.ts" />
/// <reference path="../iron-flex-layout/iron-flex-layout.d.ts" />
/// <reference path="../paper-item/paper-icon-item.d.ts" />
/// <reference path="../paper-item/paper-item-body.d.ts" />

declare namespace UiElements {

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
   */
  class GoogleDriveListView extends Polymer.Element {

    /**
     * List of items to display. Query result from the Drive API
     */
    items: any[]|null|undefined;

    /**
     * Current filter value
     */
    query: string|null|undefined;

    /**
     * List of bytes sizes suffixes used to compyte file size label
     */
    _sizeSufixes: any[]|null|undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;

    /**
     * Fires the `load-next-page` event to inform parent element to load results.
     */
    nextPage(): void;
    _refresh(): void;

    /**
     * Clears threshold triggers.
     */
    clearTriggers(): void;

    /**
     * Computes selection class name for the row items.
     */
    _computeItemClass(selected: any, canDownload: any): any;

    /**
     * Sends the `drive-file-search` event to parent element with current query.
     */
    _searchAction(): void;
    _openItem(e: any): void;
    _computeIcon(shared: any): any;

    /**
     * Computes human readable size label from file size.
     *
     * @param bytes File size in bytes
     * @returns Human readable size
     */
    _computeSize(bytes: Number|null): String|null;
    _computeIconTitle(starred: any): any;
    _downloadAppInfo(e: any): void;
  }
}

interface HTMLElementTagNameMap {
  "google-drive-list-view": UiElements.GoogleDriveListView;
}
