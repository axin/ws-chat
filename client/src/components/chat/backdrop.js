import { div, text } from '../../infrastructure/dom-helpers';

export default function Backdrop() {
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