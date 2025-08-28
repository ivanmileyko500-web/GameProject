export default class InteractiveAreaCreationTools {
    static createInteractiveContainer(HTMLType = 'div') {
        const container = document.createElement(HTMLType);
        container.dataset.interactiveAreaElement = true;
        return container;
    }

    static createInteractiveArea(area, hoverable = true, clickable = true) {
        if (!hoverable && !clickable) {
            throw new Error('InteractiveAreaCreationTools: At least one of hoverable or clickable must be true.');
        }

        const interactiveElements = area.querySelectorAll('[data-interactive-area-element]');
        const interactiveArea = {
            //Константы
            webElement: area,
            interactiveElements: interactiveElements,

            //Переменные
            clientMouseX: 0,
            clientMouseY: 0,
            focusedElement: undefined,
            lastFocusedElement: undefined,
            focusedInteractiveElement: undefined,
            lastFocusedInteractiveElement: undefined,

            //Коллбэки для переопределения
            focusCallback: (element) => {},
            unfocusCallback: (element) => {},
            clickCallback: (element) => {},

            //Методы
            render(container) {container.appendChild(this.webElement);},
            remove() {this.webElement.remove();}
        }

        if (hoverable) {

            interactiveArea.webElement.addEventListener('mousemove', (event) => {
                interactiveArea.clientMouseX = event.clientX;
                interactiveArea.clientMouseY = event.clientY;
                if (!interactiveArea.focusedElement) {
                    interactiveArea.focusedElement = event.target;
                    const interactiveElement = event.target.closest('[data-interactive-area-element]');
                    if (interactiveElement) {
                        interactiveArea.focusedInteractiveElement = interactiveElement;
                        interactiveArea.focusCallback(interactiveElement);
                    }
                } else if (interactiveArea.focusedElement !== event.target) {
                    interactiveArea.lastFocusedElement = interactiveArea.focusedElement;
                    interactiveArea.focusedElement = event.target;
                    const interactiveElement = event.target.closest('[data-interactive-area-element]');
                    if (interactiveElement !== interactiveArea.focusedInteractiveElement) {
                        interactiveArea.lastFocusedInteractiveElement = interactiveArea.focusedInteractiveElement;
                        interactiveArea.focusedInteractiveElement = interactiveElement;
                        if (interactiveElement) {
                            interactiveArea.focusCallback(interactiveElement);
                        }
                        if (interactiveArea.lastFocusedInteractiveElement) {
                            interactiveArea.unfocusCallback(interactiveArea.lastFocusedInteractiveElement);
                        }
                    }
                }
            });

            interactiveArea.webElement.addEventListener('mouseleave', () => {
                if (interactiveArea.focusedInteractiveElement) {
                    interactiveArea.unfocusCallback(interactiveArea.focusedInteractiveElement);
                }
                interactiveArea.lastFocusedElement = undefined;
                interactiveArea.focusedElement = undefined;
                interactiveArea.lastFocusedInteractiveElement = undefined;
                interactiveArea.focusedInteractiveElement = undefined;
            });

        } else {
            delete interactiveArea.focusCallback;
            delete interactiveArea.unfocusCallback;
            delete interactiveArea.focusedElement;
            delete interactiveArea.lastFocusedElement;
            delete interactiveArea.focusedInteractiveElement;
            delete interactiveArea.lastFocusedInteractiveElement;
        }

        if (clickable) {
            interactiveArea.webElement.addEventListener('click', (event) => {
                const interactiveElement = event.target.closest('[data-interactive-area-element]');
                if (interactiveElement) {
                    interactiveArea.clickCallback(interactiveElement);
                }
            });
        } else {
            delete interactiveArea.clickCallback;
        }

        return interactiveArea;
    }
}