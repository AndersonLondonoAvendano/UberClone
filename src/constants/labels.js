// AI-assisted: see docs/AI_LOG.md #11
// AI-assisted: see docs/AI_LOG.md #13
// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #25
// AI-assisted: see docs/AI_LOG.md #33
// AI-assisted: see docs/AI_LOG.md #36
// AI-assisted: see docs/AI_LOG.md #41
// AI-assisted: see docs/AI_LOG.md #43
// AI-assisted: see docs/AI_LOG.md #42
// Navigation and screen-state texts (Spanish). Nested keys so a dictionary can replace them later.

export const labels = {
  appName: 'UberClone Conductor',
  tabs: {
    personalData: 'Datos personales',
    vehicle: 'Vehículo',
    documents: 'Documentos',
  },
  drawer: {
    title: 'UberClone Conductor',
    home: 'Inicio',
    profile: 'Perfil',
    history: 'Historial',
    earnings: 'Ganancias',
    settings: 'Configuración',
  },
  nav: {
    openDrawer: 'Menú',
    back: 'Atrás',
  },
  home: {
    startTrip: 'Simular solicitud (provisional)', // development entry (SHOW_DEV_TOOLS): asks the mock for a request now
    availabilityLabel: 'Disponibilidad',
    available: 'Disponible',
    unavailable: 'No disponible',
    turnOnHint: 'Activa para recibir solicitudes de viaje',
    turnOffHint: 'Desactiva para dejar de recibir solicitudes',
    hintOff: 'Activa Disponible para recibir solicitudes cerca de ti.',
    hintWaiting: 'Obteniendo tu ubicación…',
    hintActive: 'Buscando solicitudes cerca de ti.',
    hintPaused: 'Ubicación en pausa mientras la app está en segundo plano.',
    hintNoLocation: 'No pudimos obtener tu ubicación. Revisa que el GPS esté encendido.',
    permissionDenied: 'Para estar disponible necesitas permitir la ubicación. Actívala en los ajustes del teléfono.',
    permissionUnavailable: 'La ubicación no está disponible en este momento. Inténtalo de nuevo.',
    debugRequest: 'Solicitud recibida: {id}', // development line (SHOW_DEV_TOOLS)
    devNeedsAvailable: 'Activa Disponible para simular una solicitud.',
    devNoPosition: 'Aún no hay ubicación; espera unos segundos.',
    devBusy: 'Ya hay una solicitud o un viaje en curso.',
    devNotSupported: 'La API real no permite simular solicitudes.',
    servicesOff: 'Activa la ubicación del teléfono para estar disponible.',
  },
  trip: {
    requestTitle: 'Solicitud entrante',
    activeTitle: 'Viaje en curso',
    summaryTitle: 'Resumen del viaje',
    backToHome: 'Volver a Inicio',
    passenger: 'Pasajero',
    rating: '★ {rating}',
    ratingA11y: 'Calificación {rating} de 5',
    pickup: 'Recogida',
    destination: 'Destino',
    toPickup: 'A {km} km · {min} min del pasajero',
    tripLength: 'Viaje de {km} km · {min} min',
    category: 'Categoría',
    payment: 'Pago',
    paymentMethod: { card: 'Tarjeta', cash: 'Efectivo' },
    fare: 'Tarifa',
    commission: 'Comisión ({pct} %)',
    net: 'Tu ganancia',
    countdown: 'Vence en {s} s',
    countdownA11y: 'La solicitud vence en {s} segundos',
    accept: 'Aceptar',
    acceptHint: 'Acepta el viaje y abre la ruta al pasajero',
    reject: 'Rechazar',
    rejectHint: 'Rechaza la solicitud y vuelve a Inicio',
    working: 'Un momento…',
    expired: 'La solicitud venció',
    backingHome: 'Volviendo a Inicio…',
    noRequest: 'No hay una solicitud pendiente.',
    errorTaken: 'Otro conductor tomó esta solicitud.',
    errorNetwork: 'No hay conexión. Revisa tu internet e inténtalo de nuevo.',
    errorGeneric: 'Algo salió mal. Inténtalo de nuevo.',
    phase: {
      starting: 'Preparando el viaje…',
      toPickup: 'En camino al pasajero',
      atPickup: 'Llegaste al punto de recogida',
      toDestination: 'En camino al destino',
      atDestination: 'Llegaste al destino',
    },
    // AI-assisted: see docs/AI_LOG.md #44
    remaining: '{km} km · {min} min',
    remainingCaption: 'restantes',
    routeLoading: 'Calculando la ruta…',
    approxRoute: 'Ruta aproximada: sin conexión con el servidor de rutas, la línea recta no sigue las calles.',
    // AI-assisted: see docs/AI_LOG.md #44 ("Pasajero a bordo" states the fact; hints are visible text too)
    startRide: 'Pasajero a bordo',
    startRideHint: 'Llega al punto de recogida para continuar',
    finishRide: 'Finalizar viaje',
    finishRideHint: 'Llega al destino para continuar',
    finishing: 'Avisando al pasajero que el viaje terminó…',
    finishErrorNetwork: 'No pudimos confirmar el final del viaje: no hay conexión.',
    finishErrorTimeout: 'El servidor no respondió a tiempo al finalizar el viaje.',
    finishErrorRejected: 'El servidor no aceptó el final del viaje. Puedes salir del viaje.',
    exitTrip: 'Salir del viaje',
    exitQuestion: '¿Salir del viaje sin la confirmación del servidor?',
    exitMessage: 'El viaje se cierra en este teléfono y vuelves a Inicio. El pasajero puede no recibir el aviso.',
    exitConfirm: 'Sí, salir',
    exitKeep: 'Quedarme aquí',
    reportError: 'No pudimos avisar el cambio al pasajero. Revisa tu conexión.',
    locationError: 'No pudimos obtener tu ubicación. Revisa que la ubicación del teléfono esté activada.',
    mapError: 'No pudimos cargar el mapa. Revisa tu conexión a internet.',
    cancel: 'Cancelar viaje',
    cancelQuestion: '¿Cancelar este viaje?',
    cancelMessage: 'El pasajero recibirá el aviso y volverás a Inicio.',
    cancelConfirm: 'Sí, cancelar',
    cancelKeep: 'Seguir con el viaje',
    cancelError: 'No pudimos cancelar el viaje. Revisa tu conexión.',
    distance: 'Distancia',
    duration: 'Duración',
    finishedAt: 'Hora de llegada',
    kmValue: '{km} km',
    minValue: '{min} min',
    notSaved: 'Este resumen no se guarda: es solo de este viaje.',
    noTrip: 'No hay un viaje para mostrar.',
  },
  states: {
    loading: {
      title: 'Cargando',
      message: 'Estamos trayendo tu información.',
    },
    empty: {
      title: 'Todavía no hay nada aquí',
      message: 'Aún no hay información que mostrar. Vuelve a esta pantalla más tarde.',
    },
    error: {
      title: 'No pudimos cargar',
      message: 'Algo falló al traer tu información. Revisa tu conexión e inténtalo de nuevo.',
    },
  },
  placeholder: {
    body: 'Pantalla marcador. Su contenido llega con su spec.',
  },
  a11y: {
    openDrawer: 'Abrir menú',
    back: 'Volver a la pantalla anterior',
    drawerItems: {
      profile: 'Ir a Perfil',
      history: 'Ir a Historial',
      earnings: 'Ir a Ganancias',
      settings: 'Ir a Configuración',
    },
    tabs: {
      personalData: 'Pestaña Datos personales',
      vehicle: 'Pestaña Vehículo',
      documents: 'Pestaña Documentos',
    },
  },
  actions: {
    retry: 'Reintentar',
  },
  forceState: {
    legend: 'Estado de la pantalla (prueba)',
    content: 'Contenido',
    loading: 'Cargando',
    empty: 'Vacío',
    error: 'Error',
  },
  devAccount: {
    title: 'Simulador de cuenta (provisional)',
    loading: 'Cargando',
    pending: 'Pendiente de aprobación',
    approved: 'Aprobado',
    error: 'Error',
  },
  mapTest: {
    title: 'Prueba del mapa',
    openFromHome: 'Probar mapa y ruta (provisional)', // development-only entry, gated by SHOW_DEV_TOOLS
    attribution: '© OpenFreeMap · © OpenMapTiles · Datos © colaboradores de OpenStreetMap · Rutas: OSRM',
    routeErrorHint: 'No pudimos calcular la ruta de prueba.',
    mapErrorHint: 'No pudimos cargar el mapa. Revisa tu conexión a internet.',
    fallbackNotice: 'Ruta de respaldo: no hubo conexión con el servidor de rutas y se muestra una ruta guardada.',
    straightNotice: 'Ruta aproximada: no hubo conexión con el servidor de rutas y se muestra una línea recta que no sigue las calles.',
    routeSummary: 'Ruta: {km} km · {min} min aprox.',
    locationPending: 'Buscando tu posición…',
    locationDenied: 'No diste permiso de ubicación. El mapa y la ruta se ven igual, pero sin tu posición. Puedes activarlo en los ajustes del teléfono.',
    locationUnavailable: 'No pudimos obtener tu posición. Revisa que la ubicación del teléfono esté activada.',
    locationReady: 'Tu posición: {lat}, {lng}',
    showRoute: 'Ver ruta',
    showMe: 'Ver mi posición',
  },
  demo: {
    sharedFieldLabel: 'Valor de prueba compartido',
    sharedValueLabel: 'Valor escrito en Datos personales',
    sharedValueEmpty: 'Todavía no escribiste nada',
  },
  registration: {
    pendingNotice: 'Pendiente de aprobación. Mientras tu cuenta se revisa, no puedes editar ni reenviar tu registro.',
    gender: {
      femenino: 'Femenino',
      masculino: 'Masculino',
      otro: 'Otro',
      prefieroNoDecir: 'Prefiero no decir',
    },
    language: {
      es: 'Español',
      en: 'Inglés',
    },
    vehicleCategory: {
      economico: 'Económico',
      xl: 'XL',
      premium: 'Premium',
    },
    vehicleColor: {
      blanco: 'Blanco',
      negro: 'Negro',
      gris: 'Gris',
      plata: 'Plata',
      rojo: 'Rojo',
      azul: 'Azul',
      verde: 'Verde',
      amarillo: 'Amarillo',
      otro: 'Otro',
    },
    photo: {
      instruction: 'Elige una foto con la cámara o la galería.',
      camera: 'Cámara',
      gallery: 'Galería',
      uploading: 'Subiendo foto',
      permissionDenied: 'Necesitamos tu permiso para continuar. Revisa los permisos de la app y vuelve a intentarlo.',
      removePhoto: 'Quitar foto',
    },
    personalData: {
      fields: {
        profilePhotoUrl: { label: 'Foto de perfil', error: 'Elige una foto de perfil con la cámara o la galería.' },
        fullName: { label: 'Nombre completo', error: 'Escribe tu nombre completo (máximo 50 letras, solo letras y espacios).' },
        documentNumber: { label: 'Número de documento', error: 'Escribe un número de documento válido (6 a 10 dígitos).' },
        phone: { label: 'Celular', error: 'Escribe un número de celular válido de 10 dígitos.' },
        birthDate: { label: 'Fecha de nacimiento', error: 'Elige tu fecha de nacimiento; debes ser mayor de 18 años.' },
        gender: { label: 'Género', error: 'Selecciona una opción.' },
        email: { label: 'Correo electrónico', error: 'Escribe un correo válido, con @ y dominio.' },
        language: { label: 'Idioma', error: 'Selecciona un idioma.' },
      },
    },
    vehicle: {
      fields: {
        category: { label: 'Categoría', error: 'Selecciona una categoría.' },
        plate: { label: 'Placa', error: 'Escribe una placa válida, con el formato ABC123.' },
        brand: { label: 'Marca', error: 'Escribe la marca del vehículo (máximo 30 caracteres).' },
        model: { label: 'Modelo', error: 'Escribe el modelo del vehículo (máximo 30 caracteres).' },
        year: { label: 'Año', error: 'Escribe un año válido (4 dígitos, no mayor al año actual).' },
        color: { label: 'Color', error: 'Selecciona un color.' },
        capacity: { label: 'Capacidad', error: 'Escribe una capacidad válida (mínimo 6 para la categoría XL).' },
        photoUrl: { label: 'Foto del vehículo (con la placa visible)', error: 'Elige una foto del vehículo con la placa visible, con la cámara o la galería.' },
      },
    },
    documents: {
      fields: {
        mercadoPagoEmail: { label: 'Correo de Mercado Pago', error: 'Escribe un correo válido, con @ y dominio.' },
        termsAccepted: { error: 'Debes aceptar los términos para continuar.' },
      },
      termsLabel: 'Acepto los términos y condiciones. La plataforma retiene una comisión del {percent} % sobre cada viaje.',
      submit: 'Enviar registro',
      submitting: 'Enviando…',
      submitSuccess: 'Registro enviado. Tu cuenta está pendiente de aprobación.',
      submitError: 'No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.',
      submitErrors: {
        'permission-denied': 'No pudimos enviar tu registro por un problema de permisos de tu cuenta. Cierra sesión y vuelve a intentarlo.',
        unavailable: 'No hay conexión con el servidor. Revisa tu internet e inténtalo de nuevo.',
        'deadline-exceeded': 'La conexión tardó demasiado. Revisa tu internet e inténtalo de nuevo.',
        unauthenticated: 'Tu sesión expiró. Vuelve a iniciar sesión.',
      },
    },
  },
};

export function getSubmitErrorMessage(code) {
  return labels.registration.documents.submitErrors[code] ?? labels.registration.documents.submitError;
}
