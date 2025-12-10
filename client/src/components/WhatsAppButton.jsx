import React from 'react';
import { MessageSquare } from 'lucide-react';

const WhatsAppButton = () => {
    const phoneNumber = '56934466174';
    const message = 'Hola! Quisiera hacer una consulta.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
            <MessageSquare size={24} />
        </a>
    );
};

export default WhatsAppButton;