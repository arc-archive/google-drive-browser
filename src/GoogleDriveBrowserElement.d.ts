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
import { LitElement, TemplateResult, CSSResult } from 'lit-element';
import { EventsTargetMixin } from '@advanced-rest-client/events-target-mixin/events-target-mixin.js';
import { DriveListResponse, ProjectedFile } from './types';

export declare const hasMoreValue: unique symbol;
export declare const accessTokenValue: unique symbol;
export declare const accessTokenChanged: unique symbol;
export declare const accessTokenSetupTemplate: unique symbol;
export declare const initializingTemplate: unique symbol;
export declare const headerTemplate: unique symbol;
export declare const searchTemplate: unique symbol;
export declare const listTemplate: unique symbol;
export declare const setAuthHeader: unique symbol;
export declare const headersValue: unique symbol;
export declare const computeQuery: unique symbol;
export declare const computeQueryParameters: unique symbol;
export declare const nextPageToken: unique symbol;
export declare const processApiResult: unique symbol;
export declare const processApiError: unique symbol;
export declare const notifyInvalidToken: unique symbol;
export declare const listItemTemplate: unique symbol;
export declare const loadNextTemplate: unique symbol;
export declare const queryInputHandler: unique symbol;
export declare const searchHandler: unique symbol;
export declare const pickFileHandler: unique symbol;
export declare const scrollHandler: unique symbol;

/** @typedef {import('lit-element').TemplateResult} TemplateResult */
/** @typedef {import('./types').ProjectedFile} ProjectedFile */
/** @typedef {import('./types').DriveListResponse} DriveListResponse */

/**
 * A fields projection requested from the Drive API.
 * Fields listed here are returned by the Drive query endpoint.
 */
export declare const fieldsProjection: string;

/**
 * An element that renders a Google Drive assets browser that works in Electron.
 * 
 * @fires tokeninvalid
 * @fires pick
 */
export declare class GoogleDriveBrowserElement extends EventsTargetMixin(LitElement) {
  static get styles(): CSSResult;

  /** 
   * @returns {boolean} Whether there are more items to be downloaded.
   */
  get hasMore(): boolean;

  /** 
   * @returns {boolean} Whether there are items to render.
   */
  get hasItems(): boolean;

  /** 
   * @param {string} value The new token to use. This is set only property.
   */
  set accessToken(value: string);

  /** 
   * True when requesting data from Google Drive API.
   * @attribute
   */
  loading: boolean;
  /**
   * File search term entered by the user.
   * @attribute
   */
  query: string;
  /**
   * List of files retrieved from Drive API API.
   */
  items: ProjectedFile[];
  /**
   * An error message from the API if any.
   * @attribute
   */
  errorMessage: string;
  /**
   * If set it generates a query to Google Drive that contains query to file properties.
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
  queryProperties: Record<string, any>;
  /**
   * If true then it uses a negation for `queryProperties` (adding `not`)
   * before the query
   * @attribute
   */
  queryPropertiesNegation: boolean;
  /**
   * A `pageSize` property value to be send to Drive endpoint.
   * Default: 50
   * @attribute
   */
  pageSize: number;
  /**
   * Mime type of the file to search.
   * @attribute
   */
  mimeType: string;
  /**
   * API key to use as `key` query parameter in Google Drive communication.
   * @attribute
   */
  apiKey: string;
  /**
   * When set it renders narrow view, mobile friendly.
   * @attribute
   */
  narrow: boolean;
  /**
   * Enables compatibility with Anypoint platform
   * @attribute
   */
  compatibility: boolean;
  /**
   * Enables material design outlined theme
   * @attribute
   */
  outlined: boolean;

  constructor();

  /**
   * Called when access token changed. Makes the query with new token.
   */
  [accessTokenChanged](token: string|undefined): void;

  refresh(): Promise<void>;

  queryNext(): Promise<void>;

  /**
   * Computes and sets headers to be used with requests.
   */
  [setAuthHeader](token: string|undefined): void;

  [computeQueryParameters](): Record<string, string>;

  /**
   * Builds the query (`q`) parameter for Google Drive API.
   *
   * @returns A value for the `q` query parameter
   */
  [computeQuery](): string;

  [processApiResult](response: DriveListResponse): void;

  /**
   * Handler for the error response from the API.
   * @param status Response status code
   * @param data API call response
   */
  [processApiError](status: number, data: string|object): void;

  [notifyInvalidToken](): void;

  [queryInputHandler](e: Event): void;

  [searchHandler](): void;

  [pickFileHandler](e: Event): void;

  [scrollHandler](e: Event): void;

  render(): TemplateResult;

  [accessTokenSetupTemplate](): TemplateResult;

  [initializingTemplate](): TemplateResult;

  /**
   * @returns The template for the list header
   */
  [headerTemplate](): TemplateResult;

  /**
   * @returns The template for the search input
   */
  [searchTemplate](): TemplateResult;

  /**
   * @returns The template for the current results
   */
  [listTemplate](): TemplateResult;

  /**
   * @returns The template for the list item
   */
  [listItemTemplate](file: ProjectedFile): TemplateResult;

  /**
   * @returns The template for the load more button
   */
  [loadNextTemplate](): TemplateResult|string;
}
