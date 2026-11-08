import { Alojamiento } from '../../../core/types/anfitrion.types';

export const ALOJAMIENTOS_INICIALES: Record<string, Alojamiento[]> = {
  carlos: [
    {
      idAlojamiento: 'aloj-carlos-1',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Gran Hotel Santa Cruz Suites & Spa',
      descripcion: 'Complejo hotelero de primer nivel situado a 3 cuadras de la Plaza 24 de Septiembre. Dispone de spa, piscina climatizada, estacionamiento privado y suites con balcón.',
      departamento: 'Santa Cruz',
      ciudad: 'Santa Cruz de la Sierra',
      direccion: 'Calle Junín #452',
      tipoPropiedad: 'HOTEL',
      modalidad: 'HOTEL_HOSTAL',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '11:00 hrs',
      politicas: 'Prohibido fumar en habitaciones cerradas. Recepción 24 horas y check-in con código PIN de reserva.',
      precioBaseNoche: 850,
      moneda: 'BOB',
      calificacionPromedio: 4.96,
      totalResenas: 48,
      estado: 'PUBLICADO',
      estadoOperativo: 'EN_USO',
      fotografias: [
        {
          idFotografia: 'f-hotel-1',
          url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Fachada e ingreso principal del Gran Hotel Santa Cruz'
        },
        {
          idFotografia: 'f-hotel-2',
          url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: false,
          orden: 1,
          descripcion: 'Lobby y área de recepción'
        },
        {
          idFotografia: 'f-hotel-3',
          url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: false,
          orden: 2,
          descripcion: 'Piscina y terraza al aire libre'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-scz-101',
          nombre: 'Suite Presidencial con Balcón & Vista a Jardines',
          descripcion: 'Exclusiva suite con cama King Size, balcón privado panorámico hacia los jardines interiores, minibar de cortesía, jacuzzi hidromasaje y aire acondicionado digital.',
          capacidadPersonas: 3,
          cantidadDormitorios: 1,
          cantidadCamas: 2,
          cantidadBanios: 2,
          cantidadBanos: 2,
          precioNoche: 850,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'EN_USO',
          fotos: [
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80'
          ],
          fotografias: [
            {
              idFotografia: 'fhab-101-1',
              url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
              esPrincipal: true,
              orden: 0,
              descripcion: 'Vista panorámica de la suite presidencial'
            },
            {
              idFotografia: 'fhab-101-2',
              url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80',
              esPrincipal: false,
              orden: 1,
              descripcion: 'Balcón privado de la suite'
            }
          ]
        },
        {
          idUnidad: 'hab-scz-102',
          nombre: 'Habitación Doble Twin Confort',
          descripcion: 'Habitación amplia con 2 camas individuales ortopédicas de 1.5 plazas, escritorio de trabajo, baño privado con ducha de hidromasaje y wifi 5G.',
          capacidadPersonas: 2,
          cantidadDormitorios: 1,
          cantidadCamas: 2,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 420,
          moneda: 'BOB',
          inventarioTotal: 2,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'PENDIENTE',
          fotos: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
            'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1000&q=80'
          ],
          fotografias: [
            {
              idFotografia: 'fhab-102-1',
              url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80',
              esPrincipal: true,
              orden: 0,
              descripcion: 'Camas gemelas de la habitación Twin'
            }
          ]
        }
      ],
      reservas: [
        {
          idReserva: 'RES-SCZ-101',
          huespedNombre: 'Lucía Suárez',
          huespedTelefono: '+591 76012345',
          desde: 'Hoy 14:00',
          hasta: 'Mañana 11:00',
          pinSecreto: '839102',
          montoTotal: 850,
          estado: 'EN_USO'
        },
        {
          idReserva: 'RES-SCZ-102',
          huespedNombre: 'José Luis Pérez',
          huespedTelefono: '+591 71098765',
          desde: 'Mañana 14:00',
          hasta: 'Pasado Mañana 11:00',
          pinSecreto: '451290',
          montoTotal: 850,
          estado: 'PENDIENTE'
        }
      ]
    },
    {
      idAlojamiento: 'aloj-carlos-2',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Cabaña Rústica Vista a los Volcanes',
      descripcion: 'Cabaña ecológica construida en piedra y madera en las faldas de la serranía de Samaipata. Ideal para descanso con parrillero techado, chimenea a leña y vistas impresionantes.',
      departamento: 'Santa Cruz',
      ciudad: 'Samaipata',
      direccion: 'Camino a la Pajcha Km 4.5',
      tipoPropiedad: 'CABAÑA',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '11:00 hrs',
      politicas: 'Se admiten mascotas educadas. Leña incluida para la chimenea.',
      precioBaseNoche: 550,
      moneda: 'BOB',
      calificacionPromedio: 4.98,
      totalResenas: 36,
      estado: 'PUBLICADO',
      estadoOperativo: 'EN_USO',
      fotografias: [
        {
          idFotografia: 'f-cab-1',
          url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Cabaña y entorno natural en Samaipata'
        },
        {
          idFotografia: 'f-cab-2',
          url: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: false,
          orden: 1,
          descripcion: 'Interior de madera y chimenea'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-sam-201',
          nombre: 'Cabaña Completa con Parrillero & Chimenea',
          descripcion: 'Cabaña entera con 2 dormitorios, sala con chimenea, cocina equipada y deck con parrillero.',
          capacidadPersonas: 5,
          cantidadDormitorios: 2,
          cantidadCamas: 3,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 550,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'EN_USO',
          fotos: [
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      // Reservas consecutivas: Daniel Mamani -> José Gutiérrez
      reservas: [
        {
          idReserva: 'RES-SAM-201',
          huespedNombre: 'Daniel Mamani',
          huespedTelefono: '+591 78901234',
          desde: 'Hoy 14:00',
          hasta: 'Mañana 07:00 AM',
          pinSecreto: '629401',
          montoTotal: 550,
          estado: 'EN_USO'
        },
        {
          idReserva: 'RES-SAM-202',
          huespedNombre: 'José Gutiérrez',
          huespedTelefono: '+591 76543210',
          desde: 'Mañana 07:00 AM',
          hasta: 'Pasado Mañana 12:00 PM',
          pinSecreto: '193850',
          montoTotal: 550,
          estado: 'PENDIENTE'
        },
        {
          idReserva: 'RES-SAM-203',
          huespedNombre: 'Familia Vargas',
          huespedTelefono: '+591 70011223',
          desde: 'Viernes 14:00',
          hasta: 'Domingo 11:00',
          pinSecreto: '772109',
          montoTotal: 1100,
          estado: 'CONFIRMADA'
        }
      ]
    },
    {
      idAlojamiento: 'aloj-carlos-3',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Casa de Campo La Rinconada',
      descripcion: 'Hermosa quinta vacacional ubicada en zona residencial campestre de Santa Cruz. Amplia piscina privada, churrasquera techada para eventos familiares y jardines tropicales.',
      departamento: 'Santa Cruz',
      ciudad: 'Santa Cruz de la Sierra',
      direccion: 'Urubó Km 8, Condominio Las Palmas',
      tipoPropiedad: 'QUINTA',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '15:00 hrs',
      horarioSalida: '12:00 hrs',
      politicas: 'Música moderada después de las 23:00 hrs. Fianza reembolsable por eventos.',
      precioBaseNoche: 720,
      moneda: 'BOB',
      calificacionPromedio: 4.90,
      totalResenas: 22,
      estado: 'PUBLICADO',
      estadoOperativo: 'LIBRE',
      fotografias: [
        {
          idFotografia: 'f-rin-1',
          url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Piscina y fachada de la quinta'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-rin-301',
          nombre: 'Quinta Residencial con Piscina Privada',
          descripcion: 'Casa de campo completa de 3 habitaciones, 4 baños y área social.',
          capacidadPersonas: 8,
          cantidadDormitorios: 3,
          cantidadCamas: 5,
          cantidadBanios: 4,
          cantidadBanos: 4,
          precioNoche: 720,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    },
    {
      idAlojamiento: 'aloj-carlos-4',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Residencia Colonial Chiquitana',
      descripcion: 'Casona histórica restaurada en San José de Chiquitos con amplias galerías techadas, patios coloniales y tallados en madera mara.',
      departamento: 'Santa Cruz',
      ciudad: 'San José de Chiquitos',
      direccion: 'Calle Monseñor Santistevan #102',
      tipoPropiedad: 'CASONA',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '11:00 hrs',
      politicas: 'Cuidado estricto del patrimonio chiquitano.',
      precioBaseNoche: 480,
      moneda: 'BOB',
      calificacionPromedio: 4.85,
      totalResenas: 14,
      estado: 'OBSERVADO',
      estadoPublicacion: 'OBSERVADO',
      motivoObservacionRechazo: 'La fotografía principal de la fachada exterior no cuenta con suficiente resolución e iluminación. Favor actualizar la foto de portada y verificar número de baños.',
      fotografias: [
        {
          idFotografia: 'f-chiq-1',
          url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Patio central y columnas de madera chiquitana'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-chiq-101',
          nombre: 'Casona Entera Chiquitana',
          descripcion: 'Residencia completa de 2 dormitorios con capacidad para 4 personas.',
          capacidadPersonas: 4,
          cantidadDormitorios: 2,
          cantidadCamas: 3,
          cantidadBanios: 2,
          cantidadBanos: 2,
          precioNoche: 480,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'OBSERVADO',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    },
    {
      idAlojamiento: 'aloj-carlos-5',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Eco-Lodge Cabañas del Palmar',
      descripcion: 'Complejo ecológico de 3 cabañas independientes en el Parque Nacional El Palmar. Vista a palmeras milenarias y senderismo ecológico.',
      departamento: 'Chuquisaca',
      ciudad: 'Presto',
      direccion: 'Camino al Palmar Km 14',
      tipoPropiedad: 'HOTEL',
      modalidad: 'HOTEL_HOSTAL',
      horarioEntrada: '13:00 hrs',
      horarioSalida: '10:00 hrs',
      politicas: 'Energía solar y gestión sustentable de residuos.',
      precioBaseNoche: 390,
      moneda: 'BOB',
      calificacionPromedio: 4.90,
      totalResenas: 9,
      estado: 'PENDIENTE',
      estadoPublicacion: 'PENDIENTE',
      fotografias: [
        {
          idFotografia: 'f-palm-1',
          url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Cabañas rústicas rodeadas de naturaleza'
        }
      ],
      unidades: [
        {
          idUnidad: 'u-palm-1',
          nombre: 'Cabaña Mirador del Palmar',
          descripcion: 'Cabaña privada para parejas con balcón hacia el valle.',
          capacidadPersonas: 2,
          cantidadDormitorios: 1,
          cantidadCamas: 1,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 390,
          moneda: 'BOB',
          inventarioTotal: 2,
          activo: true,
          estado: 'PENDIENTE',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    },
    {
      idAlojamiento: 'aloj-carlos-6',
      idAnfitrion: 'carlos-mendoza-scz',
      nombreAnfitrion: 'Carlos Mendoza Cuéllar',
      titulo: 'Casa Quinta Las Palmas Urubó',
      descripcion: 'Moderna casa de campo con piscina sinfín y áreas recreativas familiares.',
      departamento: 'Santa Cruz',
      ciudad: 'Porongo / Urubó',
      direccion: 'Condominio Las Palmas del Urubó Lote 45',
      tipoPropiedad: 'QUINTA',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '15:00 hrs',
      horarioSalida: '12:00 hrs',
      politicas: 'Prohibido fiestas ruidosas fuera de horario.',
      precioBaseNoche: 890,
      moneda: 'BOB',
      calificacionPromedio: 4.92,
      totalResenas: 18,
      estado: 'SUSPENDIDO',
      estadoPublicacion: 'SUSPENDIDO',
      motivoObservacionRechazo: 'Pausado temporalmente a solicitud del anfitrión por mantenimiento de piscina y recambio de filtros.',
      fotografias: [
        {
          idFotografia: 'f-uru-1',
          url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Piscina y deck exterior'
        }
      ],
      unidades: [
        {
          idUnidad: 'u-uru-1',
          nombre: 'Quinta Completa Urubó',
          descripcion: 'Casa de 4 habitaciones con cocina gourmet.',
          capacidadPersonas: 10,
          cantidadDormitorios: 4,
          cantidadCamas: 6,
          cantidadBanios: 4,
          cantidadBanos: 4,
          precioNoche: 890,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: false,
          estado: 'SUSPENDIDO',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    }
  ],

  elena: [
    {
      idAlojamiento: 'aloj-elena-1',
      idAnfitrion: 'elena-morales-trj',
      nombreAnfitrion: 'Elena Morales Calbimontes',
      titulo: 'Finca & Viñedos San Roque Lodge',
      descripcion: 'Lodge campestre boutique en el corazón de la Ruta del Vino en el Valle de la Concepción. Catas privadas de singani y vino de altura, tinas de madera caliente bajo las estrellas.',
      departamento: 'Tarija',
      ciudad: 'Valle de la Concepción',
      direccion: 'Ruta del Vino Km 12',
      tipoPropiedad: 'LODGE',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '11:00 hrs',
      politicas: 'Incluye desayuno chapaco de cortesía y visita guiada a los viñedos.',
      precioBaseNoche: 680,
      moneda: 'BOB',
      calificacionPromedio: 4.98,
      totalResenas: 41,
      estado: 'PUBLICADO',
      estadoOperativo: 'EN_USO',
      fotografias: [
        {
          idFotografia: 'f-trj-1',
          url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Cabaña de los viñedos con deck exterior'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-trj-401',
          nombre: 'Chalet de los Viñedos con Tina de Madera',
          descripcion: 'Chalet para parejas con tina de madera caliente, cama King, estufa a leña y vistas a los parrales.',
          capacidadPersonas: 2,
          cantidadDormitorios: 1,
          cantidadCamas: 1,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 680,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'EN_USO',
          fotos: [
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: [
        {
          idReserva: 'RES-TRJ-301',
          huespedNombre: 'Andrea Balcázar',
          huespedTelefono: '+591 75112233',
          desde: 'Ayer 15:00',
          hasta: 'Mañana 11:00',
          pinSecreto: '519284',
          montoTotal: 1360,
          estado: 'EN_USO'
        },
        {
          idReserva: 'RES-TRJ-302',
          huespedNombre: 'Juan Carlos Montero',
          huespedTelefono: '+591 76655443',
          desde: 'Mañana 14:00',
          hasta: 'Domingo 11:00',
          pinSecreto: '302918',
          montoTotal: 2040,
          estado: 'PENDIENTE'
        }
      ]
    },
    {
      idAlojamiento: 'aloj-elena-2',
      idAnfitrion: 'elena-morales-trj',
      nombreAnfitrion: 'Elena Morales Calbimontes',
      titulo: 'Penthouse Panorámico Illimani',
      descripcion: 'Residencia en piso 18 con vista 360 grados hacia el majestuoso Nevado Illimani y la hoyada paceña. Calefacción central, ascensor directo y acabados de lujo en madera mara.',
      departamento: 'La Paz',
      ciudad: 'La Paz (Sopocachi)',
      direccion: 'Av. 20 de Octubre #2340',
      tipoPropiedad: 'PENTHOUSE',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '15:00 hrs',
      horarioSalida: '12:00 hrs',
      politicas: 'Edificio residencial con conserjería 24/7. No se permiten fiestas.',
      precioBaseNoche: 520,
      moneda: 'BOB',
      calificacionPromedio: 4.95,
      totalResenas: 29,
      estado: 'PUBLICADO',
      estadoOperativo: 'PENDIENTE',
      fotografias: [
        {
          idFotografia: 'f-lpz-1',
          url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Sala con ventanales y vista a La Paz'
        }
      ],
      unidades: [
        {
          idUnidad: 'hab-lpz-501',
          nombre: 'Penthouse en Piso 18 con Vista 360',
          descripcion: 'Departamento completo de 2 habitaciones, calefacción y mirador privado.',
          capacidadPersonas: 4,
          cantidadDormitorios: 2,
          cantidadCamas: 2,
          cantidadBanios: 2,
          cantidadBanos: 2,
          precioNoche: 520,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PUBLICADO',
          estadoOperativo: 'PENDIENTE',
          fotos: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: [
        {
          idReserva: 'RES-LPZ-401',
          huespedNombre: 'Mateo Siles',
          huespedTelefono: '+591 72009988',
          desde: 'Hoy 16:00',
          hasta: 'Viernes 11:00',
          pinSecreto: '948201',
          montoTotal: 1040,
          estado: 'PENDIENTE'
        }
      ]
    },
    {
      idAlojamiento: 'aloj-elena-3',
      idAnfitrion: 'elena-morales-trj',
      nombreAnfitrion: 'Elena Morales Calbimontes',
      titulo: 'Hostal Boutique El Marqués Tarija',
      descripcion: 'Hostal colonial en el centro histórico de Tarija con 5 habitaciones, patio andaluz y salón de té.',
      departamento: 'Tarija',
      ciudad: 'Tarija',
      direccion: 'Calle 15 de Abril #324',
      tipoPropiedad: 'HOTEL',
      modalidad: 'HOTEL_HOSTAL',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '11:00 hrs',
      politicas: 'Desayuno tarijeño incluido de 07:30 a 10:00.',
      precioBaseNoche: 320,
      moneda: 'BOB',
      calificacionPromedio: 4.88,
      totalResenas: 16,
      estado: 'OBSERVADO',
      estadoPublicacion: 'OBSERVADO',
      motivoObservacionRechazo: 'Se requiere adjuntar copia legible de la Licencia Departamental de Turismo y verificar capacidad de la habitación triple.',
      fotografias: [
        {
          idFotografia: 'f-marq-1',
          url: 'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Patio colonial y galería de flores'
        }
      ],
      unidades: [
        {
          idUnidad: 'u-marq-1',
          nombre: 'Habitación Colonial Doble',
          descripcion: 'Habitación con vista al patio central y baño privado.',
          capacidadPersonas: 2,
          cantidadDormitorios: 1,
          cantidadCamas: 2,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 320,
          moneda: 'BOB',
          inventarioTotal: 3,
          activo: true,
          estado: 'OBSERVADO',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1549294413-26f195200c16?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    },
    {
      idAlojamiento: 'aloj-elena-4',
      idAnfitrion: 'elena-morales-trj',
      nombreAnfitrion: 'Elena Morales Calbimontes',
      titulo: 'Cabaña Las Quebradas de Tomatitas',
      descripcion: 'Acogedora cabaña rústica a orillas del río en Tomatitas con parrillero y huerto frutal.',
      departamento: 'Tarija',
      ciudad: 'Tomatitas / San Lorenzo',
      direccion: 'Ruta a Tomatitas Km 5',
      tipoPropiedad: 'CABAÑA',
      modalidad: 'CASA_DEPARTAMENTO',
      horarioEntrada: '14:00 hrs',
      horarioSalida: '12:00 hrs',
      politicas: 'Espacio eco-turístico para descanso familiar.',
      precioBaseNoche: 450,
      moneda: 'BOB',
      calificacionPromedio: 4.90,
      totalResenas: 7,
      estado: 'PENDIENTE',
      estadoPublicacion: 'PENDIENTE',
      fotografias: [
        {
          idFotografia: 'f-tom-1',
          url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
          esPrincipal: true,
          orden: 0,
          descripcion: 'Cabaña y naturaleza en Tomatitas'
        }
      ],
      unidades: [
        {
          idUnidad: 'u-tom-1',
          nombre: 'Cabaña Completa Tomatitas',
          descripcion: 'Cabaña de 2 dormitorios con capacidad para 5 personas.',
          capacidadPersonas: 5,
          cantidadDormitorios: 2,
          cantidadCamas: 3,
          cantidadBanios: 1,
          cantidadBanos: 1,
          precioNoche: 450,
          moneda: 'BOB',
          inventarioTotal: 1,
          activo: true,
          estado: 'PENDIENTE',
          estadoOperativo: 'LIBRE',
          fotos: [
            'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80'
          ]
        }
      ],
      reservas: []
    }
  ]
};

// Sincronizar estado de moderación con las decisiones tomadas por el Administrador en Portal Admin
function sincronizarConDecisionesAdmin(lista: Alojamiento[]): Alojamiento[] {
  try {
    const adminRaw = localStorage.getItem('alojate_admin_alojamientos');
    if (adminRaw) {
      const adminItems: any[] = JSON.parse(adminRaw);
      const adminMap = new Map<string, any>();
      adminItems.forEach(item => {
        if (item.id) adminMap.set(item.id, item);
        if (item.idAlojamiento) adminMap.set(item.idAlojamiento, item);
      });

      return lista.map(a => {
        const adminItem = adminMap.get(a.idAlojamiento);
        if (adminItem) {
          const nuevoEst = adminItem.estado || a.estado;
          const nuevoMotivo = adminItem.motivoObservacionRechazo || adminItem.motivoRechazo || a.motivoObservacionRechazo;
          return {
            ...a,
            estado: nuevoEst,
            estadoPublicacion: nuevoEst,
            motivoObservacionRechazo: nuevoMotivo,
            motivoRechazo: nuevoMotivo,
            origenUltimoCambio: adminItem.origenUltimoCambio || a.origenUltimoCambio
          };
        }
        return a;
      });
    }
  } catch (e) {
    console.warn('[AlojamientoService] Error al sincronizar con auditoría de admin:', e);
  }
  return lista;
}

export const alojamientoService = {
  obtenerPorAnfitrion(clave: 'carlos' | 'elena'): Alojamiento[] {
    let listaBase: Alojamiento[] = ALOJAMIENTOS_INICIALES[clave] || [];

    try {
      const custom = localStorage.getItem(`alojate_anfitrion_${clave}`);
      if (custom) {
        listaBase = JSON.parse(custom);
      }
    } catch {}

    // Incorporar cualquier alojamiento creado o modificado globalmente
    try {
      const customGlobal = localStorage.getItem('alojate_alojamientos_custom');
      if (customGlobal) {
        const itemsGlobal: Alojamiento[] = JSON.parse(customGlobal);
        const map = new Map<string, Alojamiento>();
        listaBase.forEach(item => map.set(item.idAlojamiento, item));
        
        itemsGlobal.forEach(item => {
          const matchAnfitrion = 
            (clave === 'carlos' && (item.idAnfitrion?.includes('carlos') || item.nombreAnfitrion?.toLowerCase().includes('carlos') || !item.idAnfitrion)) ||
            (clave === 'elena' && (item.idAnfitrion?.includes('elena') || item.nombreAnfitrion?.toLowerCase().includes('elena')));
          
          if (matchAnfitrion) {
            map.set(item.idAlojamiento, { ...map.get(item.idAlojamiento), ...item });
          }
        });
        listaBase = Array.from(map.values());
      }
    } catch {}

    // Sincronizar reactivamente con las resoluciones del Administrador
    return sincronizarConDecisionesAdmin(listaBase);
  },

  async sincronizarConServidor(clave: 'carlos' | 'elena'): Promise<Alojamiento[]> {
    let listaActual = this.obtenerPorAnfitrion(clave);

    try {
      const resp = await fetch('http://localhost:8080/api/v1/alojamientos/todos', {
        headers: { 'Accept': 'application/json' }
      });
      if (resp.ok) {
        const remotos: any[] = await resp.json();
        if (Array.isArray(remotos) && remotos.length > 0) {
          const map = new Map<string, Alojamiento>();
          listaActual.forEach(a => map.set(a.idAlojamiento, a));

          remotos.forEach(r => {
            const id = r.idAlojamiento || r.id;
            const matchAnf = 
              (clave === 'carlos' && (r.idAnfitrion?.includes('carlos') || r.nombreAnfitrion?.toLowerCase().includes('carlos') || !r.idAnfitrion)) ||
              (clave === 'elena' && (r.idAnfitrion?.includes('elena') || r.nombreAnfitrion?.toLowerCase().includes('elena')));
            
            if (id && matchAnf) {
              const previo = map.get(id);
              map.set(id, {
                ...(previo || {}),
                idAlojamiento: id,
                idAnfitrion: r.idAnfitrion || previo?.idAnfitrion || 'a0000000-0000-4000-8000-000000000002',
                nombreAnfitrion: r.nombreAnfitrion || previo?.nombreAnfitrion || 'Carlos Mendoza Cuéllar',
                titulo: r.titulo || previo?.titulo || 'Alojamiento Registrado',
                descripcion: r.descripcion || previo?.descripcion || '',
                departamento: r.departamento || previo?.departamento || 'Santa Cruz',
                ciudad: r.ciudad || previo?.ciudad || 'Santa Cruz de la Sierra',
                direccion: r.direccion || previo?.direccion || '',
                tipoPropiedad: r.tipoPropiedad || previo?.tipoPropiedad || 'HOTEL',
                modalidad: r.modalidad || previo?.modalidad || 'HOTEL_HOSTAL',
                precioBaseNoche: Number(r.precioBaseNoche ?? r.precioNoche ?? previo?.precioBaseNoche ?? 450),
                moneda: r.moneda || 'BOB',
                calificacionPromedio: Number(r.calificacionPromedio ?? previo?.calificacionPromedio ?? 4.9),
                totalResenas: Number(r.totalResenas ?? previo?.totalResenas ?? 10),
                estado: r.estadoPublicacion || r.estado || previo?.estado || 'PENDIENTE',
                estadoPublicacion: r.estadoPublicacion || r.estado || previo?.estadoPublicacion || 'PENDIENTE',
                motivoObservacionRechazo: r.motivoObservacionRechazo || r.motivoRechazo || previo?.motivoObservacionRechazo,
                fotografias: (r.fotografias && r.fotografias.length > 0) ? r.fotografias : (previo?.fotografias || []),
                unidades: (r.unidades && r.unidades.length > 0) ? r.unidades : (previo?.unidades || []),
                estadoOperativo: previo?.estadoOperativo || 'LIBRE',
                reservas: previo?.reservas || []
              });
            }
          });

          listaActual = Array.from(map.values());
          this.guardar(clave, listaActual);
        }
      }
    } catch (e) {
      // Si el backend no responde, la sincronización local funciona de forma transparente
    }

    return sincronizarConDecisionesAdmin(listaActual);
  },

  guardar(clave: 'carlos' | 'elena', lista: Alojamiento[]): void {
    try {
      localStorage.setItem(`alojate_anfitrion_${clave}`, JSON.stringify(lista));
      
      // Sincronizar también con el catálogo global y draft de alojamientos custom
      const customCatalogo = localStorage.getItem('alojate_alojamientos_custom');
      const catalogoActual: Alojamiento[] = customCatalogo ? JSON.parse(customCatalogo) : [];
      const map = new Map<string, Alojamiento>();
      catalogoActual.forEach(c => map.set(c.idAlojamiento, c));
      lista.forEach(l => map.set(l.idAlojamiento, l));
      localStorage.setItem('alojate_alojamientos_custom', JSON.stringify(Array.from(map.values())));
    } catch {}
  },

  async crear(clave: 'carlos' | 'elena', nuevo: Alojamiento): Promise<Alojamiento> {
    const listaActual = this.obtenerPorAnfitrion(clave);
    const id = nuevo.idAlojamiento || `aloj-${Date.now()}`;
    const preparado: Alojamiento = {
      ...nuevo,
      idAlojamiento: id,
      estado: 'PENDIENTE',
      estadoPublicacion: 'PENDIENTE',
      estadoOperativo: 'LIBRE',
      reservas: []
    };

    const actualizada = [preparado, ...listaActual.filter(a => a.idAlojamiento !== id)];
    this.guardar(clave, actualizada);

    // Intentar publicar en el Gateway API central
    try {
      await fetch('http://localhost:8080/api/v1/alojamientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preparado)
      });
    } catch {}

    return preparado;
  }
};
