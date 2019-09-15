import { fixture, assert, aTimeout } from '@open-wc/testing';
import * as sinon from 'sinon/pkg/sinon-esm.js';
import { folderShared, insertDriveFile } from '@advanced-rest-client/arc-icons/ArcIcons.js';
import { DriveServer } from './drive-server-helper.js';
import '../google-drive-list-view.js';

describe('<google-drive-list-view>', function() {
  async function basicFixture() {
    return (await fixture(`<google-drive-list-view></google-drive-list-view>`));
  }

  describe('a11y', function() {
    it('Passes automated tests', async function() {
      const element = await fixture(`<google-drive-list-view></google-drive-list-view>`);
      await assert.isAccessible(element);
    });
  });

  describe('nextPage()', () => {
    it('Dispatches load-next-page event', async () => {
      const element = await basicFixture();
      const spy = sinon.spy();
      element.addEventListener('load-next', spy);
      element.nextPage();
      assert.isTrue(spy.called);
    });
  });

  describe('_refresh()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches load-next-page event', () => {
      const spy = sinon.spy();
      element.addEventListener('refresh-list', spy);
      element._refresh();
      assert.isTrue(spy.called);
    });

    it('Refresh button triggers the event', () => {
      const spy = sinon.spy();
      element.addEventListener('refresh-list', spy);
      const node = element.shadowRoot.querySelector('[data-action="refresh-list"]');
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('_searchAction()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Dispatches search event', () => {
      const spy = sinon.spy();
      element.addEventListener('search', spy);
      element._searchAction();
      assert.isTrue(spy.called);
    });

    it('Search button triggers the event', () => {
      const spy = sinon.spy();
      element.addEventListener('search', spy);
      const node = element.shadowRoot.querySelector('[data-action="search"]');
      node.click();
      assert.isTrue(spy.called);
    });
  });

  describe('_computeIcon()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns shared when has argument', () => {
      const result = element._computeIcon(true);
      assert.equal(result, folderShared);
    });

    it('Returns file when no argument', () => {
      const result = element._computeIcon(false, 'arc');
      assert.equal(result, insertDriveFile);
    });
  });

  describe('_computeIconTitle()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns title when starred', () => {
      const result = element._computeIconTitle(true);
      assert.equal(result, 'Shared with you');
    });

    it('Returns file when no attribute', () => {
      const result = element._computeIconTitle(false);
      assert.equal(result, 'You own this file');
    });
  });

  describe('_computeItemClass()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns "disabled" when cannot download', () => {
      const result = element._computeItemClass(false);
      assert.equal(result, 'disabled');
    });

    it('Returns empty string otherwise', () => {
      const result = element._computeItemClass(true);
      assert.equal(result, '');
    });
  });

  describe('_computeSize()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    [
      [undefined, '0 Bytes'],
      [100, '100 Bytes'],
      [2000, '2 KB'],
      [2000000, '2 MB'],
      [2000000000, '2 GB'],
      [2000000000000, '2 TB']
    ].forEach((item) => {
      it(`Returns ${item[1]} when argument is ${item[0]}`, () => {
        const result = element._computeSize(item[0]);
        assert.equal(result, item[1]);
      });
    });
  });

  describe('_openItem()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const data = DriveServer.generateResponse(10);
      data.files[0].isAppAuthorized = true;
      data.files[1].isAppAuthorized = true;
      data.files[2].isAppAuthorized = true;
      element.items = data.files;
      await aTimeout(64);
    });

    it('Dispatches file-open event', () => {
      const spy = sinon.spy();
      element.addEventListener('file-open', spy);
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      node.click();
      assert.isTrue(spy.called);
    });

    it('Event has model', () => {
      const spy = sinon.spy();
      element.addEventListener('file-open', spy);
      const node = element.shadowRoot.querySelector('[data-action="open-item"]');
      node.click();
      assert.deepEqual(spy.args[0][0].detail, element.items[0]);
    });
  });

  describe('_downloadAppInfo()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      const data = DriveServer.generateResponse(10);
      data.files[0].isAppAuthorized = false;
      element.items = data.files;
      await aTimeout(64);
    });

    it('Dispatches app-not-authorized-error event', () => {
      const spy = sinon.spy();
      element.addEventListener('file-auth-info', spy);
      const node = element.shadowRoot.querySelector('[data-action="download-info"]');
      node.click();
      assert.isTrue(spy.called);
    });

    it('Event has model', () => {
      const spy = sinon.spy();
      element.addEventListener('file-auth-info', spy);
      const node = element.shadowRoot.querySelector('[data-action="download-info"]');
      node.click();
      assert.deepEqual(spy.args[0][0].detail, element.items[0]);
    });
  });

  describe('_queryInputHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Updates "query" proeprty', () => {
      const input = element._search;
      input.value = 'test';
      const ev = new CustomEvent('input');
      input.dispatchEvent(ev);
      assert.equal(element.query, 'test');
    });
  });

  describe('firstUpdated()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Sets "search" event listener', () => {
      const spy = sinon.spy();
      element.addEventListener('search', spy);
      element.query = 'test';
      const ev = new CustomEvent('search');
      element._search.inputElement.dispatchEvent(ev);
      assert.isTrue(spy.called);
      assert.equal(spy.args[0][0].detail.q, 'test');
    });
  });

  describe('onrefreshlist', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onrefreshlist);
      const f = () => {};
      element.onrefreshlist = f;
      assert.isTrue(element.onrefreshlist === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onrefreshlist = f;
      element._refresh();
      element.onrefreshlist = null;
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
      element.onrefreshlist = f1;
      element.onrefreshlist = f2;
      element._refresh();
      element.onrefreshlist = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onloadnext', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onloadnext);
      const f = () => {};
      element.onloadnext = f;
      assert.isTrue(element.onloadnext === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onloadnext = f;
      element.nextPage();
      element.onloadnext = null;
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
      element.onloadnext = f1;
      element.onloadnext = f2;
      element.nextPage();
      element.onloadnext = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });


  describe('onfileopen', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onfileopen);
      const f = () => {};
      element.onfileopen = f;
      assert.isTrue(element.onfileopen === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onfileopen = f;
      element._openItem({});
      element.onfileopen = null;
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
      element.onfileopen = f1;
      element.onfileopen = f2;
      element._openItem({});
      element.onfileopen = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onfileauthinfo', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onfileauthinfo);
      const f = () => {};
      element.onfileauthinfo = f;
      assert.isTrue(element.onfileauthinfo === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onfileauthinfo = f;
      element._downloadAppInfo({});
      element.onfileauthinfo = null;
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
      element.onfileauthinfo = f1;
      element.onfileauthinfo = f2;
      element._downloadAppInfo({});
      element.onfileauthinfo = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('onsearch', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onsearch);
      const f = () => {};
      element.onsearch = f;
      assert.isTrue(element.onsearch === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onsearch = f;
      element._searchAction();
      element.onsearch = null;
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
      element.onsearch = f1;
      element.onsearch = f2;
      element._searchAction();
      element.onsearch = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });
});
