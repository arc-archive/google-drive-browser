/* eslint-disable prefer-destructuring */
import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import sinon from 'sinon';
import { DriveServer } from './drive-server-helper.js';
import '../google-drive-browser.js';
import { 
  accessTokenChanged, setAuthHeader, hasMoreValue, computeQuery, computeQueryParameters, nextPageToken, 
  processApiError, notifyInvalidToken, processApiResult,
} from '../src/GoogleDriveBrowserElement.js';

/** @typedef {import('../index').GoogleDriveBrowserElement} GoogleDriveBrowserElement */

describe('GoogleDriveBrowserElement', () => {
  /**
   * @return {Promise<GoogleDriveBrowserElement>} 
   */
  async function basicFixture() {
    return (fixture(html`<google-drive-browser apiKey="abc"></google-drive-browser>`));
  }

  /**
   * @return {Promise<GoogleDriveBrowserElement>} 
   */
  async function tokenFixture() {
    return (fixture(html`<google-drive-browser apiKey="testApiKey" accessToken="testToken"></google-drive-browser>`));
  }

  before(() => {
    DriveServer.createServer();
  });

  after(() => {
    DriveServer.restore();
  });

  describe('Basics', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('loading is set', () => {
      assert.isFalse(element.loading);
    });

    it('query is undefined', () => {
      assert.isUndefined(element.query);
    });

    it('items is undefined', () => {
      assert.isUndefined(element.items);
    });

    it('queryProperties is undefined', () => {
      assert.isUndefined(element.queryProperties);
    });

    it('hasMore is true by default', () => {
      assert.isTrue(element.hasMore);
    });

    it('access token sets loading to true', () => {
      element.accessToken = 'tokenTest';
      assert.isTrue(element.loading);
    });
  });

  describe('With access token', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await tokenFixture();
      await aTimeout(40);
    });

    it.skip('sets the items array', () => {
      assert.typeOf(element.items, 'array');
      assert.lengthOf(element.items, 50);
    });

    it('loading is false', () => {
      assert.isFalse(element.loading);
    });
  });

  describe('[accessTokenChanged]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('calls [setAuthHeader]()', () => {
      const spy = sinon.spy(element, setAuthHeader);
      element[accessTokenChanged]('test');
      assert.isTrue(spy.called);
    });

    it('calls queryNext() when token', () => {
      const spy = sinon.spy(element, 'queryNext');
      element.items = undefined;
      element[accessTokenChanged]('test');
      assert.isTrue(spy.called);
    });

    it('does not call queryNext() when no token', () => {
      const spy = sinon.spy(element, 'queryNext');
      element[accessTokenChanged](undefined);
      assert.isFalse(spy.called);
    });
  });

  describe('queryNext()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element[hasMoreValue] = false;
      element.accessToken = 'test';
      element[hasMoreValue] = true;
      assert.isFalse(element.loading);
    });

    it('sets loading to true', () => {
      element.queryNext();
      assert.isTrue(element.loading);
    });

    it('sets the items', async () => {
      element.queryNext();
      await aTimeout(10);
      assert.typeOf(element.items, 'array');
    });
  });

  describe('[computeQuery]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('returns empty string when no properties', () => {
      const result = element[computeQuery]();
      assert.equal(result, '');
    });

    it('Adds mimeType', () => {
      element.mimeType = 'test';
      const result = element[computeQuery]();
      assert.equal(result, 'mimeType="test"');
    });

    it('Adds user query', () => {
      element.query = 'test';
      const result = element[computeQuery]();
      assert.equal(result, 'name contains \'test\'');
    });

    it('Adds queryProperties', () => {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      const result = element[computeQuery]();
      let compare = '';
      compare += 'properties has {key=\'a\' and value=\'1\'} and ';
      compare += 'properties has {key=\'b\' and value=\'2\'}';
      assert.equal(result, compare);
    });

    it('Adds queryProperties negation', () => {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      element.queryPropertiesNegation = true;
      const result = element[computeQuery]();
      let compare = 'not ';
      compare += 'properties has {key=\'a\' and value=\'1\'} and not ';
      compare += 'properties has {key=\'b\' and value=\'2\'}';
      assert.equal(result, compare);
    });

    it('All together', () => {
      element.queryProperties = {
        'a': '1',
        'b': '2'
      };
      element.queryPropertiesNegation = true;
      element.mimeType = 'testMime';
      element.query = 'testQuery';
      const result = element[computeQuery]();
      let compare = 'mimeType="testMime"';
      compare += ' and not properties has {key=\'a\' and value=\'1\'}';
      compare += ' and not properties has {key=\'b\' and value=\'2\'}';
      compare += ' and name contains \'testQuery\'';
      assert.equal(result, compare);
    });
  });

  describe('[computeQueryParameters]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets queryParams', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result, 'object');
    });

    it('Sets q property', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result.q, 'string');
    });

    it('Sets pageSize property', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result.pageSize, 'string');
      assert.equal(result.pageSize, String(element.pageSize));
    });

    it('Sets fields property', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result.fields, 'string');
    });

    it('Sets orderBy property', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result.orderBy, 'string');
    });

    it('Sets orderBy property', () => {
      const result = element[computeQueryParameters]();
      assert.typeOf(result.key, 'string');
      assert.equal(result.key, element.apiKey);
    });

    it('pageToken is not set', () => {
      const result = element[computeQueryParameters]();
      assert.isUndefined(result.pageToken);
    });

    it('pageToken is set when _nextPageToken property is set', () => {
      element[nextPageToken] = 'testToken';
      const result = element[computeQueryParameters]();
      assert.equal(result.pageToken, 'testToken');
    });
  });

  describe('refresh()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Calls queryNext()', () => {
      const spy = sinon.spy(element, 'queryNext');
      element.refresh();
      assert.isTrue(spy.called);
    });
  });

  describe('[searchHandler]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    const query = 'test-q';
    beforeEach(async () => {
      element = await tokenFixture();
      // for the query to finish.
      await aTimeout(1);
    });

    it('calls refresh()', () => {
      const spy = sinon.spy(element, 'refresh');
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('#search'));
      input.value = query;
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('search'));
      assert.isTrue(spy.called);
    });

    it('sets the query property', () => {
      const input = /** @type HTMLInputElement */ (element.shadowRoot.querySelector('#search'));
      input.value = query;
      input.dispatchEvent(new Event('input'));
      assert.equal(element.query, 'test-q');
    });
  });

  describe('refresh()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      element[nextPageToken] = 'test-token';
      element[hasMoreValue] = false;
      element.items = [];
    });

    it('calls queryNext()', () => {
      const spy = sinon.spy(element, 'queryNext');
      element.refresh();
      assert.isTrue(spy.called);
    });

    it('resets nextPageToken', () => {
      element.refresh();
      assert.isUndefined(element[nextPageToken]);
    });

    it('Resets hasMore', () => {
      element.refresh();
      assert.isTrue(element.hasMore);
    });

    it('Resets items', () => {
      element.refresh();
      assert.isUndefined(element.items);
    });
  });

  describe('[processApiError]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
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

    it('sets offline message', () => {
      element[processApiError](0, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'You are offline.');
    });

    it('sets 400 message', () => {
      element[processApiError](400, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'The app caused the error in request: test-message');
    });

    it('calls [notifyInvalidToken]() when token is set and 401 response', () => {
      element.accessToken = 'test';
      const spy = sinon.spy(element, notifyInvalidToken);
      element[processApiError](401, JSON.stringify(errorResponse));
      assert.isTrue(spy.called);
    });

    it('sets 404 message', () => {
      element[processApiError](404, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'File not found (404).');
    });

    it('sets 500 message', () => {
      element[processApiError](500, JSON.stringify(errorResponse));
      assert.equal(element.errorMessage, 'Drive error: an unexpected error occurred while processing the request.');
    });

    [
      ['dailyLimitExceeded', 'API calls limit for the app has been reached. Try again tomorrow.'],
      ['userRateLimitExceeded', 'You reached your requests limit for the app. Try again tomorrow.'],
      ['rateLimitExceeded', 'You reached your requests limit for Drive. Try again tomorrow.'],
      ['appNotAuthorizedToFile', 'This application cannot open the file.'],
      ['insufficientFilePermissions', 'You do not have sufficient permissions to the file.'],
      ['domainPolicy', 'The policy for your domain does not allow access to Google Drive ' +
        'by your app.'],
      ['default', 'test-message']
    ].forEach((item) => {
      it(`403 - ${item[0]}`, () => {
        errorResponse.error.errors[0].reason = item[0];
        element[processApiError](403, JSON.stringify(errorResponse));
        assert.equal(element.errorMessage, item[1]);
      });
    });
  });

  describe('[notifyInvalidToken]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('dispatches tokeninvalid event', () => {
      const spy = sinon.spy();
      element.addEventListener('tokeninvalid', spy);
      element[notifyInvalidToken]();
      assert.isTrue(spy.called);
    });
  });

  describe('[processApiResult]()', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('sets [nextPageToken]', () => {
      element[processApiResult]({
        nextPageToken: 'test'
      });
      assert.equal(element[nextPageToken], 'test');
    });

    it('sets hasMore to false when no items', () => {
      element[processApiResult]({
        files: []
      });
      assert.isFalse(element.hasMore);
    });

    it('sets "files" property', () => {
      const files = [{ id: 'test', isAppAuthorized: true, capabilities: { canDownload: true, canEdit: true } }];
      element[processApiResult]({
        // @ts-ignore
        files,
      });
      assert.deepEqual(element.items, files);
    });

    it('Adds to "files" property', () => {
      const files = [{ id: 'test-2', isAppAuthorized: true, capabilities: { canDownload: true, canEdit: true } }];
      // @ts-ignore
      element.items = [{ id: 'test-1', isAppAuthorized: true, capabilities: { canDownload: true, canEdit: true } }];
      // @ts-ignore
      const compare = element.items.concat(files);
      element[processApiResult]({
        // @ts-ignore
        files,
      });
      assert.deepEqual(element.items, compare);
    });
  });

  describe('a11y', () => {
    let element = /** @type GoogleDriveBrowserElement */ (null);
    beforeEach(async () => {
      element = await tokenFixture();
      await aTimeout(20);
    });

    it('passes a11y tests', async () => {
      await assert.isAccessible(element);
    });
  });
});
