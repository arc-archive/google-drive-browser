/* eslint-disable object-shorthand */
import 'chance/dist/chance.min.js';
import { FetchStub } from './fetch-stub.js';
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

  createServer: () => {
    DriveServer.srv = new FetchStub();
    DriveServer.srv.install();
    DriveServer.mock();
  },

  mock: () => {
    DriveServer.mockFileDownloadError();
    DriveServer.mockFileDownload();
    DriveServer.mockList();
  },

  mockList: () => {
    const url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\?*/;
    DriveServer.srv.respondWith(url, () => {
      const result = DriveServer.generateResponse(DriveServer.responseSize, DriveServer.addNextPageToken);
      return JSON.stringify(result);
    });
  },

  mockFileDownload: () => {
    const url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\/[a-z]*\?alt=media/;
    DriveServer.srv.respondWith(url, 'test', {
      headers: {
        'Content-Type': 'application/zip'
      }
    });
  },

  mockFileDownloadError: () => {
    const url = 'https://www.googleapis.com/drive/v3/files/error?alt=media';
    DriveServer.srv.respondWith(url, '{"test": true}', {
      status: 500
    });
  },

  generateResponse: (size, addPageToken) => {
    const files = [];
    for (let i = 0; i < size; i++) {
      files.push(DriveServer.createFileObject());
    }
    const result = {
      files
    };
    if (addPageToken) {
      // @ts-ignore
      result.nextPageToken = chance.string();
    }
    return result;
  },

  // Creates a dummy Drive file object
  createFileObject: () => {
    // @ts-ignore
    const created = chance.date();
    // @ts-ignore
    const id = chance.string();
    const obj = {
      id,
      // @ts-ignore
      name: chance.sentence({ words: 2 }),
      createdTime: created.toISOString(),
      isAppAuthorized: DriveServer.isAppAuthorized,
      // @ts-ignore
      shared: chance.bool(),
      // @ts-ignore
      size: chance.integer({ min: 0, max: 999999999 }),
      webViewLink: `https://drive.google.com/file/d/${  id  }/view?usp=drivesdk`,
      capabilities: {
        canDownload: DriveServer.canDownload,
        canEdit: DriveServer.canEdit
      }
    };
    return obj;
  },

  restore: () => {
    DriveServer.srv.restore();
  }
};
