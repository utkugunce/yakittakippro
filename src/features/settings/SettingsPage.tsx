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
        <div className="animate-in fade-in duration-500 space-y-6">
            <ThemeSettings
                isDarkMode={isDarkMode}
                onToggleTheme={onToggleTheme}
                currentAccent={accentColor}
                onChangeAccent={onChangeAccent}
            />
            <CloudSync
                logs={logs}
                maintenanceItems={maintenanceItems}
                vehicles={vehicles}
                onImportLogs={importLogs}
                onImportMaintenance={(items) => items.forEach(addMaintenance)}
                onImportVehicles={setVehicles}
            />
            <NotificationSettings maintenanceItems={maintenanceItems} currentOdometer={currentOdometer} />
            <DataManagement logs={logs} onImport={importLogs} onClear={clearLogs} />
        </div>
    );
};
