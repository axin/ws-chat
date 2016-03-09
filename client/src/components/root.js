import Welcome, { WELCOME_COMPONENT_ID } from './welcome';
import Chat, { CHAT_COMPONENT_ID } from './chat/chat';
import { div } from '../infrastructure/dom-helpers';

import {
    JOIN_REQUEST_ACCEPTED,
    JOIN_REQUEST_REFUSED
} from '../server/server-message-types';

/** Performs functions of router. */
export default function Root() {
    let currentChild = Welcome();

    const dom = div([
        currentChild
    ]);

    function goTo(component) {
        if (currentChild.id !== component.id) {
            dom.replaceChild(component.dom, dom.firstChild);
            currentChild = component;
        }
    }

    return {
        dom,
        update: message => {
            if (message.messageType === JOIN_REQUEST_ACCEPTED) {
                goTo(Chat());
            } else if (message.messageType === JOIN_REQUEST_REFUSED) {
                goTo(Welcome());
            }

            currentChild.update(message);
        }
    };
}