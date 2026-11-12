import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  Award,
  Trash2,
  Eye,
  FileCheck,
  Building2,
  Receipt
} from 'lucide-react';
import { useAnfitrionAuth } from '../../../core/auth/AuthContext';
import { API_BASE_URL } from '../../../core/api/apiEndpoints';

interface MiPerfilScreenProps {
  onMostrarToast: (msg: string) => void;
}

const DEPARTAMENTOS_BOLIVIA = [
  'Santa Cruz',
  'La Paz',
  'Cochabamba',
  'Tarija',
  'Chuquisaca',
  'Oruro',
  'Potosí',
  'Beni',
  'Pando'
];

const EXPEDIDOS_CI = ['SC', 'LP', 'CB', 'TJ', 'CH', 'OR', 'PT', 'BE', 'PA'];

export const MiPerfilScreen: React.FC<MiPerfilScreenProps> = ({ onMostrarToast }) => {
  const { perfil, actualizarPerfil } = useAnfitrionAuth();

  // Estados locales para edición de datos personales
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [email, setEmail] = useState(perfil.email || '');
  const [telefono, setTelefono] = useState(perfil.telefono || '');
  const [ciudad, setCiudad] = useState(perfil.ciudad || 'La Paz');
  const [departamento, setDepartamento] = useState(perfil.departamento || 'La Paz');
  const [descripcion, setDescripcion] = useState(perfil.descripcion || '');
  const [avatarUrl, setAvatarUrl] = useState(perfil.avatarUrl || '');

  // Campos de verificación oficial boliviana
  const [ciNumero, setCiNumero] = useState(perfil.ciNumero || '');
  const [ciExpedido, setCiExpedido] = useState(perfil.ciExpedido || 'LP');
  const [ciAnversoUrl, setCiAnversoUrl] = useState(perfil.ciAnversoUrl || '');
  const [ciReversoUrl, setCiReversoUrl] = useState(perfil.ciReversoUrl || '');
  const [nit, setNit] = useState(perfil.nit || '');
  const [licenciaTuristica, setLicenciaTuristica] = useState(perfil.licenciaTuristica || '');
  const [comprobanteDomicilioUrl, setComprobanteDomicilioUrl] = useState(perfil.comprobanteDomicilioUrl || '');

  // Archivos pendientes en caché local para subir solo al hacer clic en Guardar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [ciAnversoFile, setCiAnversoFile] = useState<File | null>(null);
  const [ciReversoFile, setCiReversoFile] = useState<File | null>(null);
  const [domicilioFile, setDomicilioFile] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Sincronizar estados locales cuando cambia el perfil o anfitrión activo
  useEffect(() => {
    setNombre(perfil.nombre || '');
    setEmail(perfil.email || '');
    setTelefono(perfil.telefono || '');
    setCiudad(perfil.ciudad || 'La Paz');
    setDepartamento(perfil.departamento || 'La Paz');
    setDescripcion(perfil.descripcion || '');
    setAvatarUrl(perfil.avatarUrl || '');
    setCiNumero(perfil.ciNumero || '');
    setCiExpedido(perfil.ciExpedido || 'LP');
    setCiAnversoUrl(perfil.ciAnversoUrl || '');
    setCiReversoUrl(perfil.ciReversoUrl || '');
    setNit(perfil.nit || '');
    setLicenciaTuristica(perfil.licenciaTuristica || '');
    setComprobanteDomicilioUrl(perfil.comprobanteDomicilioUrl || '');
  }, [perfil.id, perfil.email, perfil.telefono, perfil.ciNumero, perfil.ciExpedido, perfil.nombre]);

  // Cómputo dinámico de requisitos de verificación
  const reqCI = Boolean(ciNumero.trim() && ciExpedido);
  const reqFotosCI = Boolean(ciAnversoUrl && ciReversoUrl);
  const reqNIT = Boolean(nit.trim());
  const reqLicencia = Boolean(licenciaTuristica.trim());
  const reqDomicilio = Boolean(comprobanteDomicilioUrl);

  const requisitos = [
    { label: 'Cédula de Identidad (Número & Expedido)', cumplido: reqCI },
    { label: 'Fotos de CI (Anverso y Reverso)', cumplido: reqFotosCI },
    { label: 'NIT registrado ante el SIN', cumplido: reqNIT },
    { label: 'Licencia o Registro Turístico Municipal', cumplido: reqLicencia },
    { label: 'Factura de Servicios Básicos (Luz/Agua)', cumplido: reqDomicilio }
  ];

  const cumplidosTotal = requisitos.filter(r => r.cumplido).length;
  const porcentaje = Math.round((cumplidosTotal / requisitos.length) * 100);
  const estaCompletamenteVerificado = cumplidosTotal >= 4;

  // 1. Manejo de carga de foto de perfil (Avatar) - Solo vista previa en caché
  const handleSubirAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
      onMostrarToast('Foto de perfil seleccionada en vista previa.');
    }
  };

  const handleEliminarAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl('');
    actualizarPerfil({ avatarUrl: '' });
    onMostrarToast('Foto de perfil eliminada.');
  };

  // 2. Manejo de carga de documentos (CI Anverso, CI Reverso, Factura Domicilio) - Solo vista previa en caché
  const handleSubirDocumento = (
    tipo: 'ciAnverso' | 'ciReverso' | 'domicilio',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (tipo === 'ciAnverso') {
        setCiAnversoFile(file);
        setCiAnversoUrl(previewUrl);
      }
      if (tipo === 'ciReverso') {
        setCiReversoFile(file);
        setCiReversoUrl(previewUrl);
      }
      if (tipo === 'domicilio') {
        setDomicilioFile(file);
        setComprobanteDomicilioUrl(previewUrl);
      }
      onMostrarToast('Documento cargado en vista previa.');
    }
  };

  // Helper anti-duplicados: sube solo si es un archivo nuevo seleccionado
  const subirArchivoSiEsNuevo = async (file: File | null, carpeta: string, urlActual: string): Promise<string> => {
    if (!file) return urlActual;
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=${carpeta}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      res = await fetch(`${API_BASE_URL}/api/v1/alojamientos/imagenes?carpeta=${carpeta}`, {
        method: 'POST',
        body: formData
      });
    }
    if (res.ok) {
      const data = await res.json();
      return data.url;
    } else {
      const errText = await res.text();
      throw new Error(`Error en el servidor (${res.status}): ${errText}`);
    }
  };

  // 3. Solo al hacer clic en "Guardar Cambios", se sube lo nuevo al almacenamiento y se guarda
  const handleGuardarCambios = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    try {
      let avatarFinal = avatarUrl;
      let anversoFinal = ciAnversoUrl;
      let reversoFinal = ciReversoUrl;
      let domicilioFinal = comprobanteDomicilioUrl;

      // Subir solo archivos nuevos modificados (evita duplicar fotos existentes)
      if (avatarFile) {
        avatarFinal = await subirArchivoSiEsNuevo(avatarFile, 'perfiles', avatarUrl);
        setAvatarUrl(avatarFinal);
        setAvatarFile(null);
      }
      if (ciAnversoFile) {
        anversoFinal = await subirArchivoSiEsNuevo(ciAnversoFile, 'carnets', ciAnversoUrl);
        setCiAnversoUrl(anversoFinal);
        setCiAnversoFile(null);
      }
      if (ciReversoFile) {
        reversoFinal = await subirArchivoSiEsNuevo(ciReversoFile, 'carnets', ciReversoUrl);
        setCiReversoUrl(reversoFinal);
        setCiReversoFile(null);
      }
      if (domicilioFile) {
        domicilioFinal = await subirArchivoSiEsNuevo(domicilioFile, 'documentos', comprobanteDomicilioUrl);
        setComprobanteDomicilioUrl(domicilioFinal);
        setDomicilioFile(null);
      }

      const verif = estaCompletamenteVerificado;
      actualizarPerfil({
        nombre,
        email,
        telefono,
        ciudad,
        departamento,
        descripcion,
        avatarUrl: avatarFinal,
        ciNumero,
        ciExpedido,
        ciAnversoUrl: anversoFinal,
        ciReversoUrl: reversoFinal,
        nit,
        licenciaTuristica,
        comprobanteDomicilioUrl: domicilioFinal,
        verificado: verif,
        estadoVerificacion: verif ? 'VERIFICADO' : 'PENDIENTE_REVISION'
      });

      if (perfil.id) {
        try {
          const partes = nombre.trim().split(' ');
          const nom = partes[0] || nombre;
          const ape = partes.slice(1).join(' ') || '';
          await fetch(`${API_BASE_URL}/api/v1/usuarios/${perfil.id}/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nom, apellido: ape, telefono })
          });
        } catch {}
      }

      onMostrarToast('Guardado con éxito.');
    } catch (err: any) {
      console.error('Error al guardar cambios:', err);
      onMostrarToast('Error al guardar los documentos. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      
      {/* 1. Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
            Mi Perfil de Anfitrión
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Administra tu información pública, foto, credenciales de contacto y documentación de verificación legal
          </p>
        </div>

        <div className="flex items-center gap-2">
          {estaCompletamenteVerificado ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Anfitrión Verificado</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Verificación en Trámite ({porcentaje}%)</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleGuardarCambios} className="space-y-6">
        
        {/* 2. Tarjeta de Presentación y Foto de Perfil */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/20 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-3xl font-serif font-bold">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{nombre ? nombre.charAt(0).toUpperCase() : 'A'}</span>
              )}
            </div>

            {/* Botón flotante para subir foto */}
            <label
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md cursor-pointer transition flex items-center justify-center group-hover:scale-105"
              title="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleSubirAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
                {nombre || 'Nombre de Anfitrión'}
              </h2>
              {estaCompletamenteVerificado && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold self-center sm:self-auto">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  Identidad Oficial Validada
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ciudad}, {departamento} · Miembro verificado de la comunidad de anfitriones de Bolivia
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <span>{perfil.kpis.reputacion} Calificación</span>
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                {perfil.kpis.tasaOcupacion} Ocupación
              </span>
              <span className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">
                {perfil.kpis.huespedesActivos}
              </span>
            </div>

            {avatarUrl && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleEliminarAvatar}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Quitar foto actual</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Barra de Progreso de Verificación */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Nivel de Verificación del Anfitrión: {porcentaje}%
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              {cumplidosTotal} de {requisitos.length} requisitos completados
            </span>
          </div>

          {/* Barra segmentada de progreso */}
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                porcentaje === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px]">
            {requisitos.map((req, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                {req.cumplido ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                )}
                <span className={req.cumplido ? 'text-slate-700 dark:text-slate-200 font-medium' : 'text-slate-400'}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Sección: Información Personal & Contacto */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
              Datos Personales &amp; Contacto
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Información de contacto directo para coordinación con los viajeros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  required
                  placeholder="Tu nombre completo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="anfitrion@alojate.bo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono / Celular WhatsApp (+591):
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={telefono}
                  onChange={e => setTelefono(e.target.value)}
                  placeholder="+591 77012345"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departamento de Residencia:
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={departamento}
                  onChange={e => {
                    setDepartamento(e.target.value);
                    if (!ciudad || ciudad === departamento) {
                      setCiudad(e.target.value);
                    }
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {DEPARTAMENTOS_BOLIVIA.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Biografía / Presentación del Anfitrión:
              </label>
              <textarea
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Cuéntales a los viajeros sobre tu experiencia como anfitrión en Bolivia..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* 5. Sección: Documentación de Verificación Oficial (Requisitos) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0F172A] border border-blue-200/80 dark:border-blue-900/60 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-serif text-base font-bold text-slate-900 dark:text-white">
                  Requisitos para la Insignia de Anfitrión Verificado
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Valida tu identidad ciudadana, personería tributaria y domicilio legal en Bolivia
              </p>
            </div>

            <span className={`px-3 py-1 rounded-full font-bold text-xs self-start sm:self-auto ${
              estaCompletamenteVerificado
                ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
            }`}>
              {estaCompletamenteVerificado ? '100% Verificado' : `${porcentaje}% Completado`}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* 1. Cédula de Identidad */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  1. Cédula de Identidad (CI)
                </span>
                {reqCI && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Registrado</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">Número de CI:</label>
                  <input
                    type="text"
                    value={ciNumero}
                    onChange={e => setCiNumero(e.target.value)}
                    placeholder="Ej. 5829104"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Expedido:</label>
                  <select
                    value={ciExpedido}
                    onChange={e => setCiExpedido(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    {EXPEDIDOS_CI.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Carga de Fotos Anverso y Reverso con Miniaturas */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="space-y-1.5">
                  <label className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{ciAnversoUrl ? '✓ CI Anverso' : 'Subir Anverso'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => handleSubirDocumento('ciAnverso', e)}
                      className="hidden"
                    />
                  </label>
                  {ciAnversoUrl && (
                    <div className="h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                      <img
                        src={ciAnversoUrl}
                        alt="CI Anverso"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                        Anverso
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{ciReversoUrl ? '✓ CI Reverso' : 'Subir Reverso'}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={e => handleSubirDocumento('ciReverso', e)}
                      className="hidden"
                    />
                  </label>
                  {ciReversoUrl && (
                    <div className="h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group">
                      <img
                        src={ciReversoUrl}
                        alt="CI Reverso"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white font-mono">
                        Reverso
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. NIT / Registro Tributario */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  2. Número de Identificación Tributaria (NIT)
                </span>
                {reqNIT && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Activo</span>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Número de NIT o Régimen:</label>
                <input
                  type="text"
                  value={nit}
                  onChange={e => setNit(e.target.value)}
                  placeholder="Ej. 5829104018"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-1">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Validado ante el Servicio de Impuestos Nacionales</span>
                </span>
              </div>
            </div>

            {/* 3. Licencia Turística */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  3. Licencia o Registro Turístico Municipal / SIARTEC
                </span>
                {reqLicencia && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Acreditado</span>
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Código de Registro:</label>
                <input
                  type="text"
                  value={licenciaTuristica}
                  onChange={e => setLicenciaTuristica(e.target.value)}
                  placeholder="Ej. LIC-TUR-SCZ-2024-089"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                Otorgado por el Gobierno Autónomo Municipal o Viceministerio de Turismo
              </p>
            </div>

            {/* 4. Comprobante de Domicilio */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  4. Factura de Servicio Básico / Domicilio
                </span>
                {reqDomicilio && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cargado</span>
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Factura de electricidad (CRE, DELAPAZ, ELFEC) o agua potable a tu nombre
              </p>

              <label className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{comprobanteDomicilioUrl ? '✓ Factura cargada (Clic para cambiar)' : 'Subir Factura de Luz/Agua'}</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={e => handleSubirDocumento('domicilio', e)}
                  className="hidden"
                />
              </label>

              {comprobanteDomicilioUrl && (
                <div className="h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
                  <img
                    src={comprobanteDomicilioUrl}
                    alt="Factura Domicilio"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[9px] text-white">
                    Factura de Servicio Básico
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* 6. Botón de Guardar Perfil */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Perfil y Credenciales de Verificación</span>
          </button>
        </div>

      </form>

    </div>
  );
};
