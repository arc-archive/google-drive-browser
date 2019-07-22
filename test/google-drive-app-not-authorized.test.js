import { fixture, assert } from '@open-wc/testing';
import { a11ySuite } from '@advanced-rest-client/a11y-suite/index.js';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../google-drive-app-not-authorized.js';

describe('<google-drive-app-not-authorized>', function() {
  async function basicFixture() {
    return (await fixture(`<google-drive-app-not-authorized></google-drive-app-not-authorized>`));
  }

  describe('back()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Disaptches back event', () => {
      const spy = sinon.spy();
      element.addEventListener('back', spy);
      element.back();
      assert.isTrue(spy.called);
    });
  });

  describe('_dispatchOpenExtarnal()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Disaptches open-external-url event', () => {
      const spy = sinon.spy();
      element.addEventListener('open-external-url', spy);
      element._dispatchOpenExtarnal();
      assert.isTrue(spy.called);
    });

    it('Returns the event', () => {
      const result = element._dispatchOpenExtarnal();
      assert.typeOf(result, 'customevent');
      assert.equal(result.type, 'open-external-url');
    });

    it('Event bubbles', () => {
      const e = element._dispatchOpenExtarnal();
      assert.isTrue(e.bubbles);
    });

    it('Event is composed', () => {
      const e = element._dispatchOpenExtarnal();
      if (e.composed !== undefined) { // edge
        assert.isTrue(e.composed);
      }
    });

    it('Event is cancelable', () => {
      const e = element._dispatchOpenExtarnal();
      assert.isTrue(e.cancelable);
    });

    it('Detail has url', () => {
      const e = element._dispatchOpenExtarnal('https://domain.com');
      assert.equal(e.detail.url, 'https://domain.com');
    });
  });

  describe('openDrive', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.item = {
        webViewLink: 'test-link'
      };
    });

    it('Calls _dispatchOpenExtarnal() with argument', () => {
      element.addEventListener('open-external-url', function f(e) {
        element.removeEventListener('open-external-url', f);
        e.preventDefault();
      });
      const spy = sinon.spy(element, '_dispatchOpenExtarnal');
      element.openDrive();
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0], 'test-link');
    });
  });

  describe('a11y', () => {
    it('Passes automated tests', async () => {
      a11ySuite('Normal state for google-drive-app-not-authorized',
          `<google-drive-app-not-authorized></google-drive-app-not-authorized>`);
    });
  });
});
