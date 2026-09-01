# memotest-aves
Memotest: Aves de Argentina
Este es un juego de memoria, donde se deben encontrar las cartas coincidentes para sumar puntos. https://juaco58.github.io/memotest-fauna/ Se puede activar con un código "disponible" dado por administrador, al que se le puede asignar costo de licenciamiento. Dicho código está en la Googlesheet de Proyecto palomas "Control de Memotest". Se puede cancelar el licenciamiento por incumplimiento de pago, cambando el estado del código de "usado", a "bloqueado" o "vencido".

🐾 Memotest de Fauna - Juego de Memoria e Identificación
Un juego de memoria dinámico y robusto centrado en la fauna, desarrollado con JavaScript Vanilla y potenciado con Inteligencia Artificial para la generación de imágenes en alta resolución. El proyecto implementa mecánicas avanzadas de mezcla de datos, optimización de rendimiento web en segundo plano y un sistema de control de accesos remoto mediante servicios en la nube. 

✨ Características Principales
👥 Modos de Juego Flexibles: Soporte completo para partidas en solitario (con contador de tiempo y registro de intentos) o multijugador local por turnos para dos jugadores en la misma pantalla.
🧠 Algoritmo de Mezcla Equitativo: Implementación estricta del método de mezcla Fisher-Yates para garantizar que los 20 animales seleccionados de la base de datos (y la distribución final de las 40 cartas en el tablero) sean 100% aleatorios y libres de sesgos lógicos.
🖼️ Experiencia Visual Fluida (Anti-Lag): Sistema automatizado de precarga (preloading) inteligente de imágenes en segundo plano. Las imágenes generadas por IA de alta resolución (1024x1024) se almacenan en la caché del navegador antes de iniciar el tablero, logrando que las animaciones de escalado, volteo y zoom al acertar se ejecuten a los máximos FPS del dispositivo sin parpadeos.
🔐 Control de Licencias Remoto: Validación dinámica de códigos de acceso al inicio de la aplicación interactuando mediante JSONP con una Web App en Google Apps Script / Sheets.
🛠️ Resiliencia y Alta Disponibilidad: Incorporación de un mecanismo de contingencia por timeout (Salvavidas local) que desbloquea automáticamente la pantalla de inicio si el servidor remoto de Google experimenta latencia o devuelve errores de red (como estados 404).
🔄 Re-vinculación Inteligente (Anti-Pérdida de Datos): La lógica del servidor detecta si un usuario legítimo eliminó sus datos de navegación recientes, permitiendo la reactivación automática de la clave y re-vinculando su nuevo identificador de hardware en la base de datos sin generar bloqueos.
📱 Soporte PWA (Progressive Web App): Incluye configuración de Service Worker dinámico para el almacenamiento en caché de activos físicos, garantizando cargas inmediatas y un funcionamiento óptimo en dispositivos móviles.
🛠️ Tecnologías Utilizadas
Frontend: HTML5, CSS3 Avanzado (Flexbox, Grid, Animaciones de Transformación), JavaScript Moderno (ES6+).
Backend & Base de Datos: Google Apps Script (JavaScript de servidor) conectado a Google Sheets como persistencia de licencias.
Multimedia & Arte: Imágenes optimizadas de alta definición generadas mediante Inteligencia Artificial y procesadas con compresión inteligente sin pérdida perceptual.
Despliegue: GitHub Pages y GitHub Actions.
📝 Estructura de Código Destacada
Algoritmo Fisher-Yates con Precarga Integrada idéntico a Memotest Fauna Argentina
