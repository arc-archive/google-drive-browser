import { fixture, assert } from '@open-wc/testing';
import { a11ySuite } from '@advanced-rest-client/a11y-suite/index.js';
import sinon from 'sinon/pkg/sinon-esm.js';
import '../google-drive-authorize.js';

describe('<google-drive-authorize>', function() {
  async function basicFixture() {
    return (await fixture(`<google-drive-authorize scope="test-scope"></google-drive-authorize>`));
  }

  describe('authorize()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Disaptches open-external-url event', () => {
      const spy = sinon.spy();
      element.addEventListener('google-authorize', spy);
      element.authorize();
      assert.isTrue(spy.called);
    });

    it('Event bubbles', () => {
      const spy = sinon.spy();
      element.addEventListener('google-authorize', spy);
      element.authorize();
      const e = spy.args[0][0];
      assert.isTrue(e.bubbles);
    });

    it('Event is composed', () => {
      const spy = sinon.spy();
      element.addEventListener('google-authorize', spy);
      element.authorize();
      const e = spy.args[0][0];
      if (e.composed !== undefined) { // edge
        assert.isTrue(e.composed);
      }
    });

    it('Event is cancelable', () => {
      const spy = sinon.spy();
      element.addEventListener('google-authorize', spy);
      element.authorize();
      const e = spy.args[0][0];
      assert.isTrue(e.cancelable);
    });

    it('Detail has scope', () => {
      const spy = sinon.spy();
      element.addEventListener('google-authorize', spy);
      element.authorize();
      const e = spy.args[0][0];
      assert.equal(e.detail.scope, 'test-scope');
    });
  });

  describe('Authorization events handlers', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    ['google-signin-success', 'google-signout'].forEach((item) => {
      it('Resets "authorizing" on ' + item, () => {
        element.authorizing = true;
        document.body.dispatchEvent(new CustomEvent(item, {
          bubbles: true
        }));
        assert.isFalse(element.authorizing);
      });
    });

    it('Ignores setter when not "authorizing"', () => {
      document.body.dispatchEvent(new CustomEvent('google-signout', {
        bubbles: true
      }));
      assert.isUndefined(element.authorizing);
    });
  });

  describe('a11y', function() {
    it('Passes automated tests', async function() {
      await a11ySuite('Normal state for google-drive-authorize',
          `<google-drive-authorize scope="test-scope"></google-drive-authorize>`);
    });
  });
});
