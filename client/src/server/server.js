import {
    CONNECTION_OPENED,
    CONNECTION_CLOSED,
    JOIN_REQUEST_ACCEPTED,
    NEW_USER_JOINED_CHAT
} from './server-message-types';

import {
    JOIN_CHAT
} from './client-message-types';

let ws = null;
let currentUserName = null;

const listeners = [];
const serverUrl = 'ws://localhost:8090';

export function listenServer(listener) {
    listeners.push(listener);
}

export function sendMessage(message) {
    if (!message ||
        (typeof (message) !== 'object') ||
        (typeof (message.messageType) !== 'string')) {
        throw new Error('Invalid message.');
    }

    if (currentUserName !== null) {
        message.userName = currentUserName;
    }

    if (ws && (ws.readyState === WebSocket.OPEN)) {
        ws.send(JSON.stringify(message));
    }
}

export function connect() {
    ws = new WebSocket(serverUrl);

    ws.onopen = () => {
        console.info('Connection opened.');

        if (currentUserName !== null) {
            sendMessage({
                messageType: JOIN_CHAT
            });
        }

        publishMessage({
            messageType: CONNECTION_OPENED
        });
    };

    ws.onerror = err => {
        console.error('Server returned an error.');
    };

    ws.onmessage = message => {
        const msg = toMessageObject(message);

        if (!msg) {
            console.error('Invalid message has being received.');
            return;
        }

        if (msg.messageType === JOIN_REQUEST_ACCEPTED) {
            currentUserName = msg.userName;
        } else if (msg.userName === currentUserName) {
            return;
        }

        publishMessage(msg);
    };

    ws.onclose = () => {
        console.warn('Connection closed.');
        publishMessage({
            messageType: CONNECTION_CLOSED
        });
        setTimeout(() => { connect(); }, 5000);
    };
}

function publishMessage(message) {
    for (let listener of listeners) {
        listener(message);
    }
}

function toMessageObject(message) {
    const data = message.data;

    let messageObject = null;
    if (typeof (data) === 'string') {
        try {
            messageObject = JSON.parse(data);
        } catch (e) { }
    }

    if ((messageObject !== null) && (typeof (messageObject.messageType) == 'string')) {
        return messageObject;
    }

    return null;
}
