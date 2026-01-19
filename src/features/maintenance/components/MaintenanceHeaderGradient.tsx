import React from 'react';

export const MaintenanceHeaderGradient: React.FC = () => (
  <div className="relative mb-6">
    <div className="absolute inset-0 h-32 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 opacity-80 rounded-2xl blur-sm" style={{ zIndex: 0 }} />
    <div className="relative z-10 flex items-center h-32 px-6">
      <h2 className="text-2xl font-extrabold text-white drop-shadow-lg">Bakım & Parçalar</h2>
    </div>
  </div>
);
