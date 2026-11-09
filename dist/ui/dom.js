export function element(tag, className = '', text = '') {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
}
export function field(label, control) {
    const wrapper = element('label', 'field');
    wrapper.append(element('span', 'field-label', label), control);
    return wrapper;
}
export function formatTime(milliseconds) {
    const tenths = Math.floor(Math.max(0, milliseconds) / 100);
    const minutes = Math.floor(tenths / 600)
        .toString()
        .padStart(2, '0');
    const seconds = (Math.floor(tenths / 10) % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}.${tenths % 10}`;
}
export const BASE_LABELS = {
    2: 'BIN',
    8: 'OCT',
    10: 'DEC',
    16: 'HEX',
};
