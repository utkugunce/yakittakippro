import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Supabase configuration
// Users need to set these in their Vercel environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create client only if configured
export const supabase: SupabaseClient | null =
    supabaseUrl && supabaseAnonKey
        ? createClient(supabaseUrl, supabaseAnonKey)
        : null;

export const isSupabaseConfigured = (): boolean => {
    return Boolean(supabaseUrl && supabaseAnonKey);
};

// Database types
export interface UserData {
    id?: number;
    user_id: string;
    logs: string; // JSON string
    maintenance_items: string; // JSON string
    vehicles: string; // JSON string
    monthly_budget: number;
    updated_at: string;
}

// Helper functions
export const getCurrentUser = async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
};

// Data sync functions
export const saveToCloud = async (data: {
    logs: any[];
    maintenanceItems: any[];
    vehicles: any[];
    monthlyBudget: number;
}): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const userData: Omit<UserData, 'id'> = {
        user_id: user.id,
        logs: JSON.stringify(data.logs),
        maintenance_items: JSON.stringify(data.maintenanceItems),
        vehicles: JSON.stringify(data.vehicles),
        monthly_budget: data.monthlyBudget,
        updated_at: new Date().toISOString()
    };

    const { error } = await supabase
        .from('user_data')
        .upsert(userData, { onConflict: 'user_id' });

    if (error) {
        console.error('Save to cloud error:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
};

export const loadFromCloud = async (): Promise<{
    success: boolean;
    data?: {
        logs: any[];
        maintenanceItems: any[];
        vehicles: any[];
        monthlyBudget: number;
    };
    error?: string;
}> => {
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not logged in' };

    const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            // No data found - not an error, just empty
            return { success: true, data: { logs: [], maintenanceItems: [], vehicles: [], monthlyBudget: 0 } };
        }
        console.error('Load from cloud error:', error);
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: {
            logs: JSON.parse(data.logs || '[]'),
            maintenanceItems: JSON.parse(data.maintenance_items || '[]'),
            vehicles: JSON.parse(data.vehicles || '[]'),
            monthlyBudget: data.monthly_budget || 0
        }
    };
};
