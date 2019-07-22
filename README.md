[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/google-drive-browser)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/google-drive-browser)

# google-drive-browser

A file browser for Google Drive.

Renders list view for Google Drive items that the application hosting the element has access to.
The access is determined by `accessToken` generated for specific client id or by `apiKey` property.
Learn more about access in [Google Drive API docs](https://developers.google.com/drive/api/v3/about-auth).

## Authorization

The element does not handle user authentication. The `accessToken` property has to be set on the element. If not, the element renders authorization screen where the user can authorize the application. In this case the `google-authorize` custom event is dispatched and hosting application should handle it and start OAuth 2 flow.

```html
<google-drive-browser></google-drive-browser>

<script>
document.querySelector('google-drive-browser').ongoogleauthorize = async (e) => {
  const { scope } = e.detail;
  this.accessToken = await authorizeGoogle(scope);
};
</script>
```

The element dispatches `oauth-2-token-invalid` event when passed token cannot be used to interact with Drive API. The user will see authorization screen in this case.

```javascript
document.querySelector('google-drive-browser').onoauth2tokeninvalid = (e) => {
  // perform background authorization, maybe.
};
```

## Listening for user actions

The element allows the user to pick and open a Google Drive item. When this happens the element downloads content of the file using the same access token and dispatches `drive-file` custom event. The event contains `content` and `driveId` properties.

```javascript
document.querySelector('google-drive-browser').ondrivefile = (e) => {
  const { driveId, content } = e.detail;
  console.log(`File ${driveId} has the following content: ${content}`);
};
```

### API components

This components is a part of API components ecosystem: <https://elements.advancedrestclient.com/>

## Styling

The `google-drive-browser` consist of 4 elements. To style it use the following CSS variables for corresponding element.

### google-drive-browser

| Custom property                    | Description                                 | Default   |
| ---------------------------------- | ------------------------------------------- | --------- |
| `--arc-font-body1-font-size`       | ARC theme variable. Applied to the element. | `inherit` |
| `--arc-font-body1-font-weight`     | ARC theme variable. Applied to the element. | `inherit` |
| `--arc-font-body1-line-height`     | ARC theme variable. Applied to the element. | `inherit` |
| `--action-button-background-color` | ARC theme. Applied to action button         | ``        |
| `--action-button-background-image` | ARC theme. Applied to action button         | ``        |
| `--action-button-color`            | ARC theme. Applied to action button         | ``        |
| `--action-button-transition`       | ARC theme. Applied to action button         | ``        |

### google-drive-list-view

| Custom property                                      | Description                                 | Default               |
| ---------------------------------------------------- | ------------------------------------------- | --------------------- |
| `--arc-font-body1-font-size`                         | ARC theme variable. Applied to the element. | `inherit`             |
| `--arc-font-body1-font-weight`                       | ARC theme variable. Applied to the element. | `inherit`             |
| `--arc-font-body1-line-height`                       | ARC theme variable. Applied to the element. | `inherit`             |
| `--arc-font-headline-font-size`                      | ARC theme. Applied to the title             | `initial`             |
| `--arc-font-headline-font-weight`                    | ARC theme. Applied to the title             | `initial`             |
| `--arc-font-headline-letter-spacing`                 | ARC theme. Applied to the title             | `initial`             |
| `--arc-font-headline-line-height`                    | ARC theme. Applied to the title             | `initial`             |
| `--action-button-background-color`                   | ARC theme. Applied to action button         | ``                    |
| `--action-button-background-image`                   | ARC theme. Applied to action button         | ``                    |
| `--action-button-color`                              | ARC theme. Applied to action button         | ``                    |
| `--action-button-transition`                         | ARC theme. Applied to action button         | ``                    |
| `--google-drive-list-view-file-icon-color`           |                                             | `rgba(0, 0, 0, 0.54)` |
| `--google-drive-list-view-search-icon-color`         |                                             | `rgba(0, 0, 0, 0.54)` |
| `--google-drive-list-view-item-disabled-color`       |                                             | `rgba(0, 0, 0, 0.45)` |
| `--google-drive-list-view-selected-background-color` |                                             | `#e0e0e0`             |

### google-drive-authorize

| Custom property                      | Description                                 | Default   |
| ------------------------------------ | ------------------------------------------- | --------- |
| `--arc-font-body1-font-size`         | ARC theme variable. Applied to the element. | `inherit` |
| `--arc-font-body1-font-weight`       | ARC theme variable. Applied to the element. | `inherit` |
| `--arc-font-body1-line-height`       | ARC theme variable. Applied to the element. | `inherit` |
| `--arc-font-headline-font-size`      | ARC theme. Applied to the title             | `initial` |
| `--arc-font-headline-font-weight`    | ARC theme. Applied to the title             | `initial` |
| `--arc-font-headline-letter-spacing` | ARC theme. Applied to the title             | `initial` |
| `--arc-font-headline-line-height`    | ARC theme. Applied to the title             | `initial` |
| `--action-button-background-color`   | ARC theme. Applied to action button         | ``        |
| `--action-button-background-image`   | ARC theme. Applied to action button         | ``        |
| `--action-button-color`              | ARC theme. Applied to action button         | ``        |
| `--action-button-transition`         | ARC theme. Applied to action button         | ``        |

### google-drive-app-not-authorized

| Custom property                                                 | Description                                 | Default              |
| --------------------------------------------------------------- | ------------------------------------------- | -------------------- |
| `--arc-font-body1-font-size`                                    | ARC theme variable. Applied to the element. | `inherit`            |
| `--arc-font-body1-font-weight`                                  | ARC theme variable. Applied to the element. | `inherit`            |
| `--arc-font-body1-line-height`                                  | ARC theme variable. Applied to the element. | `inherit`            |
| `--arc-font-headline-font-size`                                 | ARC theme. Applied to the title             | `initial`            |
| `--arc-font-headline-font-weight`                               | ARC theme. Applied to the title             | `initial`            |
| `--arc-font-headline-letter-spacing`                            | ARC theme. Applied to the title             | `initial`            |
| `--arc-font-headline-line-height`                               | ARC theme. Applied to the title             | `initial`            |
| `--action-button-background-color`                              | ARC theme. Applied to action button         | ``                   |
| `--action-button-background-image`                              | ARC theme. Applied to action button         | ``                   |
| `--action-button-color`                                         | ARC theme. Applied to action button         | ``                   |
| `--action-button-transition`                                    | ARC theme. Applied to action button         | ``                   |
| `--secondary-action-button-color`                               | ARC theme. Applied to secondary button      | `--primary-color`    |
| `--google-drive-app-not-authorized-hint-color`                  | Hint color                                  | `currentColor`       |
| `--google-drive-app-not-authorized-link-block-background-color` |                                             | `rgba(0, 0, 0, 0.2)` |

## New in version 3

-   Replaced Polymer with LitElement
-   `queryParams` is now `_queryParams`
-   `hasMore` is now `_hasMore`
-   `fieldsProjection` is removed
-   Added `narrow` attribute to render mobile friendly view
-   `drive-file-picker-data` event is now `drive-file`
-   `google-autorize` event is now `google-authorize`
-   Added `ongoogleauthorize`, `ondrivefile`, and `onoauth2tokeninvalid` setters for corresponding events

## Usage

### Installation
```
npm install --save @advanced-rest-client/google-drive-browser
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/google-drive-browser/google-drive-browser.js';
    </script>
  </head>
  <body>
    <google-drive-browser accesstoken="..."></google-drive-browser>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/google-drive-browser/google-drive-browser.js';

class SampleElement extends LitElement {
  static get properties() {
    return {
      accessToken: { type: String },
      apiKey: { type: String }
    }
  }
  render() {
    return html`
    <google-drive-browser .accessToken="${this.accessToken}" .apiKey="${this.apiKey}"></google-drive-browser>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Development

```sh
git clone https://github.com/advanced-rest-client/google-drive-browser
cd google-drive-browser
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
polymer test
```
