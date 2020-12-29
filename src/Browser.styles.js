import { css } from 'lit-element';

export default css`
:host {
  display: block;
  height: inherit;
  min-height: inherit;
  display: flex;
  flex-direction: column;
}

.list-item {
  display: flex;
  height: 56px;
  align-items: center;
}

.icon-item {
  width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-body {
  flex: 1;
}

.files-list {
  flex: 1;
  overflow: auto;
}

header {
  display: flex;
  flex-direction: row;
  align-items: center;
}

h2 {
  margin-left: 1.1rem;
  font-weight: 400;
  flex: 1;
}

.search {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.search [type="search"] {
  flex: 1;
  flex-basis: 0.000000001px;
  margin: 16px 12px;
}

.init-info {
  margin: 16px 12px;
}
`;
