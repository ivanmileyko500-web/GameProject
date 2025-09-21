export default function genWebElementGenerator({
    size = 16,
    content = undefined,
    color = undefined
} = {}) {
    function getRandomColor(seed) {
        let hash = 0;
        if (seed.length === 0) return '#000000';

        for (let i = 0; i < seed.length; i++) {
            const char = seed.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        const r = (hash & 0xFF0000) >> 16;
        const g = (hash & 0x00FF00) >> 8;
        const b = hash & 0x0000FF;

        const rFinal = ((r * 17) + (g * 23) + (b * 19)) % 256;
        const gFinal = ((r * 13) + (g * 29) + (b * 11)) % 256;
        const bFinal = ((r * 31) + (g * 7) + (b * 37)) % 256;

        return '#' + 
            rFinal.toString(16).padStart(2, '0') + 
            gFinal.toString(16).padStart(2, '0') + 
            bFinal.toString(16).padStart(2, '0');
    }

    function getContrastColor(hexColor) {
        let hex = hexColor.replace('#', '');

        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    function getRandomLetterPair() {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        const randomIndex1 = Math.floor(Math.random() * 26);
        const randomIndex2 = Math.floor(Math.random() * 26);
        return letters[randomIndex1].toUpperCase() + letters[randomIndex2];
    }
    
    const elementContent = content || getRandomLetterPair();
    const elementBackgroudColor = color || getRandomColor(elementContent);
    const elementTextColor = getContrastColor(elementBackgroudColor);
    
    const element = document.createElement('div');
    element.style.width = size + 'px';
    element.style.height = size + 'px';
    element.style.display = 'flex';
    element.style.justifyContent = 'center';
    element.style.alignItems = 'center';
    element.style.fontSize = 'xx-small';
    element.style.backgroundColor = elementBackgroudColor;
    element.style.color = elementTextColor;
    element.textContent = elementContent;
    return element;
}