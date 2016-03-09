import {
    CONNECTION_OPENED,
    JOIN_REQUEST_REFUSED
} from '../server/server-message-types';
import { JOIN_CHAT } from '../server/client-message-types';
import { sendMessage } from '../server/server';

import { div, text, input } from '../infrastructure/dom-helpers';
import Button from './common/button';

export const WELCOME_COMPONENT_ID = 'welcome';

export default function Welcome() {
    const connectigMessage = div([
        text('Connecting to server...')
    ]);

    const userNameInput = input({ type: 'text' });

    const pleaseWait = div({ style: 'display: none;' }, [
        text('Please wait...')
    ]);

    const errorMessage = div({ style: 'color: red; display: none; max-width: 300px;' });

    const joinForm = div({ style: 'display: none;' }, [
        text('Enter your name: '),
        userNameInput,
        Button({
            caption: 'Join chat',
            onClick: () => {
                sendMessage({ messageType: JOIN_CHAT, userName: userNameInput.value });
                showPleaseWait();
            }
        })
    ]);

    const dom = div({ style: 'display: flex; justify-content: center;' }, [
        div({ style: 'margin-top: 100px;' }, [
            connectigMessage,
            joinForm,
            pleaseWait,
            errorMessage
        ]),
    ]);

    function showJoinForm() {
        connectigMessage.style.display = 'none';
        joinForm.style.display = 'block';
    }

    function showPleaseWait() {
        errorMessage.style.display = 'none';
        pleaseWait.style.display = 'block';
    }

    function showErrorMessage(errorReason) {
        pleaseWait.style.display = 'none';
        errorMessage.innerText = errorReason;
        errorMessage.style.display = 'block';
    }

    return {
        dom,
        id: WELCOME_COMPONENT_ID,
        update: message => {
            if (message.messageType === CONNECTION_OPENED) {
                showJoinForm();
            } else if (message.messageType === JOIN_REQUEST_REFUSED) {
                showErrorMessage(message.reason);
            }
        }
    };
}