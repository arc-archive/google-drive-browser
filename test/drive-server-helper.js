import '../../../chance/dist/chance.min.js';
import {fakeServer} from '../../../sinon/pkg/sinon-esm.js';
/* global chance */
export const DriveServer = {
  // Size of file array in the query response
  responseSize: 50,
  // Sets value of the `isAppAuthorized` property on the query response
  isAppAuthorized: true,
  // Sets value of the `canDownload` property on the query response
  canDownload: true,
  // Sets value of the `canEdit` property on the query response
  canEdit: true,
  // adds nextPageToken
  addNextPageToken: true,

  createServer: function() {
    this.srv = fakeServer.create({
      autoRespond: true
    });
    this.mock();
  },

  mock: function() {
    this.mockList();
    this.mockAssetDownload();
  },

  mockList: function() {
    const url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\?*/;
    this.srv.respondWith('GET', url, function(request) {
      const result = DriveServer.generateResponse(DriveServer.responseSize, DriveServer.addNextPageToken);
      request.respond(200, {}, JSON.stringify(result));
    });
  },

  mockAssetDownload: function() {
    const url = 'http://fake-download-asset.com';
    this.srv.respondWith('GET', url, function(xhr) {
      xhr.respond(200, {
        'Content-Type': 'application/xip'
      }, 'test');
    });
  },

  generateResponse: function(size, addPageToken) {
    const files = [];
    for (let i = 0; i < size; i++) {
      files.push(DriveServer.createFileObject());
    }
    const result = {
      files
    };
    if (addPageToken) {
      result.nextPageToken = chance.string();
    }
    return result;
  },

  // Creates a duppmy Drive file object
  createFileObject: function() {
    const created = chance.date();
    const id = chance.string();
    const obj = {
      id,
      name: chance.sentence({words: 2}),
      createdTime: created.toISOString(),
      isAppAuthorized: DriveServer.isAppAuthorized,
      shared: chance.bool(),
      size: chance.integer({min: 0, max: 999999999}),
      webViewLink: 'https://drive.google.com/file/d/' + id + '/view?usp=drivesdk',
      capabilities: {
        canDownload: DriveServer.canDownload,
        canEdit: DriveServer.canEdit
      }
    };
    return obj;
  },

  restore: function() {
    this.srv.restore();
  }
};
