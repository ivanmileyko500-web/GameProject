export default class DragManager {
    static instance = null;
    static maxZIndex = 100;

    static setMaxZIndex(maxZIndex) {
        this.maxZIndex = maxZIndex;
    }

    static getInstance() {
        if (!DragManager.instance) {
            DragManager.instance = new DragManager();
        }
        return DragManager.instance;
    }

    constructor() {
        this.draggedElement = null;
        this.draggedElementOriginalParent = null;
        this.pageX = 0;
        this.pageY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        this.handleMouseMove = this.handleMouseMove.bind(this);

        this.init();
    }

    init() {
        document.addEventListener('mousemove', this.handleMouseMove);
    }

    handleMouseMove(event) {
        this.pageX = event.pageX;
        this.pageY = event.pageY;

        if (this.draggedElement) {
            this.draggedElement.style.left = this.pageX + this.dragOffsetX + 'px';
            this.draggedElement.style.top = this.pageY + this.dragOffsetY + 'px';
        }
    }

    startDrag(element, dragOffsetX = 0, dragOffsetY = 0) {
        this.draggedElement = element;
        this.draggedElementOriginalParent = element.parentElement;
        document.body.appendChild(this.draggedElement);

        this.dragOffsetX = dragOffsetX;
        this.dragOffsetY = dragOffsetY;

        this.draggedElement.style.pointerEvents = 'none';
        this.draggedElement.style.position = 'absolute';
        this.draggedElement.style.zIndex = DragManager.maxZIndex;
        this.draggedElement.style.left = this.pageX + this.dragOffsetX + 'px';
        this.draggedElement.style.top = this.pageY + this.dragOffsetY + 'px';
    }

    cancelDrag() {
        this.endDrag(this.draggedElementOriginalParent);
    }

    endDrag(newParent) {
        if (newParent) {
            this.draggedElement.style.removeProperty('position');
            this.draggedElement.style.removeProperty('z-index');
            this.draggedElement.style.removeProperty('left');
            this.draggedElement.style.removeProperty('top');
            newParent.appendChild(this.draggedElement);
        }     
        this.draggedElement.style.removeProperty('pointer-events');    
        this.draggedElement = null;
        this.draggedElementOriginalParent = null;
    }
}