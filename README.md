# Orange TV HD Enhancer
Script de Tampermonkey que cambia automáticamente la calidad de reproducción de Orange TV de SD a FHD

## Instalación
### 1º Descargar [Orange TV HD Enhancer.js](https://raw.githubusercontent.com/m08garcia/Orange-TV-HD-Enhancer/refs/heads/main/Orange%20TV%20HD%20Enhancer.js) desde este repositorio
### 2º Instalar Tampermonkey
- [Chrome](https://chromewebstore.google.com/detail/dhdgffkkebhmkfjojejmpbldmpobfkfo?utm_source=item-share-cb)
- [Firefox](https://addons.mozilla.org/es-ES/firefox/addon/tampermonkey/)
### 2º Instalar script
- Abrir menú de tampermonkey, click en Agregar nuevo script, arrastrar el archivo .js descargado y click en Instalar

## USO
- Al abrir Orange TV encontrará un botón en la parte inferior izquierda para activar o desactivar el script, si no está activado (Rojo) pulselo y recarge la página y ya cuando reproduzca un canal se debería ver en Full HD
- En la parte inferior derecha saldrá un mensaje con las urls de los streams que se han mejorado para reproducirse en FHD.
- El botón de ON/OFF estará presente hasta que entre en modo de pantalla completa, donde se ocultará para no entorpecer la visión.

## Funcionamiento
Por si alguien tiene curiosidad de como funciona, el script solo intercepta las URLs de los MPDs y las cambia de dash_medium.mpd (Resolución SD) a dash_high.mpd (Resolución FHD). No modifica nada con el DRM ya que las keys de desencriptación del widevine son las mismas en el Medium y en el High.

### Probado en Brave (Chrome) y en Firefox
