import React from 'react';
import { VehicleDocument } from '../../types';
import { Calendar, FileText, AlertTriangle, Trash2, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { useAppStore } from '../../stores/appStore';

interface DocumentCardProps {
    document: VehicleDocument;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
    const { deleteDocument } = useAppStore();

    const isExpired = document.expiryDate ? new Date(document.expiryDate) < new Date() : false;
    const isExpiringSoon = document.expiryDate
        ? new Date(document.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow relative group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${isExpired ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                            isExpiringSoon ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        }`}>
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{document.title}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {document.type === 'license' ? 'Ruhsat' :
                                document.type === 'insurance' ? 'Sigorta' :
                                    document.type === 'inspection' ? 'Muayene' : 'Diğer'}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (confirm('Belgeyi silmek istediğinize emin misiniz?')) {
                            deleteDocument(document.id);
                        }
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {document.expiryDate && (
                <div className={`flex items-center gap-2 mb-3 text-sm ${isExpired ? 'text-red-600 font-bold' :
                        isExpiringSoon ? 'text-orange-600 font-medium' :
                            'text-gray-600 dark:text-gray-300'
                    }`}>
                    <Calendar className="w-4 h-4" />
                    <span>Son Geçerlilik: {formatDate(document.expiryDate)}</span>
                    {isExpired && <AlertTriangle className="w-4 h-4" />}
                </div>
            )}

            {document.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                    {document.notes}
                </p>
            )}

            {document.photoUrl ? (
                <div className="relative rounded-lg overflow-hidden h-32 bg-gray-100 dark:bg-gray-900 group-hover:opacity-90 transition-opacity cursor-pointer" onClick={() => window.open(document.photoUrl, '_blank')}>
                    <img src={document.photoUrl} alt={document.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-6 h-6 text-white" />
                    </div>
                </div>
            ) : (
                <div className="h-32 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 text-sm">
                    Fotoğraf Yok
                </div>
            )}
        </div>
    );
};
