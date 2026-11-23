let eventoInstalacionDiferido = null;
let streamActual = null;
let modoCamaraActual = "environment"; // 'environment' = trasera | 'user' = frontal

function actualizarMensajeEstado(texto) {
  document.getElementById("mensaje-estado").textContent = texto;
}

//Fragmento C: liberar el hardware
function detenerCamaraActiva() {
  if (streamActual) {
    streamActual.getTracks().forEach((track) => {
      track.stop();
    });
    streamActual = null;
  }
}

//Fragmento D: Encendido de Cámara con Promesas y Diagnóstico de Errores
function iniciarCamara(modo) {
  detenerCamaraActiva();

  const restricciones = {
    video: { facingMode: modo },
    audio: false,
  };

  return navigator.mediaDevices
    .getUserMedia(restricciones)
    .then((stream) => {
      streamActual = stream;
      const visorVideo = document.getElementById("visor-camara");
      visorVideo.srcObject = stream;
      actualizarMensajeEstado(
        `Cámara activa (${modo === "environment" ? "Trasera" : "Frontal"})`,
      );
    })
    .catch((error) => {
      if (error.name === "NotAllowedError") {
        actualizarMensajeEstado(
          "Permiso denegado. Habilita el acceso a la cámara en los ajustes de tu navegador.",
        );
      } else if (error.name === "NotFoundError") {
        actualizarMensajeEstado(
          "No se detectó el sensor de cámara solicitado en este dispositivo.",
        );
      } else {
        actualizarMensajeEstado(
          `Error al acceder al hardware: ${error.message}`,
        );
      }
    });
}

//Fragmento B: capturar el evento de instalación
window.addEventListener("beforeinstallprompt", (event) => {
  // Evita que el mini-banner automático aparezca antes de tiempo
  event.preventDefault();
  eventoInstalacionDiferido = event;

  // Muestra tu botón personalizado de instalación en la UI
  const btnInstalar = document.getElementById("btn-instalar");
  btnInstalar.hidden = false;
});

//Botón de instalación
document.getElementById("btn-instalar").addEventListener("click", () => {
  if (!eventoInstalacionDiferido) return;

  eventoInstalacionDiferido.prompt();

  eventoInstalacionDiferido.userChoice.then((resultado) => {
    if (resultado.outcome === "accepted") {
      document.getElementById("btn-instalar").hidden = true;
    }
    eventoInstalacionDiferido = null;
  });
});

//Fragmento E: Flujo de Consentimiento Previo (Pre-Permiso UX)
// Paso 1: El usuario pulsa "Solicitar Acceso a Cámara" -> Mostramos aviso explicativo
document.getElementById("btn-preparar-camara").addEventListener("click", () => {
  document.getElementById("aviso-permiso").hidden = false;
});

// Paso 2: El usuario lee el motivo y pulsa "Aceptar y Encender Cámara"
document
  .getElementById("btn-confirmar-permiso")
  .addEventListener("click", () => {
    document.getElementById("aviso-permiso").hidden = true;
    iniciarCamara(modoCamaraActual);
  });

//Alternar entre cámara trasera y frontal
document.getElementById("btn-alternar-camara").addEventListener("click", () => {
  if (!streamActual) {
    actualizarMensajeEstado("Primero debes encender la cámara.");
    return;
  }
  modoCamaraActual =
    modoCamaraActual === "environment" ? "user" : "environment";
  iniciarCamara(modoCamaraActual);
});

//Apagar la cámara
document.getElementById("btn-apagar-camara").addEventListener("click", () => {
  detenerCamaraActiva();
  const visorVideo = document.getElementById("visor-camara");
  visorVideo.srcObject = null;
  actualizarMensajeEstado("Cámara apagada.");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js");
}
