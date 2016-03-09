// Collection of helper functions aimed to relieve creation of DOM elements

/**
 * Creates DOM element.
 * @param {string} tagName
 * @param {object} [attributes]
 * @param {(HTMLElement|TextNode)[]} [childNodes]
 * @returns {HTMLElement}
 */
function element() {
    const tagName = arguments[0];

    if ((arguments.length === 0) || (typeof (tagName) !== 'string')) {
        throw new Error('Tag name should be passed as a first argument.');
    }

    const resultElement = document.createElement(tagName);
    const secondArgument = arguments[1];

    const setChildNodes = childNodes => {
        if (!Array.isArray(childNodes)) {
            return;
        }

        const fragment = document.createDocumentFragment();
        for (let childNode of childNodes) {
            if (childNode instanceof Node) {
                fragment.appendChild(childNode);
            } else if (childNode.dom instanceof Node) {
                // Child node is a component
                fragment.appendChild(childNode.dom);
            } else {
                continue;
            }
        }

        resultElement.appendChild(fragment);
    };

    if (secondArgument) {
        // Second argument contains elenent attibutes
        if ((!Array.isArray(secondArgument)) && (typeof (secondArgument) === 'object')) {
            Object.assign(resultElement, secondArgument);
            setChildNodes(arguments[2]);
        } else {
            setChildNodes(secondArgument);
        }
    }

    return resultElement;
}

function text(text) {
    return document.createTextNode(text);
}

const div = creteTagHelper('div');
const textarea = creteTagHelper('textarea');
const button = creteTagHelper('button');
const input = creteTagHelper('input');

function creteTagHelper(tagName) {
    return function () {
        return element.call(null, tagName, ...arguments);
    };
}

const CONNECTION_OPENED = 'CONNECTION_OPENED';
const CONNECTION_CLOSED = 'CONNECTION_CLOSED';
const JOIN_REQUEST_ACCEPTED = 'JOIN_REQUEST_ACCEPTED';
const JOIN_REQUEST_REFUSED = 'JOIN_REQUEST_REFUSED';
const NEW_USER_JOINED_CHAT = 'NEW_USER_JOINED_CHAT';
const USER_LEFT_CHAT = 'USER_LEFT_CHAT';

const JOIN_CHAT = 'JOIN_CHAT';
const NEW_MESSAGE = 'NEW_MESSAGE';

let ws = null;
let currentUserName = null;

const listeners = [];
const serverUrl = 'ws://localhost:8090';

function listenServer(listener) {
    listeners.push(listener);
}

function sendMessage(message) {
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

function connect() {
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

function Button({ caption, onClick }) {
    const btn = button([ text(caption) ]);
    
    if (typeof (onClick) === 'function') {
        btn.addEventListener('click', onClick);
    }
    
    return {
        dom: btn
    };
}

const WELCOME_COMPONENT_ID = 'welcome';

function Welcome() {
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

const userDomElements = {};

function User({ name }) {
    return {
        dom: div({ style: 'padding: 5px;' }, [
            text(name)
        ])
    };
}

function Users() {
    const userList =
        div({ style: 'overflow-y: auto; height: calc(100% - 32px);' }, []);

    const dom = div(
        {
            style: `position: absolute;
                    top: 0; bottom: 0; left: 0;
                    width: 300px; border-right: 1px solid gray;
                    box-sizing: border-box;`
        },
        [
            div(
                {
                    style: `border-bottom: 1px solid gray;
                            padding: 5px; font-weight: bold;`
                },
                [
                    text('Users online')
                ]
            ),
            userList
        ]
    );

    function addUser(userName) {
        const userDomElement = User({ name: userName }).dom;

        userList.appendChild(userDomElement);
        userDomElements[userName] = userDomElement;
    }

    return {
        dom,
        update: message => {
            if (message.messageType === JOIN_REQUEST_ACCEPTED) {
                userList.innerHTML = '';
                const userNames = message.users;

                for (let userName of userNames) {
                    addUser(userName);
                }
            } else if (message.messageType === NEW_USER_JOINED_CHAT) {
                addUser(message.userName);
            } else if (message.messageType === USER_LEFT_CHAT) {
                const userDomElement = userDomElements[message.userName];

                if (userDomElement) {
                    userList.removeChild(userDomElement);
                }
                
                delete userDomElements.userDomElement;
            }
        }
    };
}

function Backdrop() {
    const dom = div(
        {
            style: `position: absolute; display: none;
                    top: 0; bottom: 0; left: 0; right: 0;`
        },
        [
            div(
                {
                    style: `display: flex; height: 100%;
                            justify-content: center;
                            background-color: rgba(0, 0, 0, 0.3);`
                },
                [
                    div({ style: 'margin-top: 100px; color: white;' }, [
                        text('Connecting to server...')
                    ])
                ]
            )
        ]
    );

    return {
        dom,
        update: message => {
            if (message === 'show') {
                dom.style.display = 'block';
            } else if (message === 'hide') {
                dom.style.display = 'none';
            }
        }
    };
}

function Message({ userName, messageText }) {
    const messageTextDiv = div([]);

    messageTextDiv.innerHTML = messageText.replace(/\n/g, '<br>');

    return {
        dom: div(
            {
                style: `margin: 5px; padding: 5px;
                        background-color: #F1F1F1;
                        border-radius: 5px;`
            },
            [
                div({ style: 'font-weight: bold;' }, [
                    text(`@${userName}:`)
                ]),
                messageTextDiv
            ]
        )
    };
}

function Messages() {
    const messageList =
        div({ style: 'width: 100%; height: calc(100% - 75px); overflow-y: auto;' }, []);
        
    const messageInput = textarea({ style: 'flex: 1;' });

    const dom = div(
        {
            style: 'position: absolute; top: 0; bottom: 0; left: 300px; right: 0;'
        },
        [
            messageList,
            div(
                {
                    style: `display: flex; height: 70px;
                            padding: 5px; box-sizing: border-box;
                            width: 100%; border-top: 1px solid gray;`
                },
                [
                    messageInput,
                    div([
                        Button({
                            caption: 'Send',
                            onClick: () => {
                                const message = {
                                    messageType: NEW_MESSAGE,
                                    messageText: messageInput.value
                                };

                                sendMessage(message);
                                addMessage(message);
                                messageInput.value = '';
                            }
                        })
                    ])
                ])
        ]
    );

    function addMessage(message) {
        const messageComponent = Message({
            userName: message.userName,
            messageText: message.messageText
        });

        messageList.appendChild(messageComponent.dom);
        
        scrollBottom();
    }
    
    function scrollBottom() {
        messageList.scrollTop = messageList.scrollHeight;        
    }

    return {
        dom,
        update: message => {
            if (message.messageType === JOIN_REQUEST_ACCEPTED) {
                const messageElements =
                    message.messages.map(({ userName, messageText }) => Message({
                        userName,
                        messageText
                    }));

                messageList.innerHTML = '';
                const fragment = document.createDocumentFragment();

                for (let messageElement of messageElements) {
                    fragment.appendChild(messageElement.dom);
                }

                messageList.appendChild(fragment);
                
                scrollBottom();
            } else if (message.messageType === NEW_USER_JOINED_CHAT) {
                addMessage({
                    userName: message.userName,
                    messageText: `${message.userName} joined the chat.`
                });
            } else if (message.messageType === USER_LEFT_CHAT) {
                addMessage({
                    userName: message.userName,
                    messageText: `${message.userName} left the chat.`
                });
            } else if (message.messageType === NEW_MESSAGE) {
                addMessage(message);
            }
        }
    };
}

const CHAT_COMPONENT_ID = 'chat';

function Chat() {
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

/** Performs functions of router. */
function Root() {
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

const rootComponent = Root();

const hostElement = document.querySelector('#app-root');
hostElement.appendChild(rootComponent.dom);

listenServer(rootComponent.update);

listenServer(message => console.log(message));

connect();

// import server$ from './streams/server';

// server$.subscribe(message => {
//     console.log(message);
// });