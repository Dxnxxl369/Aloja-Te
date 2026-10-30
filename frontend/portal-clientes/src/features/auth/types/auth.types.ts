export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistroData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  ci?: string;
  ciComplemento?: string;
  ciExpedido?: string;
  telefonoEmergencia?: string;
  direccionDomicilio?: string;
  departamentoRadicatoria?: string;
  bancoNombre?: string;
  numeroCuentaBancaria?: string;
  rol: 'CLIENTE' | 'ANFITRION';
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: 'CLIENTE' | 'ANFITRION' | 'ADMINISTRADOR';
    tipoCuenta: string;
  };
}
