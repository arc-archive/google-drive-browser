/* global sinon, chance */
var DriveServer = {
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
    this.srv = sinon.fakeServer.create({
      autoRespond: true
    });
    this.mock();
  },

  mock: function() {
    this.mockList();
    this.mockAssetDownload();
  },

  mockList: function() {
    // https://www.googleapis.com/drive/v3/files?q=trashed%20%3D%20false%20and%20mimeType%3D%22application%2Frestclient%2Bdata%22&pageSize=50&fields=files(capabilities%2FcanEdit%2Ccapabilities%2FcanDownload%2CisAppAuthorized%2CcreatedTime%2Cid%2Cname%2Cshared%2Csize%2CwebViewLink)%2CnextPageToken&orderBy=modifiedTime%20desc&key=935342572974-bunq4fuvs521nsbb1ffegtmpq1a224nm.apps.googleusercontent.com
    var url = /^https:\/\/www\.googleapis\.com\/drive\/v3\/files\?*/;
    this.srv.respondWith('GET', url, function(request) {
      var files = [];
      for (var i = 0; i < DriveServer.responseSize; i++) {
        files.push(DriveServer.createFileObject());
      }
      var result = {
        files: files
      };
      if (DriveServer.addNextPageToken) {
        result.nextPageToken = chance.string();
      }
      request.respond(200, {}, JSON.stringify(result));
    });
  },

  mockAssetDownload: function() {
    var url = 'http://fake-download-asset.com';
    this.srv.respondWith('GET', url, function(xhr) {
      xhr.respond(200, {
        'Content-Type': 'application/xip'
      }, 'test');
    });
  },
  // Creates a duppmy Drive file object
  createFileObject: function() {
    var created = chance.date();
    var id = chance.string();
    var obj = {
      id: id,
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
