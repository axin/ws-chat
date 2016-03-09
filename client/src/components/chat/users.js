import {
    JOIN_REQUEST_ACCEPTED,
    NEW_USER_JOINED_CHAT,
    USER_LEFT_CHAT
} from '../../server/server-message-types';
import { div, text } from '../../infrastructure/dom-helpers';

const userDomElements = {};

function User({ name }) {
    return {
        dom: div({ style: 'padding: 5px;' }, [
            text(name)
        ])
    };
}

export default function Users() {
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