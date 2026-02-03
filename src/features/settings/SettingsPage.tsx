import React from 'react';
import { AccentColor } from '../../types';
import { ThemeSettings } from './ThemeSettings';
import { CloudSync } from './CloudSync';
import { NotificationSettings } from './NotificationSettings';
import { DataManagement } from './DataManagement';
import { useAppStore } from '../../stores/appStore';

interface SettingsPageProps {
    isDarkMode: boolean;
    accentColor: AccentColor;
    onToggleTheme: () => void;
    onChangeAccent: (color: AccentColor) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
    isDarkMode,
    accentColor,
    onToggleTheme,
    onChangeAccent
}) => {
    const {
        logs, maintenanceItems, vehicles,
        importLogs, addMaintenance, setVehicles, clearLogs
    } = useAppStore();

    const currentOdometer = logs.length > 0 ? Math.max(...logs.map(l => l.currentOdometer)) : 0;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

            {/* Theme & Sync */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThemeSettings
                    isDarkMode={isDarkMode}
                    onToggleTheme={onToggleTheme}
                    currentAccent={accentColor}
                    onChangeAccent={onChangeAccent}
                />

                <div className="space-y-6">
                    <CloudSync
                        logs={logs}
                        maintenanceItems={maintenanceItems}
                        vehicles={vehicles}
                        onImportLogs={importLogs}
                        onImportMaintenance={(items) => items.forEach(addMaintenance)}
                        onImportVehicles={setVehicles}
                    />
                    <NotificationSettings maintenanceItems={maintenanceItems} currentOdometer={currentOdometer} />
                </div>
            </div>

            {/* Data Management */}
            <DataManagement logs={logs} onImport={importLogs} onClear={clearLogs} />
        </div>
    );
};
