export default class MouseleaveTracker { //Кастомный трекер на mouseleave, работает стабильнее чем стандартный
    //Переменные (Активные трекеры)
    static activeTrackers = {};
    static mouseenterHandlers = new WeakMap();

    //Переменные (Состояние мыши)
    static mouseX = 0;
    static mouseY = 0;
    static isMouseMoving = false;

    //Константы
    static boundMouseMove = this.handleMouseMove.bind(this);
    static defaultTrackableElementCheckInterval = 150;

    static startTracking(trackableElement, callback, trackableElementCheckInterval = MouseleaveTracker.defaultTrackableElementCheckInterval) {
        const addTracker = () => {
            if (!trackableElement.dataset.mouseTrackerId) {
                MouseleaveTracker.newTracker(trackableElement, callback, trackableElementCheckInterval)
            }
        }
        trackableElement.addEventListener('mouseenter', addTracker);
        MouseleaveTracker.mouseenterHandlers.set(trackableElement, addTracker);
    }

    static stopTracking(trackableElement) {
        const addTracker = MouseleaveTracker.mouseenterHandlers.get(trackableElement);
        if (addTracker) {
            trackableElement.removeEventListener('mouseenter', addTracker);
            MouseleaveTracker.mouseenterHandlers.delete(trackableElement);
        }
    }

    static newTracker(trackableElement, callback, trackableElementCheckInterval = MouseleaveTracker.defaultTrackableElementCheckInterval) {
        const id = crypto.randomUUID();
        const tracker = new MouseleaveTracker(trackableElement, callback, id, trackableElementCheckInterval);
        MouseleaveTracker.activeTrackers[id] = tracker;
        if (Object.keys(MouseleaveTracker.activeTrackers).length === 1) {
            document.addEventListener('mousemove', MouseleaveTracker.boundMouseMove);   
        }
    }

    static handleMouseMove(e) {
        this.isMouseMoving = true;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
    }

    constructor(trackableElement, callback, id, trackableElementCheckInterval) {
        this.trackableElement = trackableElement;
        this.callback = callback;
        this.trackableElementCheckIntervalId = null;
        this.init(id, trackableElementCheckInterval);
    }

    init(id, trackableElementCheckInterval) {
        this.trackableElement.dataset.mouseTrackerId = id

        this.trackableElementCheckIntervalId = setInterval(() => {
            if (MouseleaveTracker.isMouseMoving) {
                MouseleaveTracker.isMouseMoving = false;
                const elementUnderCursor = document.elementFromPoint(MouseleaveTracker.mouseX, MouseleaveTracker.mouseY);
                if (!elementUnderCursor.closest(`[data-mouse-tracker-id="${id}"]`)) {
                    this.removeTracker();
                }
            }
        }, trackableElementCheckInterval);
    }
    
    removeTracker() {
        const id = this.trackableElement.dataset.mouseTrackerId;
        this.trackableElement.removeAttribute('data-mouse-tracker-id');
        clearInterval(this.trackableElementCheckIntervalId);
        delete MouseleaveTracker.activeTrackers[id];
        if (Object.keys(MouseleaveTracker.activeTrackers).length === 0) {
            document.removeEventListener('mousemove', MouseleaveTracker.boundMouseMove);
        }
        this.callback();
    }
}