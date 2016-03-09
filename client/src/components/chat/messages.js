import {
    JOIN_REQUEST_ACCEPTED,
    NEW_USER_JOINED_CHAT,
    USER_LEFT_CHAT
} from '../../server/server-message-types';
import { NEW_MESSAGE } from '../../server/client-message-types';
import { sendMessage } from '../../server/server';
import { div, span, text, textarea } from '../../infrastructure/dom-helpers';
import Button from '../common/button';

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

export default function Messages() {
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