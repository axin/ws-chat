import {
    CONNECTION_CLOSED,
    JOIN_REQUEST_ACCEPTED
} from '../../server/server-message-types';
import { div } from '../../infrastructure/dom-helpers';

import Users from './users';
import Backdrop from './backdrop';
import Messages from './messages';

export const CHAT_COMPONENT_ID = 'chat';

export default function Chat() {
    const users = Users();
    const messages = Messages();
    const backdrop = Backdrop();

    const dom = div([
        users,
        messages,
        backdrop
    ]);

    return {
        dom,
        id: CHAT_COMPONENT_ID,
        update: message => {
            if (message.messageType === CONNECTION_CLOSED) {
                backdrop.update('show');
            } else if (message.messageType === JOIN_REQUEST_ACCEPTED) {
                backdrop.update('hide');
            }

            users.update(message);
            messages.update(message);
        }
    };
}