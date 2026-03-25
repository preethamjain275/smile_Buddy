import { useState, useEffect } from 'react';
import { supabase, RoastMessage, SmileDetectedMessage, AppSettings } from '../lib/supabaseClient';

export const useAppData = () => {
  const [roastMessages, setRoastMessages] = useState<RoastMessage[]>([]);
  const [smileMessages, setSmileMessages] = useState<SmileDetectedMessage[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [roasts, smiles, appSettings] = await Promise.all([
        supabase.from('roast_messages').select('*').eq('is_active', true).order('level').order('order_index'),
        supabase.from('smile_detected_messages').select('*').eq('is_active', true).order('order_index'),
        supabase.from('app_settings').select('*'),
      ]);

      if (roasts.data) setRoastMessages(roasts.data);
      if (smiles.data) setSmileMessages(smiles.data);

      if (appSettings.data) {
        const settingsObj: Record<string, unknown> = {};
        appSettings.data.forEach((setting: AppSettings) => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(settingsObj);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return { roastMessages, smileMessages, settings, loading, reloadData: loadData };
};
