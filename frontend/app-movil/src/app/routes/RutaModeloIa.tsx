// ======================================================================
// ARCHIVO: app/routes/RutaModeloIa.tsx      IMPORTANCIA: ★ POCA
// QUÉ ES: La conexión de la pantalla "Agente inteligente": le entrega el estado y las acciones de descargar, activar y borrar.
// PARA QUÉ SIRVE: Que la ruta solo conecte; las reglas viven en el hook useModeloIa del feature ia (antes estaban aquí).
// SIN ÉL: La pantalla no tendría de dónde sacar sus datos.
// NO VA AQUÍ: La descarga ni el manejo de errores (es useModeloIa) ni el dibujo (es PantallaModeloIa).
// ======================================================================

import { PantallaModeloIa, useModeloIa } from '../../features/ia';
import { Marco } from '../Marco';
import { volverSeguro } from '../navigationHelpers';
import type { PropsRaiz } from '../routeTypes';

export function RutaModeloIa({ navigation }: PropsRaiz<'ModeloIa'>) {
  const model = useModeloIa();
  return (
    <Marco titulo="Agente inteligente" alVolver={volverSeguro(navigation)}>
      <PantallaModeloIa
        estado={model.state}
        progreso={model.progress}
        tamanoMb={model.sizeMb}
        error={model.error}
        alDescargar={model.download}
        alActivar={model.activate}
        alEliminar={model.remove}
      />
    </Marco>
  );
}
