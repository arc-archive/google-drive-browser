# Google Drive browser for Advanced Rest Client

A file browser for Google Drive.

Renders list view for Google Drive items that the application hosting the element has access to. The access is determined by `accessToken` generated for specific client id or by `apiKey` property. Learn more about access in [Google Drive API docs](https://developers.google.com/drive/api/v3/about-auth).

## Authorization

The element does not handle user authentication. The `accessToken` property has to be set on the element.

## Listening for user actions

The element allows the user to pick and open a Google Drive item. When this happens the element downloads content of the file using the same access token and dispatches `drive-file` custom event. The event contains `content` and `driveId` properties.

```javascript
document.querySelector('google-drive-browser').addEventListener('pick', (e) => {
  const driveId = e.detail;
  console.log(`Selected file: ${driveId}`);
});
```

## Usage

### Installation

```sh
npm install --save @advanced-rest-client/google-drive-browser
```

## Development

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
npm test
```
