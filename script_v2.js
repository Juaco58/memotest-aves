// 💥 DESTRUCTOR DE SERVICE WORKER: Borra la memoria vieja a la fuerza
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}

const baseDeAnimales = [
    { nombre: "Aguila Coronada", img: "imagenes/aguila.jpg" },{ nombre: "Benteveo", img: "imagenes/benteveo.jpg" }, { nombre: "Biguá", img: "imagenes/bigua.jpg" },
    { nombre: "Calandria Grande", img: "imagenes/calandria_grande.jpg" }, { nombre: "Carancho", img: "imagenes/carancho.jpg" }, { nombre: "Cardenal Amarillo", img: "imagenes/cardenal_amarillo.jpg" }, 
    { nombre: "Carpintero Campestre", img: "imagenes/carpintero_campestre.jpg" }, { nombre: "Carpintero Real", img: "imagenes/carpintero_real.jpg" }, { nombre: "Chajá", img: "imagenes/chaja.jpg"}, 
    { nombre: "Chimango", img: "imagenes/chimango.jpg" }, { nombre: "Cóndor Andino", img: "imagenes/condor.jpg" }, { nombre: "Cotorra", img: "imagenes/cotorra.jpg" },
    { nombre: "Flamenco Austral", img: "imagenes/flamenco.jpg" }, { nombre: "Guacamayo Azul", img: "imagenes/guacamayo_azul.jpg" },
    { nombre: "Guacamayo Verde", img: "imagenes/guacamayo_verde.jpg" }, { nombre: "Hornero", img: "imagenes/hornero.jpg" }, { nombre: "Inambú Serrano", img: "imagenes/inambu_serrano.jpg" },
    { nombre: "Jote Cabeza Negra", img: "imagenes/jote_cabeza_negra.jpg" }, { nombre: "Lechuza de Viscacheras", img: "imagenes/lechuza_de_vizcacheras.jpg" }, 
    { nombre: "Loro Barranquero", img: "imagenes/loro_barranquero.jpg" }, { nombre: "Macá Tobiano", img: "imagenes/maca_tobiano.jpg" },{ nombre: "Monjita Blanca", img: "imagenes/monjita_blanca.jpg" },
    { nombre: "Sietecolores", img: "imagenes/naranjero_sietecolores.jpg" }, { nombre: "Ñandú", img: "imagenes/ñandu.jpg" }, { nombre: "Paloma torcaza", img: "imagenes/paloma_torcaza.jpg" }, 
    { nombre: "Picaflor Cometa", img: "imagenes/picaflor_cometa.jpg" }, { nombre: "Pingüino de Magallanes", img: "imagenes/pinguino.jpg" }, { nombre: "Tero", img: "imagenes/tero.jpg" },
    { nombre: "Tijereta", img: "imagenes/tijereta.jpg" },{ nombre: "Tucán", img: "imagenes/tucan.jpg" }, { nombre: "Zorzal Patagónico", img: "imagenes/zorzal_patagonico.jpg" }
];

let juegoTerminado = false;

let cartasData = [], cartasVolteadas = [], bloqueado = false, modoJuego = 2, jugadorActivo = 1;
let scoreJ1 = 0, scoreJ2 = 0, contadorIntentos = 0, tiempoSegundos = 0, intervaloTiempo = null, imagenesPrecargadas = [];

const tablero = document.getElementById('tablero');
const zoomOverlay = document.getElementById('zoomOverlay');
const zoomImg = document.getElementById('zoomImg');
const zoomTexto = document.getElementById('zoomTexto');
const sndVoltear = new Audio('sonidos/voltear.mp3');
const sndAcierto = new Audio('sonidos/acierto.mp3');

function arrancarJuegoNuevo() {
    // 1. Ocultamos el menú de opciones para ver el tablero directo
    const pantallaModo = document.getElementById('pantalla-modo');
    if (pantallaModo) pantallaModo.style.display = 'none';

    // 2. Generamos el mazo y dibujamos las cartas en el tablero
    prepararMazoDePartida();
    iniciarTablero();

    // 3. Forzamos al sistema a entrar en el modo visualizador final
    juegoTerminado = true; 
}


function iniciarConfiguracionModo(modo) {
    modoJuego = modo;
    const pantallaModo = document.getElementById('pantalla-modo');
    if (pantallaModo) pantallaModo.style.display = 'none';
    
    scoreJ1 = 0; scoreJ2 = 0; jugadorActivo = 1; contadorIntentos = 0; tiempoSegundos = 0; bloqueado = false; cartasVolteadas = [];

    const p1 = document.getElementById('puntos-j1'), p2 = document.getElementById('puntos-j2');
    const ct = document.getElementById('cont-tiempo'), ci = document.getElementById('cont-intentos');
    const ti = document.getElementById('txt-intentos'), tt = document.getElementById('txt-tiempo');

    if (modoJuego === 1) {
        if(p1) p1.style.display = 'none'; if(p2) p2.style.display = 'none';
        if(ct) ct.style.display = 'block'; if(ci) ci.style.display = 'block';
        if(ti) ti.textContent = "0"; if(tt) tt.textContent = "00:00";

        clearInterval(intervaloTiempo);
        intervaloTiempo = setInterval(() => {
            tiempoSegundos++;
            let mins = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
            let segs = String(tiempoSegundos % 60).padStart(2, '0');
            if(tt) tt.textContent = `${mins}:${segs}`;
        }, 1000);
    } else {
        if(p1) p1.style.display = 'block'; if(p2) p2.style.display = 'block';
        if(ct) ct.style.display = 'none'; if(ci) ci.style.display = 'none';
        clearInterval(intervaloTiempo);
    }
    prepararMazoDePartida();
    iniciarTablero();
}

function prepararMazoDePartida() {
    const baseMezclada = [...baseDeAnimales];
    for (let i = baseMezclada.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [baseMezclada[i], baseMezclada[j]] = [baseMezclada[j], baseMezclada[i]];
    }
    const animalesSeleccionados = baseMezclada.slice(0, 20);
    imagenesPrecargadas = [];
    animalesSeleccionados.forEach((animal) => {
        if (animal && animal.img) {
            const img = new Image(); img.src = animal.img; imagenesPrecargadas.push(img);
        }
    });
    cartasData = [...animalesSeleccionados, ...animalesSeleccionados];
    for (let i = cartasData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cartasData[i], cartasData[j]] = [cartasData[j], cartasData[i]];
    }
    return cartasData;
}

function iniciarTablero() {
    if (!tablero) return;
    tablero.innerHTML = "";
    actualizarMarcador(); 
    cartasData.forEach((animal, index) => {
        const carta = document.createElement('div');
        carta.classList.add('carta'); carta.dataset.nombre = animal.nombre; carta.dataset.index = index;
        carta.innerHTML = `
            <div class="cara reverso">?</div>
            <div class="cara frente">
                <img src="${animal.img}" alt="${animal.nombre}">
                <span>${animal.nombre}</span>
            </div>
        `;
        carta.addEventListener('click', voltearCarta);
        tablero.appendChild(carta);
    });
}

function voltearCarta() {
    // 🌟 1. Si el juego terminó, abrimos tu zoom real y frenamos el juego
    if (typeof juegoTerminado !== 'undefined' && juegoTerminado) {
        if (zoomImg && zoomTexto && zoomOverlay) {
            zoomImg.src = this.querySelector('img').src; 
            zoomTexto.textContent = this.dataset.nombre;
            zoomOverlay.className = 'zoom-overlay activo mirando-carta';
            
            zoomOverlay.onclick = function() {
                zoomOverlay.classList.remove('activo', 'mirando-carta');
            };
        }
        return; 
    }

    // 🔒 2. Filtros normales de tu partida (Tu código original corregido sin IDs falsos)
    if (bloqueado || this.classList.contains('volteada') || this.classList.contains('acertada') || cartasVolteadas.length >= 2) return;
    
    sndVoltear.currentTime = 0;
    sndVoltear.play().catch(err => console.log(err));
    this.classList.add('volteada'); cartasVolteadas.push(this); this.classList.add('ampliada-temporal');
    const cartaParaAchicar = this;
    setTimeout(() => { cartaParaAchicar.classList.remove('ampliada-temporal'); }, 2000);

    if (window.innerWidth <= 767 || window.innerHeight <= 480 || window.matchMedia("(orientation: landscape)").matches) {
        ejecutarZoom(this.dataset.nombre, this.querySelector('img').src, 'mirando-carta', 1800);
    }
    if (cartasVolteadas.length === 2) { bloqueado = true; verificarCoincidencia(); }
}

function verificarFinJuego() {
    // Sumamos los puntos reales de tus variables globales
    const totalParejasEncontradas = scoreJ1 + scoreJ2;
    
    // 💡 SEGUIMOS CON EL 1 PARA LA PRUEBA RÁPIDA (Al final lo cambiamos a 20)
    if (totalParejasEncontradas === 1) { 
        
        juegoTerminado = true; 
        clearInterval(intervaloTiempo); 
        
        // Activamos los clics de zoom en todo el tablero usando tus variables nativas
        if (zoomImg && zoomTexto && zoomOverlay) {
            document.querySelectorAll('.carta').forEach(carta => {
                carta.onclick = function() {
                    zoomImg.src = this.querySelector('img').src; 
                    zoomTexto.textContent = this.dataset.nombre;
                    zoomOverlay.className = 'zoom-overlay activo mirando-carta';
                    zoomOverlay.onclick = function() {
                        zoomOverlay.classList.remove('activo', 'mirando-carta');
                    };
                };
            });
        }
        
        // Cartel de felicitaciones corregido
        setTimeout(() => {
            if (modoJuego === 1) {
                let mins = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
                let segs = String(tiempoSegundos % 60).padStart(2, '0');
                alert(`¡Felicitaciones! Completaste el juego solo.\nTiempo final: ${mins}:${segs}\nIntentos totales: ${contadorIntentos}`);
            } else {
                let mensaje = scoreJ1 > scoreJ2 ? "¡Ganó el Jugador 1!" : (scoreJ2 > scoreJ1 ? "¡Ganó el Jugador 2!" : "¡Es un empate!");
                alert(`Fin del juego.\n${mensaje}\nMarcador final: ${scoreJ1} a ${scoreJ2}`);
            }
        }, 100);
    }
}


function verificarCoincidencia() {
    const [carta1, carta2] = cartasVolteadas;
    if (carta1.dataset.nombre === carta2.dataset.nombre) {
        sndAcierto.currentTime = 0; sndAcierto.play().catch(err => console.log(err));
        setTimeout(() => {
            if (window.innerWidth <= 767 || window.innerHeight <= 480 || window.matchMedia("(orientation: landscape)").matches) {
                ejecutarZoom(carta1.dataset.nombre, carta1.querySelector('img').src, 'acierto-pareja', 3000);
            }
        }, 500);
        
        // 🌟 ACÁ ESTÁ EL CAMBIO CLAVE: 
        // Esperamos los 3.5 segundos de la animación, les ponemos la clase, Y RECIÉN AHÍ contamos los aciertos
        setTimeout(() => {
            carta1.classList.add('acertada'); carta2.classList.add('acertada');
            if (modoJuego === 2) {
                if (jugadorActivo === 1) { scoreJ1++; } else { scoreJ2++; }
            } else {
                scoreJ1++; contadorIntentos++;
                const ti = document.getElementById('txt-intentos'); if(ti) ti.textContent = contadorIntentos;
            }
            actualizarMarcador(); 
            cartasVolteadas = []; 
            bloqueado = false; 
            
            // 👈 Movimos esto acá adentro para que corra DESPUÉS de que las cartas tengan la clase '.acertada'
            verificarFinJuego(); 
        }, 3500); 
    } else {
        setTimeout(() => {
            carta1.classList.remove('volteada'); carta2.classList.remove('volteada');
            if (modoJuego === 2) { jugadorActivo = (jugadorActivo === 1) ? 2 : 1; }
            else { contadorIntentos++; const ti = document.getElementById('txt-intentos'); if(ti) ti.textContent = contadorIntentos; }
            actualizarMarcador(); cartasVolteadas = []; bloqueado = false;
        }, 3000); 
    }
}

function ejecutarZoom(nombre, imgSrc, tipoZoom, tiempoMs) {
    if (!zoomImg || !zoomTexto || !zoomOverlay) return;
    zoomImg.src = imgSrc; zoomTexto.textContent = nombre;
    
    const zoomCard = zoomOverlay.querySelector('.zoom-card');
    if (window.innerWidth > window.innerHeight) {
        if (zoomCard) {
            if (tipoZoom === 'acierto-pareja') {
                zoomCard.style.setProperty("border", "4px solid #ffeb3b", "important");
                zoomCard.style.setProperty("box-shadow", "0 0 30px rgba(255, 235, 59, 0.9)", "important");
            } else {
                zoomCard.style.setProperty("border", "4px solid transparent", "important");
                zoomCard.style.setProperty("box-shadow", "0 15px 40px rgba(0,0,0,0.5)", "important");
            }
        }
        } else {
        if (zoomCard) { zoomCard.style.border = ""; zoomCard.style.boxShadow = ""; }
    }

    zoomOverlay.className = 'zoom-overlay'; zoomOverlay.classList.add('activo', tipoZoom);
    setTimeout(() => { zoomOverlay.classList.remove('activo', tipoZoom); }, tiempoMs);
}

function actualizarMarcador() {
    const s1 = document.getElementById('score1'), s2 = document.getElementById('score2');
    if(s1) s1.textContent = scoreJ1; if(s2) s2.textContent = scoreJ2;
    
    const contenedorMarcador = document.querySelector('.marcador');
    const divJ1 = document.getElementById('puntos-j1'), divJ2 = document.getElementById('puntos-j2');

    if (modoJuego === 2 && contenedorMarcador && divJ1 && divJ2) {
        if (jugadorActivo === 1) {
            contenedorMarcador.className = 'marcador turno-j1'; divJ1.classList.add('activo-j1'); divJ2.classList.remove('activo-j2');
        } else {
            contenedorMarcador.className = 'marcador turno-j2'; divJ2.classList.add('activo-j2'); divJ1.classList.remove('activo-j1');
        }
    }
}

function verificarFinJuego() {
    // 📊 Nueva forma: Sumamos los puntos de los jugadores (da el total de parejas)
    const totalParejasEncontradas = scoreJ1 + scoreJ2;
    
    // 💡 PARA LA PRUEBA USAMOS EL 1 (equivale a encontrar la primer pareja)
    // Cuando ande y quieras jugar en serio, este 1 lo vas a cambiar por un 20.
    if (totalParejasEncontradas === 1) { 
        
        juegoTerminado = true; 
        clearInterval(intervaloTiempo); 
        
        // 🌟 ACTIVAMOS EL ZOOM EN CADA CARTA
        if (zoomImg && zoomTexto && zoomOverlay) {
            document.querySelectorAll('.carta').forEach(carta => {
                carta.onclick = function() {
                    zoomImg.src = this.querySelector('img').src; 
                    zoomTexto.textContent = this.dataset.nombre;
                    zoomOverlay.className = 'zoom-overlay activo mirando-carta';
                    zoomOverlay.onclick = function() {
                        zoomOverlay.classList.remove('activo', 'mirando-carta');
                    };
                };
            });
        }
        
        // El cartel de felicitaciones sale un milisegundo después
        setTimeout(() => {
            if (modoJuego === 1) {
                let mins = String(Math.floor(tiempoSegundos / 60)).padStart(2, '0');
                let segs = String(tiempoSegundos % 60).padStart(2, '0');
                alert(`¡Felicitaciones! Completaste el juego solo.\nTiempo final: ${mins}:${segs}\nIntentos totales: ${contadorIntentos}`);
            } else {
                let mensaje = scoreJ1 > scoreJ2 ? "¡Ganó el Jugador 1!" : (scoreJ2 > scoreJ1 ? "¡Ganó el Jugador 2!" : "¡Es un empate!");
                alert(`Fin del juego.\n${mensaje}\nMarcador final: ${scoreJ1} a ${scoreJ2}`);
            }
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    arrancarJuegoNuevo();
    const btn1 = document.getElementById('btn-1jugador'), btn2 = document.getElementById('btn-2jugadores');
    if (btn1) btn1.addEventListener('click', () => iniciarConfiguracionModo(1));
    if (btn2) btn2.addEventListener('click', () => iniciarConfiguracionModo(2));

    const btnReiniciar = document.getElementById('btn-reiniciar');
if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
        if (confirm("¿Estás seguro de que querés abandonar y reiniciar el juego?")) {
            
            // 🌟 ACÁ LO INSERTASTE PERFECTO: Reseteamos para la nueva partida
            juegoTerminado = false; 
            
            clearInterval(intervaloTiempo);
            const pantallaModo = document.getElementById('pantalla-modo');
            if (pantallaModo) pantallaModo.style.display = 'flex';
            if (tablero) tablero.innerHTML = "";
        }
    });
}

});
// 🛠️ ATAJO DE TECLADO PARA PROBAR AL INSTANTE
window.addEventListener('keydown', function(e) {
    if (e.key.toLowerCase() === 'g') {
        console.log("¡Atajo activado! Forzando modo visualizador...");
        
        // Desactivamos el clic original del juego para que no tape nada
        juegoTerminado = true;
        if (typeof intervaloTiempo !== 'undefined') clearInterval(intervaloTiempo);

        // Activamos el escuchador de clics para el zoom
        document.body.addEventListener('click', function(evento) {
            // Buscamos si tocó una carta
            const cartaTarget = evento.target.closest('.carta');
            if (!cartaTarget) return;

            // Buscamos la imagen adentro
            const imgOriginal = cartaTarget.querySelector('img');
            if (!imgOriginal) return;

            const rutaLimpia = imgOriginal.getAttribute('src');
            const animalEncontrado = baseDeAnimales.find(a => rutaLimpia.includes(a.img));
            const nombreAnimal = animalEncontrado ? animalEncontrado.nombre : "Animal";

            // Creamos el Modal
            const modal = document.createElement('div');
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(0,0,0,0.9)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '99999';

            const contenedor = document.createElement('div');
            contenedor.style.position = 'relative';
            contenedor.style.display = 'flex';
            contenedor.style.flexDirection = 'column';
            contenedor.style.alignItems = 'center';
            contenedor.style.backgroundColor = '#1e272e';
            contenedor.style.padding = '25px';
            contenedor.style.borderRadius = '15px';
            contenedor.style.border = '2px solid #3498db';

            const imgGrande = imgOriginal.cloneNode(true);
            imgGrande.style.maxWidth = '80vw';
            imgGrande.style.maxHeight = '70vh';
            imgGrande.style.borderRadius = '8px';

            const textoNombre = document.createElement('h2');
            textoNombre.innerText = nombreAnimal;
            textoNombre.style.color = '#ffffff';
            textoNombre.style.marginTop = '15px';
            textoNombre.style.fontFamily = 'Arial, sans-serif';

            const botonCerrar = document.createElement('span');
            botonCerrar.innerHTML = '&times;';
            botonCerrar.style.position = 'absolute';
            botonCerrar.style.top = '5px';
            botonCerrar.style.right = '15px';
            botonCerrar.style.color = '#ffffff';
            botonCerrar.style.fontSize = '40px';
            botonCerrar.style.cursor = 'pointer';

            botonCerrar.onclick = function() { modal.remove(); };
            modal.onclick = function(ev) { if(ev.target === modal) modal.remove(); };

            contenedor.appendChild(botonCerrar);
            contenedor.appendChild(imgGrande);
            contenedor.appendChild(textoNombre);
            modal.appendChild(contenedor);
            document.body.appendChild(modal);
        });

        alert("Modo visualizador activado. ¡Hacé clic en cualquier carta!");
    }
});
