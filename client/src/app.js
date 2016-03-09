import Root from './components/root';
import { listenServer, connect } from './server/server';

const rootComponent = Root();

const hostElement = document.querySelector('#app-root');
hostElement.appendChild(rootComponent.dom);

listenServer(rootComponent.update);

connect();
