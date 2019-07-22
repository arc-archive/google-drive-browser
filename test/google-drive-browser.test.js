import { fixture, assert, aTimeout } from '@open-wc/testing';
import { a11ySuite } from '@advanced-rest-client/a11y-suite/index.js';
import { DriveServer } from './drive-server-helper.js';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../google-drive-browser.js';

describe('<google-drive-browser>', function() {
  async function basicFixture() {
    return (await fixture(`<google-drive-browser apikey="abc"></google-drive-browser>`));
  }

  async function tokenFixture() {
    return (await fixture(`<google-drive-browser
      apikey="testApiKey" accesstoken="testToken"></google-drive-browser>`));
  }

  async function scopesFixture() {
    return (await fixture(`<google-drive-browser
      apikey="testApiKey" scope="scope1 scope2   scope3"></google-drive-browser>`));
  }

  before(() => {
    DriveServer.createServer();
  });

  after(() => {
    DriveServer.restore();
  });

  describe('Basics', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('loading is undefined', function() {
      assert.isUndefined(element.loading);
    });

    it('query is undefined', function() {
      assert.isUndefined(element.query);
    });

    it('items is undefined', function() {
      assert.isUndefined(element.items);
    });

    it('queryProperties is undefined', function() {
      assert.isUndefined(element.queryProperties);
    });

    it('_queryParams is undefined', function() {
      assert.isUndefined(element._queryParams);
    });

    it('_nextPageToken is undefined', function() {
      assert.isUndefined(element._nextPageToken);
    });

    it('_fileId is undefined', function() {
      assert.isUndefined(element._fileId);
    });

    it('selectedView is computed', function(done) {
      setTimeout(() => {
        assert.equal(element.selectedView, 0);
        done();
      });
    });

    it('hasMore is true by default', function() {
      assert.isTrue(element._hasMore);
    });

    it('Access token sets loading to true', function() {
      element.accessToken = 'tokenTest';
      // debouncer is set
      assert.isTrue(element.loading);
    });
  });

  describe('With access token', function() {
    let element;
    beforeEach(async () => {
      element = await tokenFixture();
      await aTimeout(20);
    });

    it('selectedView is computed', function() {
      assert.equal(element.selectedView, 1);
    });

    it('sets the items array', function() {
      assert.typeOf(element.items, 'array');
      assert.lengthOf(element.items, 50);
    });

    it('loading is false', function() {
      assert.isFalse(element.loading);
    });
  });

  describe('_hasScope()', function() {
    let element;
    beforeEach(async () => {
      element = await scopesFixture();
    });

    it('returns false if no argument', function() {
      const result = element._hasScope();
      assert.isFalse(result);
    });

    it('returns true if no scope property', function() {
      element.scope = undefined;
      const result = element._hasScope('test1');
      assert.isTrue(result);
    });

    it('returns true for existing scopes', function() {
      let result = element._hasScope('scope1');
      assert.isTrue(result);
      result = element._hasScope('scope2');
      assert.isTrue(result);
    });

    it('Ignores empty matches', function() {
      const result = element._hasScope('scope3');
      assert.isTrue(result);
    });

    it('returns false for unknown scope', function() {
      const result = element._hasScope('testscope');
      assert.isFalse(result);
    });
  });

  describe('_initView()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets view to authorization for missing access token', function() {
      element._initView();
      assert.equal(element.selectedView, 0);
    });

    it('Sets view to list when token is set', function() {
      element.accessToken = 'test';
      element._initView();
      assert.equal(element.selectedView, 1);
    });

    it('Refreshes items list when items is not set', function() {
      element.accessToken = 'test';
      const spy = sinon.spy(element, '_queryFiles');
      element._initView();
      assert.isTrue(spy.called);
    });

    it('Do not refreshes items list when items is set', function() {
      element.accessToken = 'test';
      element.items = [];
      const spy = sinon.spy(element, '_queryFiles');
      element._initView();
      assert.isFalse(spy.called);
    });
  });

  describe('_accessTokenChanged()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _accessTokenChanged()', function() {
      const spy = sinon.spy(element, '_setAuthHeader');
      element._accessTokenChanged(true);
      assert.isTrue(spy.called);
    });

    it('Sets view to authorization if not argument', function() {
      element._accessTokenChanged();
      assert.equal(element.selectedView, 0);
    });

    it('Sets view to list if argument', function() {
      element._accessTokenChanged('test');
      assert.equal(element.selectedView, 1);
    });

    it('Calls _queryFiles() when token and no items', function() {
      const spy = sinon.spy(element, '_queryFiles');
      element.items = undefined;
      element._accessTokenChanged('test');
      assert.isTrue(spy.called);
    });

    it('Won\'t call _queryFiles() when token and items', function() {
      const spy = sinon.spy(element, '_queryFiles');
      element.items = [];
      element._accessTokenChanged('test');
      assert.isFalse(spy.called);
    });
  });

  describe('_queryFiles()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._hasMore = false;
      element.accessToken = 'test';
      element._hasMore = true;
      assert.isUndefined(element.loading);
    });

    it('Sets loading to true', function() {
      element._queryFiles();
      assert.isTrue(element.loading);
    });

    it('queryParams is set', function() {
      element._queryFiles();
      assert.typeOf(element._queryParams, 'object');
    });
  });

  describe('_buildQuery()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty string when no porperties', function() {
      const result = element._buildQuery();
      assert.equal(result, '');
    });

    it('Adds mimeType', function() {
      element.mimeType = 'test';
      const result = element._buildQuery();
      assert.equal(result, 'mimeType="test"');
    });

    it('Adds user query', function() {
      element.query = 'test';
      const result = element._buildQuery();
      assert.equal(result, 'name contains \'test\'');
    });

    it('Adds queryProperties', function() {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      const result = element._buildQuery();
      let compare = '';
      compare += 'properties has {key=\'a\' and value=\'1\'} and ';
      compare += 'properties has {key=\'b\' and value=\'2\'}';
      assert.equal(result, compare);
    });

    it('Adds queryProperties negation', function() {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      element.queryPropertiesNegation = true;
      const result = element._buildQuery();
      let compare = 'not ';
      compare += 'properties has {key=\'a\' and value=\'1\'} and not ';
      compare += 'properties has {key=\'b\' and value=\'2\'}';
      assert.equal(result, compare);
    });

    it('All together', function() {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      element.queryPropertiesNegation = true;
      element.mimeType = 'testMime';
      element.query = 'testQuery';
      const result = element._buildQuery();
      let compare = 'mimeType="testMime"';
      compare += ' and not properties has {key=\'a\' and value=\'1\'}';
      compare += ' and not properties has {key=\'b\' and value=\'2\'}';
      compare += ' and name contains \'testQuery\'';
      assert.equal(result, compare);
    });
  });

  describe('_setQueryParameters()', function() {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets queryParams', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams, 'object');
    });

    it('Sets q property', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams.q, 'string');
    });

    it('Sets pageSize property', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams.pageSize, 'number');
      assert.equal(element._queryParams.pageSize, element.querySize);
    });

    it('Sets fields property', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams.fields, 'string');
    });

    it('Sets orderBy property', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams.orderBy, 'string');
    });

    it('Sets orderBy property', function() {
      element._setQueryParameters();
      assert.typeOf(element._queryParams.key, 'string');
      assert.equal(element._queryParams.key, element.apiKey);
    });

    it('pageToken is not set', function() {
      element._setQueryParameters();
      assert.isUndefined(element._queryParams.pageToken);
    });

    it('pageToken is set when _nextPageToken property is set', function() {
      element._nextPageToken = 'testToken';
      element._setQueryParameters();
      assert.equal(element._queryParams.pageToken, 'testToken');
    });
  });

  describe('showList()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets selectedView', () => {
      element.showList();
      assert.equal(element.selectedView, 1);
    });
  });

  describe('refresh()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls _resetQuery()', () => {
      const spy = sinon.spy(element, '_resetQuery');
      element.refresh();
      assert.isTrue(spy.called);
    });
  });

  describe('_onSearch()', () => {
    let element;
    let ev;
    beforeEach(async () => {
      element = await basicFixture();
      ev = {
        detail: {
          q: 'test-q'
        }
      };
    });

    it('Calls _resetQuery()', () => {
      const spy = sinon.spy(element, '_resetQuery');
      element._onSearch(ev);
      assert.isTrue(spy.called);
    });

    it('Sets query', () => {
      element._onSearch(ev);
      assert.equal(element.query, 'test-q');
    });
  });

  describe('_resetQuery()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element._nextPageToken = 'test-token';
      element._hasMore = false;
      element.items = [];
    });

    it('Calls _queryFiles()', () => {
      const spy = sinon.spy(element, '_queryFiles');
      element._resetQuery();
      assert.isTrue(spy.called);
    });

    it('Resets _nextPageToken', () => {
      element._resetQuery();
      assert.isUndefined(element._nextPageToken);
    });

    it('Resets hasMore', () => {
      element._resetQuery();
      assert.isTrue(element._hasMore);
    });

    it('Resets items', () => {
      element._resetQuery();
      assert.isUndefined(element.items);
    });
  });

  describe('_signedinHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await scopesFixture();
    });

    it('Resets authorizing state', () => {
      element.authorizing = true;
      element._signedinHandler({
        detail: {}
      });
      assert.isFalse(element.authorizing);
    });

    it('Sets accessToken', () => {
      element._signedinHandler({
        detail: {
          token: 'test-token',
          scope: 'scope1'
        }
      });
      assert.equal(element.accessToken, 'test-token');
    });

    it('Ignores token when scope is invalid', () => {
      element._signedinHandler({
        detail: {
          token: 'test-token',
          scope: 'other-scope'
        }
      });
      assert.isUndefined(element.accessToken);
    });

    it('Handles google-signin-success event', () => {
      document.body.dispatchEvent(new CustomEvent('google-signin-success', {
        bubbles: true,
        detail: {
          token: 'test-token',
          scope: 'scope1'
        }
      }));
      assert.equal(element.accessToken, 'test-token');
    });
  });

  describe('_signoutHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await scopesFixture();
    });

    it('Resets authorizing state', () => {
      element.authorizing = true;
      element._signoutHandler();
      assert.isFalse(element.authorizing);
    });

    it('Clears accessToken', () => {
      element.accessToken = 'test-token';
      element._signoutHandler();
      assert.isUndefined(element.accessToken);
    });

    it('Handles google-signout event', () => {
      element.accessToken = 'test-token';
      document.body.dispatchEvent(new CustomEvent('google-signout', {
        bubbles: true,
        detail: {}
      }));
      assert.isUndefined(element.accessToken);
    });
  });

  describe('_handleDriveApiError()', () => {
    let element;
    let errorResponse;
    beforeEach(async () => {
      element = await basicFixture();
      errorResponse = {
        error: {
          errors: [{
            message: 'test-message',
            reason: ''
          }]
        }
      };
    });

    it('Sets offline message', () => {
      element._handleDriveApiError(0, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'You are offline.');
    });

    it('Sets error view', () => {
      element._handleDriveApiError(0, JSON.stringify(errorResponse));
      assert.equal(element.selectedView, 2);
    });

    it('Sets 400 message', () => {
      element._handleDriveApiError(400, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'The app caused the error in request: test-message');
    });

    it('Sets 401 message', () => {
      element._handleDriveApiError(401, JSON.stringify(errorResponse));
      assert.equal(element.selectedView, 0);
    });

    it('Calls _notifyInvalidToken() when token is set and 401 response', () => {
      element.accessToken = 'test';
      const spy = sinon.spy(element, '_notifyInvalidToken');
      element._handleDriveApiError(401, JSON.stringify(errorResponse));
      assert.isTrue(spy.called);
    });

    it('Sets 404 message', () => {
      element._handleDriveApiError(404, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'File not found (404).');
    });

    it('Sets 500 message', () => {
      element._handleDriveApiError(500, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'Drive error: an unexpected error occurred while processing the request.');
    });

    [
      ['dailyLimitExceeded', 'API calls limit for the app has been reqached. Try again tomorrow.'],
      ['userRateLimitExceeded', 'You reached your requests limit for the app. Try again tomorrow.'],
      ['rateLimitExceeded', 'You reached your requests limit for Drive. Try again tomorrow.'],
      ['insufficientFilePermissions', 'You do not have sufficient permissions to the file.'],
      ['domainPolicy', 'The policy for your domain does not allow access to Google Drive ' +
        'by your app.'],
      ['default', 'test-message']
    ].forEach((item) => {
      it(`403 - ${item[0]}`, () => {
        errorResponse.error.errors[0].reason = item[0];
        element._handleDriveApiError(403, JSON.stringify(errorResponse));
        assert.equal(element.errorMessage, item[1]);
      });
    });

    it('Handles 403 - appNotAuthorizedToFile', () => {
      errorResponse.error.errors[0].reason = 'appNotAuthorizedToFile';
      element._fileId = 'testid';
      element.items = [{ id: 'testid' }];
      const spy = sinon.spy(element, '_explainAppNotAuthorized');
      element._handleDriveApiError(403, JSON.stringify(errorResponse));
      assert.isTrue(spy.called);
      assert.deepEqual(spy.args[0][0], element.items[0]);
    });
  });

  describe('_explainAppNotAuthorized()', () => {
    let element;
    beforeEach(async () => {
      element = await scopesFixture();
    });

    it('Sets passed item on the element', async () => {
      const item = { id: 'test' };
      element._explainAppNotAuthorized(item);
      await aTimeout();
      const node = element.shadowRoot.querySelector('google-drive-app-not-authorized');
      assert.deepEqual(node.item, item);
    });

    it('Selected error view', () => {
      const item = { id: 'test' };
      element._explainAppNotAuthorized(item);
      assert.equal(element.selectedView, 3);
    });
  });

  describe('_notifyInvalidToken()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches oauth-2-token-invalid event', () => {
      const spy = sinon.spy();
      window.addEventListener('oauth-2-token-invalid', spy);
      element._notifyInvalidToken();
      assert.isTrue(spy.called);
    });

    it('Event has accessToken', () => {
      element.items = []; // prohibits auto query
      element.accessToken = 'test-token';
      const spy = sinon.spy();
      window.addEventListener('oauth-2-token-invalid', spy);
      element._notifyInvalidToken();
      assert.equal(spy.args[0][0].detail.accessToken, 'test-token');
    });

    it('Event has scope', () => {
      const spy = sinon.spy();
      window.addEventListener('oauth-2-token-invalid', spy);
      element._notifyInvalidToken();
      assert.equal(spy.args[0][0].detail.scope, element.scope);
    });
  });

  describe('_onDriveListResponse()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets loading flag to false', () => {
      element.loading = true;
      element._onDriveListResponse();
      assert.isFalse(element.loading);
    });

    it('Sets _nextPageToken', () => {
      element._onDriveListResponse({
        nextPageToken: 'test'
      });
      assert.equal(element._nextPageToken, 'test');
    });

    it('Sets _hasMore to false when no items', () => {
      element._onDriveListResponse({
        files: []
      });
      assert.isFalse(element._hasMore);
    });

    it('Sets "files" property', () => {
      const files = [{ id: 'test' }];
      element._onDriveListResponse({
        files
      });
      assert.deepEqual(element.items, files);
    });

    it('Adds to "files" property', () => {
      const files = [{ id: 'test-2' }];
      element.items = [{ id: 'test-1' }];
      const compare = element.items.concat(files);
      element._onDriveListResponse({
        files
      });
      assert.deepEqual(element.items, compare);
    });
  });

  describe('_downloadFile()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets loading flag to true', async () => {
      const rsp = element._downloadFile('id');
      assert.isTrue(element.loading);
      await rsp;
    });

    it('Does nothing when no argument', () => {
      element._downloadFile();
      assert.isUndefined(element.loading);
    });

    it('Sets _fileId to passed argument', async () => {
      const rsp = element._downloadFile('id');
      assert.equal(element._fileId, 'id');
      await rsp;
    });

    it('Calls _handleDownloadResponse()', async () => {
      const spy = sinon.spy(element, '_handleDownloadResponse');
      await element._downloadFile('id');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'test');
    });

    it('Calls _handleDriveApiError()', async () => {
      const spy = sinon.spy(element, '_handleDriveApiError');
      await element._downloadFile('error');
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 500);
      assert.equal(spy.args[0][1], '{"test": true}');
    });
  });

  describe('_handleDownloadResponse', () => {
    let element;
    const content = 'test-content';
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets loading to false', () => {
      element.loading = true;
      element._handleDownloadResponse(content);
      assert.isFalse(element.loading);
    });

    it('Dispatches drive-file event', () => {
      const spy = sinon.spy();
      element.addEventListener('drive-file', spy);
      element._fileId = 'test-id';
      element._handleDownloadResponse(content);
      assert.equal(spy.args[0][0].detail.content, content);
      assert.equal(spy.args[0][0].detail.diveId, 'test-id');
    });

    it('Clears _fileId', () => {
      element._fileId = 'test-id';
      element._handleDownloadResponse(content);
      assert.isUndefined(element._fileId);
    });
  });

  describe('ongoogleauthorize', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    function dispatch(element) {
      element.dispatchEvent(new CustomEvent('google-authorize'));
    }

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.ongoogleauthorize);
      const f = () => {};
      element.ongoogleauthorize = f;
      assert.isTrue(element.ongoogleauthorize === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.ongoogleauthorize = f;
      dispatch(element);
      element.ongoogleauthorize = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.ongoogleauthorize = f1;
      element.ongoogleauthorize = f2;
      dispatch(element);
      element.ongoogleauthorize = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('ondrivefile', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.ondrivefile);
      const f = () => {};
      element.ondrivefile = f;
      assert.isTrue(element.ondrivefile === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.ondrivefile = f;
      element._handleDownloadResponse('test');
      element.ondrivefile = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.ondrivefile = f1;
      element.ondrivefile = f2;
      element._handleDownloadResponse('test');
      element.ondrivefile = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onoauth2tokeninvalid', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onoauth2tokeninvalid);
      const f = () => {};
      element.onoauth2tokeninvalid = f;
      assert.isTrue(element.onoauth2tokeninvalid === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onoauth2tokeninvalid = f;
      element._notifyInvalidToken();
      element.onoauth2tokeninvalid = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onoauth2tokeninvalid = f1;
      element.onoauth2tokeninvalid = f2;
      element._notifyInvalidToken();
      element.onoauth2tokeninvalid = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    it('Performs a11y tests', async () => {
      await a11ySuite('Normal state for google-drive-browser',
          `<google-drive-browser apikey="abc"></google-drive-browser>`);
    });
  });
});
