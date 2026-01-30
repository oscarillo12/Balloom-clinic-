
import React, { useState, useEffect, useMemo } from 'react';
import { NutriFormData, NutritionPlan } from './types';
import { generateChileanPlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  
  const [formData, setFormData] = useState<NutriFormData>({
    name: '', age: 30, gender: 'female', stressLevel: 'moderate', smoking: false,
    alcoholConsumption: 'none', sedentaryHours: 8, consultationReason: '', 
    specificResultGoal: '', treatmentAspiration: '',
    insulinResistanceHistory: false,
    medicalConditions: ['Ninguna'], otherMedicalCondition: '', medications: '', familyHistory: '',
    weight: 0, height: 165, waistCircumference: 0,
    maxWeightReached: 0, minWeightAdult: 0, recentWeightFluctuations: '', targetWeight: 0,
    mainGoal: '', desiredBodyChange: '',
    postMealSleepiness: false, neckDarkSpots: false, skinTags: false, swollenFeet: false,
    abdominalBloating: 'none', frequentHeadaches: 'none',
    constipation: false, reflux: false, gas: false, otherSymptom: '',
    bathroomFrequency: '1', symptomsDescription: '',
    dietType: 'omnivore', specificDietPreference: 'Equilibrada', otherDietPreference: '', commonAllergies: [],
    favoriteFoods: '', dislikedFoods: '', allergies: '', cravings: 'none',
    emotionalEating: false, eatingEnvironment: 'casa',
    activityLevel: 'moderate', exerciseFrequency: 3, exerciseIntensity: 'moderate',
    exerciseType: '', fitnessLevel: 'intermediate',
    sleepQuality: 'good', sleepDuration: 7, waterIntake: 2,
    selfEfficacyLevel: 7, eatingDisorderScreening: { binging: false, purging: false, insulinMisuse: false },
    areasToSlim: [], areasToTone: [], fastingHours: 0, previousSupplements: '',
    socialSupport: '', diet24hRecall: ''
  });

  const liveBMI = useMemo(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightInMeters = formData.height / 100;
      return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return '0.0';
  }, [formData.weight, formData.height]);

  const specificGoals = [
    "Perder grasa corporal rápido",
    "Controlar la ansiedad por comer",
    "Reducir medidas en cintura",
    "Aprender a comer porciones pequeñas",
    "Mejorar salud digestiva",
    "Desinflamar el abdomen",
    "Cambio de hábitos de por vida"
  ];

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentario', desc: 'Poca o nula actividad física.' },
    { id: 'light', label: 'Ligero', desc: 'Actividad 1-2 veces por semana.' },
    { id: 'moderate', label: 'Moderado', desc: 'Actividad 3-4 veces por semana.' },
    { id: 'active', label: 'Activo', desc: 'Actividad diaria intensa.' }
  ];

  const dietDescriptions: Record<string, string> = {
    'Equilibrada': 'Proporciones sanas de todos los macronutrientes para bienestar general.',
    'Keto': 'Muy baja en carbohidratos y alta en grasas para quemar grasa.',
    'LowCarb': 'Reducción moderada de azúcares y harinas.',
    'Mediterranea': 'Rica en vegetales, pescados y grasas buenas.',
    'Vegana': 'Exclusión de todo producto animal.',
    'Ayuno Intermitente': 'Ciclos de ayuno (ej: 16/8) para mejorar sensibilidad a la insulina.',
    'Sin gluten y sin lácteos': 'Dieta antiinflamatoria diseñada para reducir hinchazón.'
  };

  const loadingMessages = [
    "Sincronizando con CBS Nutri-Core Chile...",
    "Analizando marcadores de saciedad...",
    "Buscando ingredientes de temporada en ferias locales...",
    "Calculando horarios óptimos para Balloon Slim...",
    "Estructurando opciones económicas y saludables...",
    "Finalizando plan maestro personalizado..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async () => {
    if (!formData.name.trim() || formData.weight <= 0 || formData.height <= 0) {
      setError("Por favor, completa los datos básicos (Nombre, Peso y Altura).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generateChileanPlan(formData);
      setPlan(result);
      setActiveDayIdx(0);
    } catch (err: any) {
      console.error(err);
      setError("Error al conectar con el servidor Balloom. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const Logo = () => (
    <div className="flex flex-col items-center">
      <div className="text-[11px] font-black text-[#4B2C69] tracking-[0.2em] uppercase mb-1">CONTROL</div>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#E6E2D3" strokeWidth="1" />
          <path d="M50 5 C 75 5, 95 25, 95 50 C 95 75, 75 95, 50 95 C 25 95, 5 75, 5 50 C 5 25, 25 5, 50 5" fill="none" stroke="#4B2C69" strokeWidth="4" />
          <text x="50" y="58" fontFamily="Plus Jakarta Sans" fontSize="32" fontWeight="900" textAnchor="middle" fill="#4B2C69">B</text>
          <text x="50" y="72" fontFamily="Plus Jakarta Sans" fontSize="8" fontWeight="800" textAnchor="middle" fill="#4B2C69" letterSpacing="2">CBS</text>
          <circle cx="85" cy="40" r="4" fill="#4B2C69" />
        </svg>
      </div>
      <div className="text-[12px] font-black text-[#4B2C69] tracking-[0.1em] uppercase mt-1 relative">
        BALLOOM SLIM
        <div className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[#C5A059]"></div>
      </div>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-id-card text-[#4B2C69]"></i> 1. Identificación y Objetivos
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nombre Completo</label>
                <input className="w-full bg-slate-50 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#4B2C69]/20" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-4 py-4 border-y border-slate-100">
                <label className="text-[10px] font-black text-[#4B2C69] uppercase tracking-widest block">¿Qué resultado buscas lograr?</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {specificGoals.map(goal => (
                    <button key={goal} onClick={() => setFormData({...formData, specificResultGoal: goal})} className={`p-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${formData.specificResultGoal === goal ? 'bg-[#4B2C69] text-white border-[#4B2C69]' : 'bg-white text-slate-400 border-slate-200'}`}>{goal}</button>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-[#4B2C69] uppercase tracking-widest block mb-1">¿A qué aspiras con este tratamiento?</label>
                <textarea className="w-full bg-slate-50 border p-3 rounded-xl text-xs h-20 outline-none" placeholder="Ej: Sentirme más liviana, recuperar mi ropa anterior..." value={formData.treatmentAspiration} onChange={e => setFormData({...formData, treatmentAspiration: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Edad</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Ansiedad / Estrés</label>
                <select className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.stressLevel} onChange={e => setFormData({...formData, stressLevel: e.target.value as any})}>
                  <option value="low">Bajo</option>
                  <option value="moderate">Moderado</option>
                  <option value="high">Alto</option>
                  <option value="extreme">Extremo</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-ruler-combined text-[#4B2C69]"></i> 2. Antropometría
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso (kg)</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl font-black" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estatura (cm)</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.height || ''} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Cintura (cm)</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.waistCircumference || ''} onChange={e => setFormData({...formData, waistCircumference: Number(e.target.value)})} />
              </div>
              <div className="col-span-full bg-[#4B2C69] p-5 rounded-2xl text-white flex justify-between items-center shadow-lg">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-60">IMC Actual</p>
                  <p className="text-3xl font-black">{liveBMI}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase text-[#C5A059]">{Number(liveBMI) > 25 ? 'Déficit Calórico' : 'Saludable'}</p>
                </div>
              </div>
              <div className="col-span-full">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso Objetivo</label>
                 <input type="number" className="w-full bg-purple-50 border-purple-200 border-2 p-4 rounded-xl font-black text-[#4B2C69] text-xl" value={formData.targetWeight || ''} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-stethoscope text-[#4B2C69]"></i> 3. Salud Digestiva
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-full bg-slate-50 p-4 rounded-2xl">
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Hinchazón Abdominal</label>
                 <div className="grid grid-cols-3 gap-2">
                    {['none', 'occasional', 'frequent'].map(v => (
                      <button key={v} onClick={() => setFormData({...formData, abdominalBloating: v as any})} className={`py-2 rounded-xl text-[9px] font-bold uppercase border ${formData.abdominalBloating === v ? 'bg-[#4B2C69] text-white' : 'bg-white'}`}>
                        {v === 'none' ? 'Nunca' : v === 'occasional' ? 'A veces' : 'Siempre'}
                      </button>
                    ))}
                 </div>
              </div>
              <label className="flex items-center gap-3 p-4 border rounded-2xl bg-white cursor-pointer">
                <input type="checkbox" checked={formData.postMealSleepiness} onChange={e => setFormData({...formData, postMealSleepiness: e.target.checked})} className="accent-[#4B2C69] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Sueño post-comida</span>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-2xl bg-white cursor-pointer">
                <input type="checkbox" checked={formData.reflux} onChange={e => setFormData({...formData, reflux: e.target.checked})} className="accent-[#4B2C69] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Reflujo / Acidez</span>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-2xl bg-white cursor-pointer">
                <input type="checkbox" checked={formData.constipation} onChange={e => setFormData({...formData, constipation: e.target.checked})} className="accent-[#4B2C69] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Estreñimiento</span>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-2xl bg-white cursor-pointer">
                <input type="checkbox" checked={formData.insulinResistanceHistory} onChange={e => setFormData({...formData, insulinResistanceHistory: e.target.checked})} className="accent-[#4B2C69] w-5 h-5" />
                <span className="text-[10px] font-bold uppercase">Historial Resistencia Insulina</span>
              </label>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-utensils text-[#4B2C69]"></i> 4. Nutrición de Precisión
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-3xl border">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Protocolo de Alimentación</label>
                <select className="w-full bg-white border p-3 rounded-xl text-xs outline-none mb-3" value={formData.specificDietPreference} onChange={e => setFormData({...formData, specificDietPreference: e.target.value})}>
                  {Object.keys(dietDescriptions).map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 italic leading-relaxed">{dietDescriptions[formData.specificDietPreference]}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Comidas Favoritas</label>
                  <textarea className="w-full bg-slate-50 border p-3 rounded-xl text-xs h-20 outline-none" value={formData.favoriteFoods} onChange={e => setFormData({...formData, favoriteFoods: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Alimentos que Evitas</label>
                  <textarea className="w-full bg-rose-50 border p-3 rounded-xl text-xs h-20 outline-none" value={formData.dislikedFoods} onChange={e => setFormData({...formData, dislikedFoods: e.target.value})} />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.emotionalEating} onChange={e => setFormData({...formData, emotionalEating: e.target.checked})} className="accent-[#4B2C69] w-5 h-5" />
                  <span className="text-[10px] font-black uppercase text-[#4B2C69]">Sufro de Hambre Emocional (Ansiedad)</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-person-running text-[#4B2C69]"></i> 5. Estilo de Vida
            </h3>
            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl border">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Nivel de Actividad Física</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activityLevels.map(lvl => (
                    <button key={lvl.id} onClick={() => setFormData({...formData, activityLevel: lvl.id as any})} className={`flex flex-col items-start p-3 rounded-xl border transition-all ${formData.activityLevel === lvl.id ? 'bg-[#4B2C69] text-white border-[#4B2C69]' : 'bg-white text-slate-500 border-slate-200'}`}>
                      <span className="text-[10px] font-black uppercase">{lvl.label}</span>
                      <span className="text-[8px] opacity-70 mt-1">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <label className="text-[10px] font-bold text-blue-900 uppercase block mb-1">Agua (Litros/día)</label>
                  <input type="number" step="0.5" className="w-full bg-white border border-blue-200 p-2 rounded-lg font-black text-blue-900" value={formData.waterIntake} onChange={e => setFormData({...formData, waterIntake: Number(e.target.value)})} />
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                  <label className="text-[10px] font-bold text-indigo-900 uppercase block mb-1">Sueño (Horas/día)</label>
                  <input type="number" className="w-full bg-white border border-indigo-200 p-2 rounded-lg font-black text-indigo-900" value={formData.sleepDuration} onChange={e => setFormData({...formData, sleepDuration: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center py-10">
            <Logo />
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-bounce"><i className="fas fa-check text-2xl"></i></div>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Evaluación Técnica Lista</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Todo está preparado para generar tu protocolo de acompañamiento CBS.</p>
          </div>
        );
      default: return null;
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <header className="bg-white border-b border-stone-200 py-6 px-8 sticky top-0 z-50 shadow-sm flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
           <Logo />
           <div className="hidden md:block">
             <h1 className="text-xl font-black tracking-tighter uppercase text-[#4B2C69]">BALLOOM <span className="text-rose-600">CLINIC</span></h1>
             <p className="text-[8px] font-bold uppercase text-slate-400">Chile - Soporte Nutricional Experto</p>
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 pb-24">
        {!plan && !loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden no-print">
            <div className="bg-[#4B2C69] p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Diagnóstico Integral</h2>
                <p className="text-[#C5A059] font-bold text-[9px] uppercase tracking-widest">Protocolo Chile CBS</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6].map(s => <div key={s} className={`h-1.5 w-4 rounded-full ${step >= s ? 'bg-[#C5A059]' : 'bg-white/20'}`}></div>)}
              </div>
            </div>
            <div className="p-10">
              {error && <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">{error}</div>}
              {renderStep()}
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold text-[10px] uppercase">Atrás</button>}
                <div className="ml-auto">
                  {step < 6 ? (
                    <button onClick={() => setStep(step + 1)} className="bg-[#4B2C69] text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase shadow-lg">Siguiente</button>
                  ) : (
                    <button onClick={handleGenerate} className="bg-rose-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">Generar Plan Maestro Chile</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-40 no-print animate-pulse">
             <Logo />
             <div className="w-16 h-1 bg-slate-200 mx-auto my-10 relative overflow-hidden"><div className="absolute inset-0 bg-[#4B2C69] animate-progress"></div></div>
             <h2 className="text-2xl font-black text-[#4B2C69] uppercase tracking-tighter">{loadingMessages[loadingStep]}</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-6 italic">IA Metabólica Procesando...</p>
          </div>
        )}

        {plan && (
          <div className="animate-in fade-in space-y-12">
            <div className="bg-white p-6 md:p-12 rounded-[3rem] shadow-2xl border border-slate-50">
              {/* CABECERA REPORTE */}
              <div className="border-b-4 border-[#4B2C69] pb-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-6">
                  <Logo />
                  <div>
                    <h1 className="text-3xl font-black uppercase text-[#4B2C69]">GUÍA CBS CHILE</h1>
                    <h2 className="text-4xl font-black text-slate-900 leading-[0.9] uppercase">Plan de Soporte<br/><span className="text-[#C5A059]">Balloon Slim</span></h2>
                  </div>
                </div>
                <div className="bg-slate-900 p-8 rounded-2xl text-white min-w-[340px] shadow-2xl text-[10px] font-bold uppercase tracking-widest">
                  <p className="flex justify-between border-b border-white/10 pb-1 mb-1"><span>PACIENTE:</span> <span>{formData.name}</span></p>
                  <p className="flex justify-between border-b border-white/10 pb-1 mb-1"><span>RESULTADO:</span> <span>{formData.specificResultGoal}</span></p>
                  <p className="flex justify-between"><span>META:</span> <span className="text-[#C5A059] font-black">{plan.dailyCalories} Kcal</span></p>
                </div>
              </div>

              {/* PROTOCOLO BALLOOM SLIM (SOPORTE CENTRAL) */}
              <div className="mb-12 bg-white border-4 border-[#C5A059] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 bg-[#C5A059] text-white font-black text-[10px] rounded-bl-3xl">ESTRICTAMENTE NECESARIO</div>
                <h3 className="text-2xl font-black text-[#4B2C69] uppercase tracking-tighter mb-6 flex items-center gap-3">
                  <i className="fas fa-capsules"></i> ¿Cómo tomar tus cápsulas Balloon Slim?
                </h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                    <h4 className="text-[11px] font-black text-[#4B2C69] uppercase mb-4 tracking-widest">Horario Sugerido</h4>
                    <p className="text-xl font-black text-[#4B2C69] leading-tight italic">"{plan.balloomSlimSchedule}"</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="text-[11px] font-black uppercase mb-4 tracking-widest">Nota de Saciedad</h4>
                    <p className="text-xs text-slate-600 leading-relaxed italic">"Balloon Slim genera una saciedad mecánica que le permite comer porciones de comida chilena más pequeñas sin pasar hambre."</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-[11px] font-black text-rose-600 uppercase mb-4 tracking-[0.4em]">Justificación Clínica</h3>
                  <p className="text-slate-800 text-lg leading-relaxed italic text-justify">{plan.justificationSummary}</p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-[0.4em]">Métrica Metabólica</h3>
                  <div className="flex items-end gap-2">
                    <p className="text-6xl font-black text-slate-900">{plan.dailyCalories}</p>
                    <p className="text-xl font-bold text-slate-400 mb-2 uppercase">Kcal/Día</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 leading-relaxed font-medium">Este déficit está calculado para movilizar grasas de reserva aprovechando el control de hambre de la cápsula.</p>
                </div>
              </div>

              {/* DIETA INTERACTIVA (NO-PRINT) */}
              <div className="no-print space-y-12">
                <div className="text-center">
                  <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Calendario de Acompañamiento Chileno</h3>
                  <div className="flex justify-center gap-2 mt-8 flex-wrap">
                    {(plan?.masterWeek || []).map((day, idx) => (
                      <button key={idx} onClick={() => setActiveDayIdx(idx)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${activeDayIdx === idx ? 'bg-[#4B2C69] text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {day.dayName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {(plan?.masterWeek?.[activeDayIdx]?.meals || []).map((meal, mIdx) => (
                    <div key={mIdx} className="bg-white border-2 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                      {meal.label.toLowerCase().includes('almuerzo') || meal.label.toLowerCase().includes('cena') ? (
                        <div className="absolute top-0 right-0 bg-[#C5A059] text-white px-3 py-1 text-[8px] font-black uppercase rounded-bl-xl shadow-lg">Toma de Cápsula CBS 45min antes</div>
                      ) : null}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[#C5A059] font-black text-[9px] uppercase tracking-widest">{meal.time}</p>
                          <h6 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">{meal.label}</h6>
                        </div>
                        <i className="fas fa-utensils text-slate-100 text-2xl"></i>
                      </div>
                      <div className="space-y-6">
                        {(meal?.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className={`p-6 rounded-[1.5rem] border-l-4 relative ${oIdx === 1 ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-[#4B2C69]'}`}>
                            <div className="flex justify-between items-start mb-2">
                               <p className="font-black text-slate-800 text-xs uppercase">{oIdx === 1 ? '💰 Opción Económica / Feria' : '🍽️ Opción Estándar'}</p>
                               <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-1 rounded shadow-sm">{opt.calories || 0} Kcal</span>
                            </div>
                            <p className="font-black text-slate-900 text-xl pr-10">{opt.name}</p>
                            <p className="text-xs text-slate-500 italic leading-relaxed border-t mt-3 pt-3">{opt.preparation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* VISTA DE IMPRESIÓN COMPLETA (PRINT-ONLY) */}
              <div className="print-only mt-10 space-y-16">
                 <h3 className="text-3xl font-black text-center uppercase tracking-widest border-b-2 border-[#4B2C69] pb-4 mb-10">Tu Plan de Alimentación Chileno Semanal</h3>
                 {(plan?.masterWeek || []).map((day, idx) => (
                  <div key={idx} className="page-break-before mb-10 border-b pb-10">
                    <div className="bg-[#4B2C69] text-white p-4 rounded-xl flex justify-between items-center mb-6">
                      <h4 className="text-2xl font-black uppercase tracking-tighter">{day.dayName}</h4>
                      <p className="text-[10px] font-bold uppercase">Protocolo Balloon Slim Chile</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {day.meals.map((meal, mIdx) => (
                        <div key={mIdx} className="border p-4 rounded-2xl bg-white shadow-sm">
                          <h5 className="font-black text-slate-900 text-sm uppercase mb-2">{meal.label} ({meal.time})</h5>
                          <div className="space-y-4">
                             {meal.options.map((opt, oIdx) => (
                               <div key={oIdx} className="bg-slate-50 p-3 rounded-lg text-[9px] border-l-2 border-[#4B2C69]">
                                 <p className="font-black uppercase">{oIdx === 1 ? '[Económica] ' : ''}{opt.name}</p>
                                 <p className="text-slate-500 mt-1">{opt.preparation}</p>
                                 <p className="text-emerald-600 font-bold mt-1 uppercase">{opt.calories} kcal</p>
                               </div>
                             ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                 ))}
              </div>

              {/* ACCIONES FINALES */}
              <div className="mt-20 pt-10 border-t flex flex-col md:flex-row justify-center items-center gap-6 no-print">
                <button onClick={() => { setPlan(null); setError(null); setStep(1); }} className="text-slate-400 font-bold uppercase text-xs hover:text-rose-600 transition-colors">Nueva Evaluación</button>
                <button onClick={handlePrint} className="bg-[#4B2C69] text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                  <i className="fas fa-file-pdf text-[#C5A059]"></i> IMPRIMIR GUÍA DE ACOMPAÑAMIENTO (PDF)
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes progress { 0% { left: -100%; } 100% { left: 100%; } }
        .animate-progress { position: absolute; top: 0; height: 100%; width: 100%; animation: progress 2s linear infinite; }
        .no-print { display: block; }
        .print-only { display: none; }
        
        @media print {
          body { background: white !important; }
          @page { margin: 10mm; size: auto; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .rounded-[3rem], .rounded-[2rem] { border-radius: 0 !important; box-shadow: none !important; border: 0 !important; }
          .page-break-before { page-break-before: always; }
          .bg-slate-50 { background-color: white !important; }
          .shadow-2xl, .shadow-sm { box-shadow: none !important; }
          .flex { display: flex !important; }
          .grid { display: grid !important; }
          .text-[#4B2C69] { color: #4B2C69 !important; }
          .bg-[#4B2C69] { background-color: #4B2C69 !important; -webkit-print-color-adjust: exact; }
          .border-[#C5A059] { border-color: #C5A059 !important; }
        }
        
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
