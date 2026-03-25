import { useState, useEffect } from 'react';
import { supabase, RoastMessage, SmileDetectedMessage } from '../lib/supabaseClient';
import { Settings, MessageSquare, Palette, Clock, Volume2, Plus, Trash2, Save } from 'lucide-react';

interface AdminPanelProps {
  onDataUpdate: () => void;
}

export const AdminPanel = ({ onDataUpdate }: AdminPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'smile' | 'colors' | 'timing'>('messages');
  const [roastMessages, setRoastMessages] = useState<RoastMessage[]>([]);
  const [smileMessages, setSmileMessages] = useState<SmileDetectedMessage[]>([]);
  const [themeColors, setThemeColors] = useState({
    level0: '#00ff88',
    level1: '#ffdd00',
    level2: '#ff9900',
    level3: '#ff4444',
    level4: '#ff00ff',
  });
  const [timingSettings, setTimingSettings] = useState({
    commentRotation: 3500,
    detectionInterval: 250,
    level0Max: 5000,
    level1Max: 15000,
    level2Max: 30000,
    level3Max: 60000,
  });
  const [detectionSettings, setDetectionSettings] = useState({
    smileThreshold: 0.65,
  });

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    const [roasts, smiles, settings] = await Promise.all([
      supabase.from('roast_messages').select('*').order('level').order('order_index'),
      supabase.from('smile_detected_messages').select('*').order('order_index'),
      supabase.from('app_settings').select('*'),
    ]);

    if (roasts.data) setRoastMessages(roasts.data);
    if (smiles.data) setSmileMessages(smiles.data);

    if (settings.data) {
      settings.data.forEach((setting) => {
        if (setting.key === 'themeColors') setThemeColors(setting.value as typeof themeColors);
        if (setting.key === 'timingSettings') setTimingSettings(setting.value as typeof timingSettings);
        if (setting.key === 'detectionSettings') setDetectionSettings(setting.value as typeof detectionSettings);
      });
    }
  };

  const saveRoastMessage = async (message: Partial<RoastMessage>) => {
    if (message.id) {
      await supabase.from('roast_messages').update(message).eq('id', message.id);
    } else {
      await supabase.from('roast_messages').insert([message]);
    }
    loadAllData();
    onDataUpdate();
  };

  const deleteRoastMessage = async (id: string) => {
    await supabase.from('roast_messages').delete().eq('id', id);
    loadAllData();
    onDataUpdate();
  };

  const saveSmileMessage = async (message: Partial<SmileDetectedMessage>) => {
    if (message.id) {
      await supabase.from('smile_detected_messages').update(message).eq('id', message.id);
    } else {
      await supabase.from('smile_detected_messages').insert([message]);
    }
    loadAllData();
    onDataUpdate();
  };

  const deleteSmileMessage = async (id: string) => {
    await supabase.from('smile_detected_messages').delete().eq('id', id);
    loadAllData();
    onDataUpdate();
  };

  const saveColors = async () => {
    await supabase
      .from('app_settings')
      .upsert({ key: 'themeColors', value: themeColors }, { onConflict: 'key' });
    onDataUpdate();
    alert('Colors saved!');
  };

  const saveTiming = async () => {
    await Promise.all([
      supabase.from('app_settings').upsert({ key: 'timingSettings', value: timingSettings }, { onConflict: 'key' }),
      supabase.from('app_settings').upsert({ key: 'detectionSettings', value: detectionSettings }, { onConflict: 'key' }),
    ]);
    onDataUpdate();
    alert('Settings saved!');
  };

  const addNewRoastMessage = () => {
    const newMessage: Partial<RoastMessage> = {
      level: 0,
      message: 'New roast message',
      audio_url: null,
      is_active: true,
      order_index: roastMessages.length,
    };
    saveRoastMessage(newMessage);
  };

  const addNewSmileMessage = () => {
    const newMessage: Partial<SmileDetectedMessage> = {
      message: 'New smile message!',
      audio_url: null,
      is_active: true,
      order_index: smileMessages.length,
    };
    saveSmileMessage(newMessage);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all z-50"
        title="Admin Panel"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-6 py-3 ${
                  activeTab === 'messages' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                <MessageSquare size={20} />
                Roast Messages
              </button>
              <button
                onClick={() => setActiveTab('smile')}
                className={`flex items-center gap-2 px-6 py-3 ${
                  activeTab === 'smile' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                <Volume2 size={20} />
                Smile Messages
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`flex items-center gap-2 px-6 py-3 ${
                  activeTab === 'colors' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                <Palette size={20} />
                Theme Colors
              </button>
              <button
                onClick={() => setActiveTab('timing')}
                className={`flex items-center gap-2 px-6 py-3 ${
                  activeTab === 'timing' ? 'bg-gray-800 text-white' : 'text-gray-400'
                }`}
              >
                <Clock size={20} />
                Timing & Detection
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Roast Messages by Level</h3>
                    <button
                      onClick={addNewRoastMessage}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                    >
                      <Plus size={20} />
                      Add Message
                    </button>
                  </div>

                  {[0, 1, 2, 3, 4].map((level) => (
                    <div key={level} className="bg-gray-800 rounded-lg p-4">
                      <h4 className="text-lg font-bold text-white mb-3">
                        Level {level} {['😊', '😐', '😤', '😡', '💀'][level]}
                      </h4>
                      <div className="space-y-2">
                        {roastMessages
                          .filter((msg) => msg.level === level)
                          .map((msg) => (
                            <div key={msg.id} className="flex gap-2 items-start">
                              <input
                                type="text"
                                value={msg.message}
                                onChange={(e) => {
                                  const updated = roastMessages.map((m) =>
                                    m.id === msg.id ? { ...m, message: e.target.value } : m
                                  );
                                  setRoastMessages(updated);
                                }}
                                onBlur={() => saveRoastMessage(msg)}
                                className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
                              />
                              <input
                                type="text"
                                value={msg.audio_url || ''}
                                onChange={(e) => {
                                  const updated = roastMessages.map((m) =>
                                    m.id === msg.id ? { ...m, audio_url: e.target.value } : m
                                  );
                                  setRoastMessages(updated);
                                }}
                                onBlur={() => saveRoastMessage(msg)}
                                placeholder="Audio URL"
                                className="w-48 px-3 py-2 bg-gray-700 text-white rounded text-sm"
                              />
                              <button
                                onClick={() => deleteRoastMessage(msg.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'smile' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">Smile Detected Messages</h3>
                    <button
                      onClick={addNewSmileMessage}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white"
                    >
                      <Plus size={20} />
                      Add Message
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                    {smileMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={msg.message}
                          onChange={(e) => {
                            const updated = smileMessages.map((m) =>
                              m.id === msg.id ? { ...m, message: e.target.value } : m
                            );
                            setSmileMessages(updated);
                          }}
                          onBlur={() => saveSmileMessage(msg)}
                          className="flex-1 px-3 py-2 bg-gray-700 text-white rounded"
                        />
                        <input
                          type="text"
                          value={msg.audio_url || ''}
                          onChange={(e) => {
                            const updated = smileMessages.map((m) =>
                              m.id === msg.id ? { ...m, audio_url: e.target.value } : m
                            );
                            setSmileMessages(updated);
                          }}
                          onBlur={() => saveSmileMessage(msg)}
                          placeholder="Audio URL"
                          className="w-48 px-3 py-2 bg-gray-700 text-white rounded text-sm"
                        />
                        <button
                          onClick={() => deleteSmileMessage(msg.id)}
                          className="p-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Theme Colors by Level</h3>
                  <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    {Object.entries(themeColors).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4">
                        <label className="text-white w-32">
                          {key.replace('level', 'Level ')}
                        </label>
                        <input
                          type="color"
                          value={value}
                          onChange={(e) =>
                            setThemeColors({ ...themeColors, [key]: e.target.value })
                          }
                          className="w-20 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            setThemeColors({ ...themeColors, [key]: e.target.value })
                          }
                          className="px-3 py-2 bg-gray-700 text-white rounded font-mono"
                        />
                        <div
                          className="w-full h-10 rounded"
                          style={{
                            backgroundColor: value,
                            boxShadow: `0 0 20px ${value}`,
                          }}
                        />
                      </div>
                    ))}
                    <button
                      onClick={saveColors}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white mt-6"
                    >
                      <Save size={20} />
                      Save Colors
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'timing' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">Timing & Detection Settings</h3>
                  <div className="bg-gray-800 rounded-lg p-6 space-y-4">
                    <div>
                      <label className="text-white block mb-2">Comment Rotation (ms)</label>
                      <input
                        type="number"
                        value={timingSettings.commentRotation}
                        onChange={(e) =>
                          setTimingSettings({
                            ...timingSettings,
                            commentRotation: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      />
                    </div>

                    <div>
                      <label className="text-white block mb-2">Detection Interval (ms)</label>
                      <input
                        type="number"
                        value={timingSettings.detectionInterval}
                        onChange={(e) =>
                          setTimingSettings({
                            ...timingSettings,
                            detectionInterval: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white block mb-2">Level 0 Max (ms)</label>
                        <input
                          type="number"
                          value={timingSettings.level0Max}
                          onChange={(e) =>
                            setTimingSettings({
                              ...timingSettings,
                              level0Max: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        />
                      </div>

                      <div>
                        <label className="text-white block mb-2">Level 1 Max (ms)</label>
                        <input
                          type="number"
                          value={timingSettings.level1Max}
                          onChange={(e) =>
                            setTimingSettings({
                              ...timingSettings,
                              level1Max: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        />
                      </div>

                      <div>
                        <label className="text-white block mb-2">Level 2 Max (ms)</label>
                        <input
                          type="number"
                          value={timingSettings.level2Max}
                          onChange={(e) =>
                            setTimingSettings({
                              ...timingSettings,
                              level2Max: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        />
                      </div>

                      <div>
                        <label className="text-white block mb-2">Level 3 Max (ms)</label>
                        <input
                          type="number"
                          value={timingSettings.level3Max}
                          onChange={(e) =>
                            setTimingSettings({
                              ...timingSettings,
                              level3Max: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-white block mb-2">
                        Smile Threshold (0-1, current: {detectionSettings.smileThreshold})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={detectionSettings.smileThreshold}
                        onChange={(e) =>
                          setDetectionSettings({
                            ...detectionSettings,
                            smileThreshold: parseFloat(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    <button
                      onClick={saveTiming}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white mt-6"
                    >
                      <Save size={20} />
                      Save Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
