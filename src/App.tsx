/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wrench, 
  Gauge, 
  Settings, 
  ShieldCheck, 
  AlertCircle, 
  Banknote, 
  ArrowRight, 
  RefreshCcw, 
  Bike,
  Heart,
  Calendar,
  Info,
  ChevronRight,
  CheckCircle2,
  BellRing,
  History
} from 'lucide-react';
import { analyzeMotorcycle } from './services/geminiService';
import { DriveCareAnalysis, UserMotorData, Brand, MotorType } from './types';

type Step = 'welcome' | 'register' | 'loading' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [motorData, setMotorData] = useState<UserMotorData>({
    motor: '',
    brand: 'Honda',
    type: 'matic',
    current_km: 0
  });
  const [analysis, setAnalysis] = useState<DriveCareAnalysis | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [reminders, setReminders] = useState<Record<string, string>>({}); // id -> date
  const [isEditingKm, setIsEditingKm] = useState(false);
  const [tempKm, setTempKm] = useState(0);
  const [loadingText, setLoadingText] = useState('Mendaftarkan motor kamu...');

  const handleRegister = useCallback(async (customKm?: number) => {
    setStep('loading');
    if (!customKm) {
      setCompletedTaskIds(new Set());
      setReminders({});
    }
    
    const targetKm = customKm || motorData.current_km;
    
    const loadingMessages = [
      'Menghubungkan ke database DriveCare...',
      'Menganalisis identitas motor...',
      'Menciptakan jadwal servis rutin...',
      'DriveCare siap melayani...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setLoadingText(loadingMessages[msgIndex]);
      msgIndex = (msgIndex + 1) % loadingMessages.length;
    }, 2000);

    try {
      const input = `Identitas Motor Terdaftar: ${motorData.brand} ${motorData.motor}, tipe ${motorData.type}, odometer ${targetKm}km. ${motorData.last_service_km ? `KM terakhir ganti oli: ${motorData.last_service_km}km.` : ''}`;
      const result = await analyzeMotorcycle(input);
      setAnalysis(result);
      setStep('dashboard');
      setIsEditingKm(false);
    } catch (error) {
      console.error(error);
      alert('Maaf, terjadi kesalahan. Coba lagi ya.');
      setStep('register');
    } finally {
      clearInterval(interval);
    }
  }, [motorData]);

  const toggleComplete = (id: string) => {
    const newSet = new Set(completedTaskIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedTaskIds(newSet);
  };

  const setReminderDate = (id: string, date: string) => {
    setReminders(prev => {
      const next = { ...prev };
      if (!date) delete next[id];
      else next[id] = date;
      return next;
    });
  };

  const logout = () => {
    setStep('welcome');
    setAnalysis(null);
    setMotorData({
      motor: '',
      brand: 'Honda',
      type: 'matic',
      current_km: 0
    });
    setCompletedTaskIds(new Set());
    setReminders({});
    setIsEditingKm(false);
  };

  return (
    <div className="min-h-screen font-sans selection:bg-brand-orange selection:text-white text-left">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => step === 'dashboard' ? null : setStep('welcome')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange text-white shadow-lg shadow-brand-orange/20">
              <Wrench size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Drive<span className="text-brand-orange">Care</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-widest text-slate-500">
            {step === 'dashboard' ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline font-bold text-slate-900">{motorData.motor}</span>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 transition-colors hover:bg-slate-200 text-[10px] font-black"
                >
                  <RefreshCcw size={12} />
                  LOGOUT
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="mb-6 inline-flex rounded-2xl bg-brand-blue/10 px-4 py-2 text-sm font-semibold text-brand-blue">
                Maintenance Manager Account
              </div>
              <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl text-center">
                Akun Servis Motor <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-red-500">Pribadi</span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 text-center">
                Daftarkan motor kamu dan gunakan sebagai identitas untuk mengelola jadwal servis dan peralatan rutin.
              </p>
              
              <div className="grid gap-6 sm:grid-cols-3 mb-12 text-left">
                {[
                  { icon: <CheckCircle2 className="text-green-600" />, title: "Identitas Akun", desc: "Motor kamu menjadi identitas dashboard servis pribadi." },
                  { icon: <Settings className="text-brand-orange" />, title: "Checklist Rutin", desc: "Tandai peralatan mana yang sudah rutin diganti." },
                  { icon: <BellRing className="text-blue-600" />, title: "Smart Reminder", desc: "Pasang pengingat otomatis untuk servis bulan depan." },
                ].map((feature, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 transition-transform hover:-translate-y-1">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                      {feature.icon}
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">{feature.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep('register')}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:pr-10 active:scale-95"
              >
                Daftar Akun Motor
                <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
              </button>
            </motion.div>
          )}

          {step === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl"
            >
              <div className="mb-8 text-center uppercase tracking-widest text-sm font-bold text-slate-400">
                Pendaftaran Unit Motor
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Merek Kendaraan</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        value={motorData.brand}
                        onChange={(e) => setMotorData({...motorData, brand: e.target.value as Brand})}
                      >
                        {['Honda', 'Yamaha', 'Suzuki', 'Kawasaki', 'Lainnya'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">Tipe</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        value={motorData.type}
                        onChange={(e) => setMotorData({...motorData, type: e.target.value as MotorType})}
                      >
                        {['matic', 'manual', 'sport'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Nama/Model Motor</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Honda Vario 160"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange text-left"
                      value={motorData.motor}
                      onChange={(e) => setMotorData({...motorData, motor: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">KM Odometer</label>
                      <input 
                        type="number"
                        placeholder="12000"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange text-left"
                        value={motorData.current_km || ''}
                        onChange={(e) => setMotorData({...motorData, current_km: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700">KM Oli Terakhir</label>
                      <input 
                        type="number"
                        placeholder="Opsional"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange text-left"
                        value={motorData.last_service_km || ''}
                        onChange={(e) => setMotorData({...motorData, last_service_km: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={!motorData.motor || motorData.current_km <= 0}
                    className="w-full rounded-xl bg-brand-orange py-4 font-bold text-white shadow-lg shadow-brand-orange/30 transition-all hover:opacity-90 active:scale-95 disabled:grayscale disabled:opacity-50"
                  >
                    Daftar Akun Motor
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex min-h-[60vh] flex-col items-center justify-center text-center"
            >
              <div className="relative mb-8">
                <div className="h-24 w-24 rounded-full border-8 border-slate-100 border-t-brand-orange animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wrench className="text-brand-orange" size={32} />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{loadingText}</h2>
            </motion.div>
          )}

          {step === 'dashboard' && analysis && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Profile Card */}
              <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-brand-orange/20 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-left w-full">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="rounded-full bg-brand-orange/20 px-2 py-0.5 text-[10px] font-bold text-brand-orange border border-brand-orange/30 uppercase tracking-widest">
                         Identitas Aktif
                       </span>
                    </div>
                    <h2 className="text-3xl font-black">{analysis.motor}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 capitalize whitespace-nowrap">
                      <span>{analysis.brand} • {analysis.type}</span>
                      <div className="flex items-center gap-2">
                        <span>•</span>
                        {isEditingKm ? (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              className="w-24 rounded bg-white/10 border border-white/20 px-2 py-0.5 text-xs text-white focus:outline-none focus:border-brand-orange"
                              value={tempKm}
                              onChange={(e) => setTempKm(parseInt(e.target.value) || 0)}
                              autoFocus
                            />
                            <button 
                              onClick={() => {
                                if (tempKm < analysis.estimated_km) {
                                  alert(`Kilometer baru (${tempKm}) tidak boleh lebih kecil dari kilometer saat ini (${analysis.estimated_km})!`);
                                  return;
                                }
                                setMotorData({...motorData, current_km: tempKm});
                                handleRegister(tempKm);
                              }}
                              className="text-[10px] font-bold text-brand-orange underline"
                            >
                              UPDATE
                            </button>
                            <button 
                              onClick={() => setIsEditingKm(false)}
                              className="text-[10px] font-bold text-slate-500"
                            >
                              BATAL
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setTempKm(analysis.estimated_km);
                              setIsEditingKm(true);
                            }}
                            className="group flex items-center gap-1.5 hover:text-white transition-colors"
                          >
                            <span className="font-mono">{analysis.estimated_km.toLocaleString()} KM</span>
                            <RefreshCcw size={10} className="opacity-50 group-hover:opacity-100" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-center">
                       <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-1">Health Score</p>
                       <span className={`text-4xl font-black ${analysis.health_score > 80 ? 'text-green-500' : analysis.health_score > 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                         {analysis.health_score}
                       </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 uppercase text-xs tracking-widest flex items-center gap-2 text-left">
                    <Settings className="text-brand-orange" size={16} />
                    Checklist Perawatan Rutin
                  </h3>
                  <div className="text-[10px] font-bold text-slate-400">
                    {completedTaskIds.size} / {analysis.maintenance_checklist.length} Selesai
                  </div>
                </div>

                <div className="grid gap-4">
                  {analysis.maintenance_checklist.map((item) => {
                    const isDone = completedTaskIds.has(item.id);
                    const reminderDate = reminders[item.id];
                    return (
                      <motion.div 
                        key={item.id}
                        layout
                        className={`rounded-2xl border p-5 transition-all ${
                          isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex gap-4 text-left">
                            <div className={`mt-1.5 h-3 w-3 rounded-full shrink-0 ${
                              isDone ? 'bg-slate-300' :
                              item.status === 'safe' ? 'bg-green-500' :
                              item.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <div>
                              <h4 className={`font-bold text-left ${isDone ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.name}</h4>
                              <p className="text-sm text-slate-600 mt-1 text-left">{item.recommendation}</p>
                              {item.last_service && (
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold text-left">{item.last_service}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <button
                              onClick={() => toggleComplete(item.id)}
                              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[10px] font-black uppercase transition-all
                                ${isDone 
                                  ? 'bg-green-100 text-green-700 border border-green-200' 
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-green-500 hover:text-green-600'}
                              `}
                            >
                              <CheckCircle2 size={14} />
                              {isDone ? 'Selesai' : 'Tandai Selesai'}
                            </button>
                            
                            <div className="relative flex items-center gap-2">
                               <input 
                                 type="date"
                                 className={`rounded-full px-3 py-1.5 text-[10px] font-bold border focus:outline-none transition-all
                                   ${reminderDate 
                                     ? 'bg-brand-orange text-white border-brand-orange' 
                                     : 'bg-slate-100 text-slate-500 border-slate-100 hover:bg-slate-200'}
                                 `}
                                 value={reminderDate || ''}
                                 onChange={(e) => setReminderDate(item.id, e.target.value)}
                                 title="Atur pengingat servis"
                               />
                               {reminderDate && <button onClick={() => setReminderDate(item.id, '')} className="text-slate-400 hover:text-red-500"><AlertCircle size={14}/></button>}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Status Summary */}
              {(Object.keys(reminders).length > 0 || completedTaskIds.size > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border-2 border-dashed border-slate-200 p-8"
                >
                  <div className="flex items-center gap-2 mb-6 font-bold text-slate-900 uppercase text-xs tracking-widest text-left">
                    <History size={16} className="text-slate-400" />
                    Status Akun Perawatan
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 text-left">
                    <div className="text-left">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Telah Diganti Rutin</h5>
                      {completedTaskIds.size === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada item yang ditandai.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2 justify-start">
                          {Array.from(completedTaskIds).map(id => {
                            const name = analysis.maintenance_checklist.find(x => x.id === id)?.name;
                            return (
                              <span key={id} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 border border-green-100">
                                {name} sudah rutin
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest text-[#f97316]">Pengingat Servis</h5>
                      {Object.keys(reminders).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada pengingat dipasang.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {Object.entries(reminders).map(([id, date]) => {
                            const name = analysis.maintenance_checklist.find(x => x.id === id)?.name;
                            return (
                              <span key={id} className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 border border-orange-100 flex items-center justify-between">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {name}</span>
                                <span className="font-mono opacity-70">{new Date(date as string).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="rounded-2xl bg-brand-orange/5 p-6 flex flex-col sm:flex-row items-center gap-4 border border-brand-orange/10">
                <ShieldCheck className="text-brand-orange shrink-0" size={24} />
                <p className="text-sm font-medium text-slate-700 italic leading-relaxed text-center sm:text-left">
                  "Safety First: {analysis.safety_tip}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-2xl p-6">
                   <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                     <Info size={14} /> Resume Sistem
                   </h4>
                   <p className="text-sm text-slate-600 leading-relaxed italic text-left">
                     {analysis.summary}
                   </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center border-t border-slate-100 mt-12 bg-white">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          Personalized Maintenance Manager • DriveCare ID
        </p>
      </footer>
    </div>
  );
}

