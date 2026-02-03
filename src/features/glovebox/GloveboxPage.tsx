import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { FileText, Plus, Search } from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import { AddDocumentModal } from './AddDocumentModal';

export const GloveboxPage: React.FC = () => {
    const { documents } = useAppStore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDocs = documents.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl shadow-lg text-white flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="w-7 h-7" />
                        Araç Cüzdanı (Dijital Torpido)
                    </h1>
                    <p className="text-blue-100 opacity-90 mt-1">
                        Ruhsat, sigorta ve diğer belgelerinizi burada saklayın.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-white text-blue-600 p-3 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 hover:bg-blue-50"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Belge ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 bg-white dark:bg-gray-800 border-none rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 py-3 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm flex items-center justify-between px-4">
                    <span className="text-gray-500 dark:text-gray-400">Toplam Belge</span>
                    <span className="font-bold text-2xl text-gray-900 dark:text-white">{documents.length}</span>
                </div>
            </div>

            {/* Document Grid */}
            {filteredDocs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocs.map(doc => (
                        <DocumentCard key={doc.id} document={doc} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Henüz belge yok</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        İlk belgenizi ekleyerek başlayın.
                    </p>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-bold transition-colors"
                    >
                        Belge Ekle
                    </button>
                </div>
            )}

            {isAddModalOpen && <AddDocumentModal onClose={() => setIsAddModalOpen(false)} />}
        </div>
    );
};
