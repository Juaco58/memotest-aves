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
    
    // FIX: El juego comienza en estado jugable, NO en modo visualizador final.
    juegoTerminado = false;
}

function iniciarConfiguracionModo(modo) {
    modoJuego = modo;
    const pantallaModo = document.getElementById('pantalla-modo');
    if (pantallaModo) pantallaModo.style.display = 'none';
    
    // FIX: Resetear el estado de juego terminado al comenzar una partida nueva.
    juegoTerminado = false;
    
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
    // 🌟 1. Si el juego terminó, abrimos el zoom real y frenamos el juego
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

    // 🔒 2. Filtros normales de la partida
    if (bloqueado || this.classList.contains('volteada') || this.classList.contains('acertada') || cartasVolteadas.length >= 2) return;
    
    sndVoltear.currentTime = 0;
    sndVoltear.play().catch(err => console.log(err));
    
    this.classList.add('volteada'); 
    cartasVolteadas.push(this); 
    this.classList.add('ampliada-temporal');
    
    const cartaParaAchicar = this;
    setTimeout(() => { cartaParaAchicar.classList.remove('ampliada-temporal'); }, 2000);

    if (cartasVolteadas.length === 2) { 
        bloqueado = true; 
        
        if (window.innerWidth <= 767 || window.innerHeight <= 480 || window.match