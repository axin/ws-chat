import { button, text } from '../../infrastructure/dom-helpers';

export default function Button({ caption, onClick }) {
    const btn = button([ text(caption) ]);
    
    if (typeof (onClick) === 'function') {
        btn.addEventListener('click', onClick);
    }
    
    return {
        dom: btn
    };
}
