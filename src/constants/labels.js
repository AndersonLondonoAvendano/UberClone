// AI-assisted: see docs/AI_LOG.md #11
// AI-assisted: see docs/AI_LOG.md #13
// AI-assisted: see docs/AI_LOG.md #14
// AI-assisted: see docs/AI_LOG.md #15
// AI-assisted: see docs/AI_LOG.md #18
// AI-assisted: see docs/AI_LOG.md #19
// AI-assisted: see docs/AI_LOG.md #25
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
    startTrip: 'Simular solicitud (provisional)', // provisional development entry, replaced when requests are simulated
  },
  trip: {
    requestTitle: 'Solicitud entrante',
    activeTitle: 'Viaje en curso',
    summaryTitle: 'Cobro y resumen',
    continue: 'Continuar',
    backToHome: 'Volver al inicio',
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
  demo: {
    sharedFieldLabel: 'Valor de prueba compartido',
    sharedValueLabel: 'Valor escrito en Datos personales',
    sharedValueEmpty: 'Todavía no escribiste nada',
  },
  registration: {
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
      termsLabel: 'Acepto los términos y condiciones. La plataforma retiene una comisión del {percent}% sobre cada viaje.',
      submit: 'Enviar registro',
      submitting: 'Enviando…',
      submitError: 'No pudimos enviar tu registro. Revisa tu conexión e inténtalo de nuevo.',
    },
  },
};
