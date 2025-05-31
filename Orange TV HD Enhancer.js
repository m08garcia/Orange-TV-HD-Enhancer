// ==UserScript==
// @name         Orange TV HD Enhancer
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Cambia automáticamente los streams de Orange TV de calidad SD a FHD
// @author       M08g
// @match        https://*.orangetv.orange.es/*
// @match        https://orangetv.orange.es/*
// @match        https://*.cdns.cdn.orangetv.orange.es/*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // Función para modificar URLs
    function enhanceUrl(url) {
        if (typeof url !== 'string') return url;

        let modified = false;
        let newUrl = url;

        // Patrón 1: dash_medium.mpd -> dash_high.mpd
        if (url.includes('dash_medium.mpd')) {
            newUrl = url.replace(/dash_medium\.mpd/g, 'dash_high.mpd');
            modified = true;
        }

        // Patrón 2: device=dash_medium -> device=dash_high
        if (url.includes('device=dash_medium')) {
            newUrl = url.replace(/device=dash_medium/g, 'device=dash_high');
            modified = true;
        }

        // Si se modificó la URL, mostrar el indicador
        if (modified) {
            setTimeout(showModificationIndicator, 100);
        }

        return newUrl;
    }

    // Método 1: Interceptar XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (url) {
            const newUrl = enhanceUrl(url);
            if (newUrl !== url) {
                arguments[1] = newUrl;
            }
        }
        return originalXHROpen.apply(this, arguments);
    };

    // Método 2: Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = function(resource) {
        if (resource) {
            if (typeof resource === 'string') {
                const newUrl = enhanceUrl(resource);
                if (newUrl !== resource) {
                    arguments[0] = newUrl;
                }
            } else if (resource instanceof Request) {
                const url = resource.url;
                const newUrl = enhanceUrl(url);
                if (newUrl !== url) {
                    arguments[0] = new Request(newUrl, resource);
                }
            }
        }
        return originalFetch.apply(this, arguments);
    };

    // Método 3: Monitorear cambios en elementos de video y source
    function processVideoElements() {
        // Buscar elementos video y source
        const mediaElements = document.querySelectorAll('video, source');
        mediaElements.forEach(element => {
            if (element.src) {
                const newSrc = enhanceUrl(element.src);
                if (newSrc !== element.src) {
                    element.src = newSrc;
                }
            }
        });

        // Buscar elementos con atributos data-src o similares
        const dataElements = document.querySelectorAll('[data-src], [data-url], [data-source]');
        dataElements.forEach(element => {
            ['data-src', 'data-url', 'data-source'].forEach(attr => {
                if (element.hasAttribute(attr)) {
                    const value = element.getAttribute(attr);
                    const newValue = enhanceUrl(value);
                    if (newValue !== value) {
                        element.setAttribute(attr, newValue);
                    }
                }
            });
        });
    }

    // Ejecutar periódicamente para capturar nuevos elementos
    setInterval(processVideoElements, 1000);

    // Contador de modificaciones y elemento indicador
    let modificationCount = 0;
    let indicatorElement = null;
    let indicatorTimeout = null;

    // Función para mostrar el indicador de modificación
    function showModificationIndicator() {
        modificationCount++;

        if (!indicatorElement) {
            indicatorElement = document.createElement('div');
            indicatorElement.style.cssText = `
                position: fixed;
                bottom: 10px;
                right: 10px;
                background-color: rgba(0, 0, 0, 0.5);
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 9999;
                pointer-events: none;
                opacity: 0.7;
                transition: opacity 0.5s;
            `;
            document.body.appendChild(indicatorElement);
        }

        indicatorElement.textContent = `HD Enhancer: ${modificationCount} URL(s) mejoradas`;
        indicatorElement.style.opacity = '0.7';

        // Limpiar el timeout anterior si existe
        if (indicatorTimeout) {
            clearTimeout(indicatorTimeout);
        }

        // Ocultar después de exactamente 3 segundos
        indicatorTimeout = setTimeout(() => {
            if (indicatorElement) {
                indicatorElement.style.opacity = '0';
                setTimeout(() => {
                    if (indicatorElement && indicatorElement.parentNode) {
                        indicatorElement.parentNode.removeChild(indicatorElement);
                        indicatorElement = null;
                    }
                }, 500);
            }
        }, 3000);
    }

    // Método 4: Interceptar atributos src cuando se modifican
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if ((name === 'src' || name.startsWith('data-')) && typeof value === 'string') {
            const newValue = enhanceUrl(value);
            if (newValue !== value) {
                return originalSetAttribute.call(this, name, newValue);
            }
        }
        return originalSetAttribute.apply(this, arguments);
    };

    // Método 5: Interceptar la propiedad src de elementos multimedia
    try {
        const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
        if (originalDescriptor && originalDescriptor.set) {
            Object.defineProperty(HTMLMediaElement.prototype, 'src', {
                set: function(url) {
                    return originalDescriptor.set.call(this, enhanceUrl(url));
                },
                get: originalDescriptor.get
            });
        }
    } catch (e) {
        // Silenciar errores
    }

    // Añadir botón para activar/desactivar el script
    function addToggleButton() {
        const button = document.createElement('button');
        button.textContent = 'HD Enhancer: ON';
        button.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background-color: rgba(0, 128, 0, 0.5);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 12px;
            z-index: 9999;
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.3s;
        `;

        let enabled = true;

        button.addEventListener('mouseenter', () => {
            button.style.opacity = '1';
        });

        button.addEventListener('mouseleave', () => {
            button.style.opacity = '0.3';
        });

        button.addEventListener('click', () => {
            enabled = !enabled;
            button.textContent = `HD Enhancer: ${enabled ? 'ON' : 'OFF'}`;
            button.style.backgroundColor = enabled ? 'rgba(0, 128, 0, 0.5)' : 'rgba(128, 0, 0, 0.5)';

            // Mostrar mensaje
            const message = document.createElement('div');
            message.textContent = `HD Enhancer ${enabled ? 'activado' : 'desactivado'}. Recarga la página para aplicar cambios.`;
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: rgba(0, 0, 0, 0.7);
                color: white;
                padding: 10px 20px;
                border-radius: 4px;
                font-size: 14px;
                z-index: 10000;
            `;
            document.body.appendChild(message);

            // Guardar preferencia
            localStorage.setItem('hdEnhancerEnabled', enabled.toString());

            // Eliminar mensaje después de 2 segundos
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 2000);
        });

        // Cargar preferencia guardada
        const savedPreference = localStorage.getItem('hdEnhancerEnabled');
        if (savedPreference !== null) {
            enabled = savedPreference === 'true';
            button.textContent = `HD Enhancer: ${enabled ? 'ON' : 'OFF'}`;
            button.style.backgroundColor = enabled ? 'rgba(0, 128, 0, 0.5)' : 'rgba(128, 0, 0, 0.5)';
        }

        document.body.appendChild(button);
    }

    // Añadir el botón cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addToggleButton);
    } else {
        addToggleButton();
    }
})();