import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@google-web-components/google-signin/google-signin-aware.js';
import '../google-drive-browser.js';

/** @typedef {import('@google-web-components/google-signin/google-signin-aware')} SignInAware */

class ComponentDemoPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility', 'outlined',
      'token',
    ]);
    this.componentName = 'google-drive-browser';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.renderViewControls = true;
    this.cid = '10525470235-anf4fj0c73c0of7g2vt62f0lj93bnrtp.apps.googleusercontent.com';
    this.cid = '1076318174169-u4a5d3j2v0tbie1jnjgsluqk1ti7ged3.apps.googleusercontent.com';
    this.scopes = 'https://www.googleapis.com/auth/drive.file';

    
    this.signOut = this.signOut.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);
    this._userAuthorized = this._userAuthorized.bind(this);
    this.signIn = this.signIn.bind(this);
    this._fileHandler = this._fileHandler.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleSignInError = this.handleSignInError.bind(this);
    this._tokenInvalid = this._tokenInvalid.bind(this);
  }

  /**
   * @returns {SignInAware}
   */
  get aware() {
    return document.getElementById('aware');
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.outlined = state === 1;
    this.compatibility = state === 2;
  }

  signOut() {
    this.token = undefined;
  }

  handleSignInError(e) {
    console.log(`Sign in error:`, e.detail.error);
  }

  handleStateChange(e) {
    const { signedIn, initialized } = e.target;
    if (initialized && !signedIn) {
      console.log('Auth: not signed in');
    } else {
      console.log('Auth: signed in');
    }
  }

  signIn() {
    this._requestAuth();
  }

  _requestAuth() {
    if (this.aware.needAdditionalAuth) {
      this.aware.signIn();
    } else {
      /* global gapi */
      // @ts-ignore
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      const session = user.getAuthResponse();
      this.token = session.access_token;
    }
  }

  _fileHandler(e) {
    console.log(`File picked: ${e.detail}`);
  }

  _tokenInvalid() {
    console.log('Current access token is invalid.');
  }

  handleSignOut() {
    this.token = undefined;
  }

  _userAuthorized(e) {
    const token = e.detail.access_token;
    this.token = token;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      token,
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
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <google-drive-browser
            ?compatibility="${compatibility}"
            .outlined="${outlined}"
            .accessToken="${token}"
            pageSize="5"
            mimeType="application/restclient+data"
            slot="content"
            @pick="${this._fileHandler}"
            @tokeninvalid="${this._tokenInvalid}"
          ></google-drive-browser>
        </arc-interactive-demo>

        ${token ? 
          html`<anypoint-button @click="${this.signOut}">Sign out</anypoint-button>` : 
          html`<anypoint-button @click="${this.signIn}">Sign in</anypoint-button>`}
        
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
        @initialized-changed="${this.handleStateChange}"
      ></google-signin-aware>
      <h2>Google Drive browser</h2>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemoPage();
instance.render();
