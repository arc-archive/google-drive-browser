import { html } from 'lit-html';
import { ArcDemoPage } from '@advanced-rest-client/arc-demo-helper/ArcDemoPage.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@google-web-components/google-signin/google-signin-aware.js';
import '@polymer/paper-toast/paper-toast.js';
import '../google-drive-browser.js';

class DemoPage extends ArcDemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'scope'
    ]);
    this._componentName = 'google-drive-browser';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.cid = '10525470235-anf4fj0c73c0of7g2vt62f0lj93bnrtp.apps.googleusercontent.com';
    this.scopes = 'https://www.googleapis.com/auth/drive.file';
    this._demoStateHandler = this._demoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
    this.signOut = this.signOut.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this._authRequested = this._authRequested.bind(this);
    this._fileHandler = this._fileHandler.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleSignInError = this.handleSignInError.bind(this);
    this._tokenInvalid = this._tokenInvalid.bind(this);
  }

  get aware() {
    return document.getElementById('aware');
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  signOut() {
    document.body.dispatchEvent(new CustomEvent('google-signin-success', {
      bubbles: true,
      detail: {
        scope: this.scopes
      }
    }));
    this.token = undefined;
  }

  handleSignInError(e) {
    this.toast('Sign in error: ' + e.detail.error);
  }

  handleStateChange(e) {
    const signedIn = e.target.signedIn;
    const initialized = e.target.initialized;
    if (initialized && !signedIn) {
      this.toast('Auth: not signed in');
    } else {
      this.toast('Auth: signed in');
    }
  }

  toast(message) {
    const toast = document.getElementById('toast');
    if (toast.opened) {
      toast.opened = false;
    }
    setTimeout(() => {
      toast.text = message;
      toast.opened = true;
    });
  }

  _authRequested(e) {
    this.scope = e.detail.scope;
    setTimeout(() => this._requestAuth());
  }

  _requestAuth() {
    if (this.aware.needAdditionalAuth) {
      this.aware.signIn();
    } else {
      /* global gapi */
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const session = user.getAuthResponse();
      document.body.dispatchEvent(new CustomEvent('google-signin-success', {
        bubbles: true,
        detail: {
          scope: session.scope,
          token: session.access_token
        }
      }));
    }
  }

  _fileHandler(e) {
    this.toast(`File picked: ${e.detail.diveId}`);
    console.log(e.detail.content);
  }

  _tokenInvalid() {
    this.toast('Current access token is invalid.');
  }

  handleSignOut() {
    document.body.dispatchEvent(new CustomEvent('google-signin-success', {
      bubbles: true,
      detail: {
        scope: this.authScope
      }
    }));
    this.token = undefined;
  }

  _userAuthorized(e) {
    const token = e.detail.access_token;
    document.body.dispatchEvent(new CustomEvent('google-signin-success', {
      bubbles: true,
      detail: {
        scope: this.authScope,
        token: token
      }
    }));
    this.token = token;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the Google Drive browser element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <google-drive-browser
            ?compatibility="${compatibility}"
            .outlined="${outlined}"
            slot="content"
            @google-authorize="${this._authRequested}"
            @drive-file="${this._fileHandler}"
            @oauth-2-token-invalid="${this._tokenInvalid}"
          ></google-drive-browser>
        </arc-interactive-demo>

        <anypoint-button @click="${this.signOut}">Sign out</anypoint-button>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <google-signin-aware
        id="aware"
        client-id="${this.cid}"
        scopes="${this.scopes}"
        @signed-in-changed="${this.handleStateChange}"
        @google-signin-aware-signed-out="${this.handleSignOut}"
        @google-signin-aware-success="${this._userAuthorized}"
        @google-signin-aware-error="${this.handleSignInError}"
        @initialized-changed="${this.handleStateChange}"></google-signin-aware>
      <paper-toast id="toast"></paper-toast>
      <h2>Google Drive browser</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new DemoPage();
instance.render();
window._demo = instance;
