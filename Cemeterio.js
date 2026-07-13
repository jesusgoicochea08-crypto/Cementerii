const STORAGE_KEY = 'recordatorios_memorias_eternas';
const USER_STORAGE_KEY = 'usuarios_memorias_eternas';
const navLinks = document.querySelectorAll('.nav-link');
const resultado = document.getElementById('resultado-busqueda');
const views = document.querySelectorAll('.view');

function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
  return '#' + [R, G, B].map((value) => value.toString(16).padStart(2, '0')).join('');
}

function aplicarColor(color) {
  document.body.style.setProperty('--accent-color', color);
  document.body.style.setProperty('--accent-dark', shadeColor(color, -25));
}

function activarMenu(link) {
  navLinks.forEach((item) => item.classList.remove('active'));
  if (link) {
    link.classList.add('active');
    aplicarColor(link.dataset.color || '#c9a227');
  }
}

function mostrarVista(viewId) {
  views.forEach((view) => view.classList.remove('active'));
  const target = document.getElementById(`view-${viewId}`);
  if (target) {
    target.classList.add('active');
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const viewId = link.dataset.view;
    if (viewId) {
      mostrarVista(viewId);
      activarMenu(link);
    }
  });
});

document.querySelectorAll('.card-btn[data-view]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    const viewId = element.dataset.view;
    const targetLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
    if (targetLink) {
      mostrarVista(viewId);
      activarMenu(targetLink);
    }
  });
});

function buscar() {
  const nombre = document.getElementById('buscar').value.trim();

  if (nombre === '') {
    if (resultado) {
      resultado.textContent = 'Escriba un nombre o dato para buscar un memorial guardado.';
    }
    return;
  }

  const valor = nombre.toLowerCase();
  const coincidencias = obtenerRecordatorios().filter((recordatorio) => {
    return [
      recordatorio.nombreCompleto,
      recordatorio.fechaNacimiento,
      recordatorio.fechaFallecimiento,
      recordatorio.lugarNacimiento,
      recordatorio.lugarFallecimiento,
      recordatorio.cementerio,
      recordatorio.ubicacionNicho,
      recordatorio.religion,
      recordatorio.profesion,
      recordatorio.biografia,
      recordatorio.arbolFamiliar,
      recordatorio.fraseDespedida,
      recordatorio.titulo,
      recordatorio.mensaje,
    ]
      .filter(Boolean)
      .some((campo) => campo.toLowerCase().includes(valor));
  });

  if (resultado) {
    if (coincidencias.length) {
      resultado.textContent = `Encontramos ${coincidencias.length} memorial(es) relacionados con "${nombre}".`;
      mostrarVista('memoriales');
      activarMenu(document.querySelector('.nav-link[data-view="memoriales"]'));
      renderizarMemoriales('memoriales-guardados', 12, coincidencias);
    } else {
      resultado.textContent = `No se encontró ningún memorial para "${nombre}".`;
      mostrarVista('memoriales');
      activarMenu(document.querySelector('.nav-link[data-view="memoriales"]'));
      renderizarMemoriales('memoriales-guardados', 12, []);
    }
  }
}

function obtenerRecordatorios() {
  try {
    const guardados = localStorage.getItem(STORAGE_KEY);
    return guardados ? JSON.parse(guardados) : [];
  } catch (error) {
    return [];
  }
}

function guardarRecordatorios(recordatorios) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recordatorios));
}

function obtenerUsuarios() {
  try {
    const guardados = localStorage.getItem(USER_STORAGE_KEY);
    return guardados ? JSON.parse(guardados) : [];
  } catch (error) {
    return [];
  }
}

function guardarUsuarios(usuarios) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarios));
}

function crearTarjetaMemorial(recordatorio) {
  const article = document.createElement('article');
  article.className = 'card';

  let imagen = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80';
  if (recordatorio.fotoPrincipalData) {
    imagen = recordatorio.fotoPrincipalData;
  }

  article.innerHTML = `
    <img src="${imagen}" alt="Memorial de ${recordatorio.nombreCompleto || 'persona'}" />
    <h3>${recordatorio.nombreCompleto || recordatorio.titulo}</h3>
    <p>${recordatorio.fechaNacimiento || ''} - ${recordatorio.fechaFallecimiento || ''}</p>
    <p>${recordatorio.profession || recordatorio.profesion || ''}</p>
    <a class="card-btn" href="#" data-view="homenajes">Ver homenaje</a>
  `;

  return article;
}

function crearTarjeta(recordatorio) {
  const article = document.createElement('article');
  article.className = 'reminder-card';

  let mediaHTML = '';
  if (recordatorio.fotoPrincipalData) {
    mediaHTML = `<div class="media-wrapper"><img src="${recordatorio.fotoPrincipalData}" alt="${recordatorio.nombreCompleto || 'Memorial'}" /></div>`;
  } else if (recordatorio.galeriaFotosData && recordatorio.galeriaFotosData.length) {
    mediaHTML = `<div class="media-wrapper"><img src="${recordatorio.galeriaFotosData[0]}" alt="Galería de ${recordatorio.nombreCompleto || 'memorial'}" /></div>`;
  }

  if (recordatorio.videoHomenajeData) {
    mediaHTML += `<div class="media-wrapper"><video controls src="${recordatorio.videoHomenajeData}"></video></div>`;
  }

  article.innerHTML = `
    ${mediaHTML}
    <h3>${recordatorio.nombreCompleto || recordatorio.titulo}</h3>
    <p><strong>Nacimiento:</strong> ${recordatorio.fechaNacimiento || 'No disponible'}</p>
    <p><strong>Fallecimiento:</strong> ${recordatorio.fechaFallecimiento || 'No disponible'}</p>
    <p><strong>Lugar:</strong> ${recordatorio.lugarNacimiento || '---'} / ${recordatorio.lugarFallecimiento || '---'}</p>
    <p><strong>Biografía:</strong> ${recordatorio.biografia || recordatorio.mensaje || 'Sin biografía'}</p>
    <p><strong>Profesión:</strong> ${recordatorio.profesion || 'No registrada'}</p>
    <p><strong>Frase de despedida:</strong> ${recordatorio.fraseDespedida || '---'}</p>
    <p class="reminder-meta">Guardado: ${new Date(recordatorio.creadoEn).toLocaleString()}</p>
  `;

  return article;
}

function renderizarMemoriales(contenedorId, limite = 6, recordatorios = null) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const datos = recordatorios || obtenerRecordatorios();
  const lista = datos.slice(0, limite);

  if (!lista.length) {
    contenedor.innerHTML = '<div class="empty-state">Aún no hay memoriales guardados.</div>';
    return;
  }

  contenedor.innerHTML = '';
  const fragment = document.createDocumentFragment();
  lista.forEach((recordatorio) => fragment.appendChild(crearTarjetaMemorial(recordatorio)));
  contenedor.appendChild(fragment);
}

function renderizarRecordatorios(contenedorId, limite = 6) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const recordatorios = obtenerRecordatorios().slice(0, limite);

  if (!recordatorios.length) {
    contenedor.innerHTML = '<div class="empty-state">Aún no hay recordatorios. Crea el primero con amor.</div>';
    return;
  }

  contenedor.innerHTML = '';
  const fragment = document.createDocumentFragment();
  recordatorios.forEach((recordatorio) => fragment.appendChild(crearTarjeta(recordatorio)));
  contenedor.appendChild(fragment);
}

function renderizarUsuarios() {
  const contenedor = document.getElementById('lista-usuarios');
  if (!contenedor) return;

  const usuarios = obtenerUsuarios();
  if (!usuarios.length) {
    contenedor.innerHTML = '<div class="empty-state">Aún no hay usuarios registrados.</div>';
    return;
  }

  contenedor.innerHTML = '';
  const fragment = document.createDocumentFragment();
  usuarios.forEach((usuario) => {
    const article = document.createElement('article');
    article.className = 'card';
    article.innerHTML = `
      <h3>${usuario.nombre}</h3>
      <p>${usuario.email}</p>
      <p><strong>Rol:</strong> ${usuario.rol}</p>
    `;
    fragment.appendChild(article);
  });
  contenedor.appendChild(fragment);
}

function cargarFotos(archivos) {
  if (!archivos || !archivos.length) return Promise.resolve([]);
  const lectores = Array.from(archivos).map((archivo) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(archivo);
    });
  });
  return Promise.all(lectores);
}

async function crearRecordatorio(event) {
  event.preventDefault();

  const nombreCompleto = document.getElementById('nombre-completo').value.trim();
  const fechaNacimiento = document.getElementById('fecha-nacimiento').value;
  const fechaFallecimiento = document.getElementById('fecha-fallecimiento').value;
  const lugarNacimiento = document.getElementById('lugar-nacimiento').value.trim();
  const lugarFallecimiento = document.getElementById('lugar-fallecimiento').value.trim();
  const cementerio = document.getElementById('cementerio').value.trim();
  const ubicacionNicho = document.getElementById('ubicacion-nicho').value.trim();
  const religion = document.getElementById('religion').value.trim();
  const profesion = document.getElementById('profesion').value.trim();
  const biografia = document.getElementById('biografia').value.trim();
  const arbolFamiliar = document.getElementById('arbol-familiar').value.trim();
  const fraseDespedida = document.getElementById('frase-despedida').value.trim();
  const fotoPrincipal = document.getElementById('foto-principal').files[0];
  const videoHomenaje = document.getElementById('video-homenaje').files[0];
  const galeriaFotos = document.getElementById('galeria-fotos').files;
  const mensajeExito = document.getElementById('mensaje-exito');

  if (!nombreCompleto || !fechaNacimiento || !fechaFallecimiento || !biografia || !fraseDespedida) {
    if (mensajeExito) {
      mensajeExito.textContent = 'Completa los campos obligatorios para guardar el memorial.';
      mensajeExito.style.background = '#fff3e0';
      mensajeExito.style.color = '#9c4f11';
    }
    return;
  }

  const recordatorios = obtenerRecordatorios();
  const nuevoRecordatorio = {
    id: Date.now(),
    nombreCompleto,
    fechaNacimiento,
    fechaFallecimiento,
    lugarNacimiento,
    lugarFallecimiento,
    cementerio,
    ubicacionNicho,
    religion,
    profesion,
    biografia,
    arbolFamiliar,
    fraseDespedida,
    creadoEn: new Date().toISOString(),
  };

  if (fotoPrincipal) {
    const fotoData = await cargarFotos([fotoPrincipal]);
    nuevoRecordatorio.fotoPrincipalData = fotoData[0];
  }

  if (videoHomenaje) {
    const videoData = await cargarFotos([videoHomenaje]);
    nuevoRecordatorio.videoHomenajeData = videoData[0];
  }

  if (galeriaFotos && galeriaFotos.length) {
    nuevoRecordatorio.galeriaFotosData = await cargarFotos(galeriaFotos);
  }

  recordatorios.unshift(nuevoRecordatorio);
  guardarRecordatorios(recordatorios);
  renderizarRecordatorios('recordatorios-recientes', 3);
  renderizarMemoriales('memoriales-guardados', 12);
  renderizarRecordatorios('lista-recordatorios', 12);

  if (mensajeExito) {
    mensajeExito.innerHTML = '🎉 ¡Qué hermoso gesto de amor! Tu memorial fue creado con éxito y ya está guardado en el sitio.';
    mensajeExito.style.background = '#eaf8ef';
    mensajeExito.style.color = '#2e6d3d';
  }

  event.target.reset();
}

function crearUsuario(event) {
  event.preventDefault();

  const nombre = document.getElementById('usuario-nombre').value.trim();
  const email = document.getElementById('usuario-email').value.trim();
  const rol = document.getElementById('usuario-rol').value;
  const mensajeUsuario = document.getElementById('mensaje-usuario');

  if (!nombre || !email || !rol) {
    if (mensajeUsuario) {
      mensajeUsuario.textContent = 'Completa todos los campos para registrar al usuario.';
      mensajeUsuario.style.background = '#fff3e0';
      mensajeUsuario.style.color = '#9c4f11';
    }
    return;
  }

  const usuarios = obtenerUsuarios();
  usuarios.unshift({ id: Date.now(), nombre, email, rol });
  guardarUsuarios(usuarios);
  renderizarUsuarios();

  if (mensajeUsuario) {
    mensajeUsuario.innerHTML = '✅ Usuario registrado con éxito.';
    mensajeUsuario.style.background = '#eaf8ef';
    mensajeUsuario.style.color = '#2e6d3d';
  }

  event.target.reset();
}

const formularioRecordatorio = document.getElementById('formulario-recordatorio');
if (formularioRecordatorio) {
  formularioRecordatorio.addEventListener('submit', crearRecordatorio);
}

const formularioUsuario = document.getElementById('formulario-usuario');
if (formularioUsuario) {
  formularioUsuario.addEventListener('submit', crearUsuario);
}

renderizarMemoriales('memoriales-recientes', 3);
renderizarMemoriales('memoriales-guardados', 12);
renderizarRecordatorios('recordatorios-recientes', 3);
renderizarRecordatorios('lista-recordatorios', 12);
renderizarUsuarios();
mostrarVista('inicio');
activarMenu(document.querySelector('.nav-link.active'));
