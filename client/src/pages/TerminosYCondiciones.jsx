import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TerminosYCondiciones = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/registro-cliente'); // Redirige a la página de registro de cliente
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto">
      {/* Botón de volver atrás */}
      <div className="mb-6">
        <Button
          onClick={handleGoBack}
          variant="outline"
          className="flex items-center gap-2 text-black border-black hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Volver atrás
        </Button>
      </div>

      {/* Contenido de los términos */}
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-4">Política de Privacidad y Tratamiento de Datos Personales</h1>

        <h2 className="text-2xl font-bold mt-6 mb-2">1. Identificación del responsable del tratamiento de datos</h2>
        <p><strong>Responsable:</strong> Carolina López, fundadora de TMM Bienestar y Conexión</p>
        <p><strong>Correo de contacto:</strong> carolina@tmm.cl</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">2. Tipos de datos personales recopilados</h2>
        <ul className="list-disc ml-6">
          <li>Nombre completo</li>
          <li>Correo electrónico</li>
          <li>Número de teléfono (WhatsApp)</li>
          <li>Intereses (opcional)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">3. Finalidad del uso de los datos</h2>
        <p>Los datos personales recopilados se utilizan exclusivamente para:</p>
        <ul className="list-disc ml-6">
          <li><strong>Gestión de inscripciones:</strong> procesamiento de inscripción a talleres, confirmación de participación y envío de recordatorios.</li>
          <li><strong>Comunicaciones de servicio:</strong> envío de correos electrónicos con detalles de los talleres.</li>
          <li><strong>Gestión de clientes (CRM):</strong> manejo del historial de participación para ofrecer experiencias personalizadas.</li>
          <li><strong>Comunicaciones de marketing (opcional):</strong> envío de información sobre futuros talleres, promociones o novedades, únicamente con consentimiento explícito.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">4. Consentimiento</h2>
        <p>Al marcar la casilla "He leído y acepto la Política de Privacidad" en el formulario de inscripción, el usuario otorga consentimiento explícito para la recopilación y uso de sus datos conforme a lo descrito en el punto anterior.</p>

        <h2 className="text-2xl font-bold mt-6 mb-2">5. Seguridad y confidencialidad</h2>
        <p>TMM Bienestar y Conexión se compromete a:</p>
        <ul className="list-disc ml-6">
          <li>Mantener estricta confidencialidad de la información personal.</li>
          <li>No compartir ni vender los datos personales a terceros.</li>
          <li>Almacenar los datos de forma segura y cifrada.</li>
          <li>Utilizar imágenes subidas (como fotos de talleres) únicamente con fines promocionales, siempre que no estén vinculadas a datos personales.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">6. Derechos del usuario (Derechos ARCO)</h2>
        <p>Los usuarios pueden ejercer los siguientes derechos en cualquier momento:</p>
        <ul className="list-disc ml-6">
          <li><strong>Acceso:</strong> solicitar acceso a los datos personales almacenados.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación (Derecho al olvido):</strong> solicitar la eliminación de sus datos personales.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-6 mb-2">Cumplimiento legal</h2>
        <p>Esta política cumple con lo establecido en la Ley N° 19.628 sobre Protección de la Vida Privada en Chile.</p>
      </div>
    </div>
  );
};

export default TerminosYCondiciones;
