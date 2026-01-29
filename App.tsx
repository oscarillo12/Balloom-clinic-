
import React, { useState, useEffect, useMemo } from 'react';
import { NutriFormData, NutritionPlan } from './types';
import { generateChileanPlan } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  
  const [formData, setFormData] = useState<NutriFormData>({
    name: '', age: 30, gender: 'female', stressLevel: 'moderate', smoking: false,
    alcoholConsumption: 'none', sedentaryHours: 8, consultationReason: '', insulinResistanceHistory: false,
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

  const consultationReasons = [
    "Bajar de peso y reducción de grasa corporal",
    "Aumento de masa muscular (Hipertrofia)",
    "Control de Resistencia a la Insulina / SOP / Diabetes",
    "Mejora de salud digestiva (Hinchazón, colon, reflujo)",
    "Optimización de rendimiento deportivo / Atleta",
    "Bienestar general y longevidad",
    "Otro (especificar abajo)"
  ];

  const commonAllergiesList = [
    "Gluten", "Lactosa", "Frutos Secos", "Mariscos", "Huevo", "Soya", "Pescado", "Legumbres"
  ];

  const dietDescriptions: Record<string, string> = {
    'Equilibrada': 'Proporciones sanas de todos los macronutrientes para bienestar general.',
    'Keto': 'Muy baja en carbohidratos y alta en grasas para entrar en cetosis y quemar grasa.',
    'LowCarb': 'Reducción moderada de azúcares y harinas para control glucémico.',
    'Mediterranea': 'Rica en vegetales, pescados y grasas buenas. Muy cardiosaludable.',
    'Ayuno Intermitente': 'Ciclos de ayuno (ej. 16/8) para mejorar la sensibilidad a la insulina.',
    'Vegana': 'Exclusión de todo producto animal. Enfoque en proteínas vegetales.',
    'Paleo': 'Basada en alimentos no procesados: carnes, pescados, frutas y semillas. Sin granos ni legumbres.',
    'Dukan': 'Dieta por fases con alto contenido proteico para una pérdida de peso rápida y controlada.',
    'Flexitariana': 'Vegetariana la mayor parte del tiempo, con consumo ocasional y flexible de carne.',
    'Sin gluten y sin lácteos': 'Dieta antiinflamatoria diseñada para mejorar la digestión y reducir la hinchazón sistémica.',
    'Otro': 'Cualquier otro protocolo específico o indicación médica que estés siguiendo actualmente.'
  };

  const activityLevels = [
    { id: 'sedentary', label: 'Sedentario', desc: 'Poca o nula actividad física.' },
    { id: 'light', label: 'Ligero', desc: 'Actividad 1-2 veces por semana.' },
    { id: 'moderate', label: 'Moderado', desc: 'Actividad 3-4 veces por semana.' },
    { id: 'active', label: 'Activo', desc: 'Actividad diaria intensa.' },
    { id: 'athlete', label: 'Atleta', desc: 'Entrenamiento de alto rendimiento.' }
  ];

  const activitySegments = [
    { id: 'no-hago', label: 'No hago actividad', icon: 'fa-xmark' },
    { id: 'pesas', label: 'Pesas / Fuerza', icon: 'fa-dumbbell' },
    { id: 'cardio', label: 'Cardiovascular', icon: 'fa-heart-pulse' },
    { id: 'caminar', label: 'Salir a caminar', icon: 'fa-person-walking' },
    { id: 'deporte', label: 'Deporte Equipo', icon: 'fa-volleyball' },
    { id: 'yoga', label: 'Yoga / Pilates', icon: 'fa-spa' },
    { id: 'funcional', label: 'Funcional / HIIT', icon: 'fa-bolt' },
    { id: 'running', label: 'Running / Ciclismo', icon: 'fa-person-running' }
  ];

  const liveBMI = useMemo(() => {
    if (formData.weight > 0 && formData.height > 0) {
      const heightInMeters = formData.height / 100;
      return (formData.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return '0.0';
  }, [formData.weight, formData.height]);

  const estimatedExerciseBurn = useMemo(() => {
    if (!formData.exerciseType || formData.exerciseType === 'No hago actividad' || formData.exerciseFrequency === 0) return 0;
    
    let baseBurn = 0;
    const type = formData.exerciseType.toLowerCase();
    if (type.includes('pesas') || type.includes('fuerza')) baseBurn = 300;
    else if (type.includes('cardio') || type.includes('running')) baseBurn = 400;
    else if (type.includes('hiit') || type.includes('funcional')) baseBurn = 450;
    else baseBurn = 180;

    // Multiplicador por Nivel de Actividad
    let multiplier = 1.0;
    switch(formData.activityLevel) {
      case 'sedentary': multiplier = 0.8; break;
      case 'light': multiplier = 0.9; break;
      case 'moderate': multiplier = 1.0; break;
      case 'active': multiplier = 1.25; break;
      case 'athlete': multiplier = 1.6; break;
    }

    return Math.round((baseBurn * multiplier * formData.exerciseFrequency) / 7);
  }, [formData.exerciseType, formData.exerciseFrequency, formData.activityLevel]);

  const loadingMessages = [
    "Sincronizando perfiles Balloom...",
    "Analizando marcadores de cortisol y resistencia...",
    "Calculando impacto por nivel de actividad...",
    "Estructurando tu protocolo de ejercicio...",
    "Calculando calorías y macros por opción...",
    "Generando plan maestro de 7 días con propuesta de ayuno..."
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

  const toggleAllergy = (allergy: string) => {
    const current = [...formData.commonAllergies];
    const index = current.indexOf(allergy);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(allergy);
    }
    setFormData({...formData, commonAllergies: current});
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-id-card text-rose-600"></i> 1. Identificación y Antecedentes
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nombre Completo</label>
                <input className="w-full bg-slate-50 border p-3 rounded-xl outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Motivo de Consulta Principal</label>
                <select 
                  className="w-full bg-slate-50 border p-3 rounded-xl outline-none mb-2" 
                  value={consultationReasons.includes(formData.consultationReason) ? formData.consultationReason : (formData.consultationReason === '' ? '' : 'Otro (especificar abajo)')}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === "Otro (especificar abajo)") {
                      setFormData({...formData, consultationReason: ''});
                    } else {
                      setFormData({...formData, consultationReason: val});
                    }
                  }}
                >
                  <option value="" disabled>Selecciona un motivo...</option>
                  {consultationReasons.map((reason, idx) => (
                    <option key={idx} value={reason}>{reason}</option>
                  ))}
                </select>
                {(!consultationReasons.includes(formData.consultationReason) || formData.consultationReason === "Otro (especificar abajo)") && (
                  <input 
                    className="w-full bg-white border-2 border-rose-100 p-3 rounded-xl outline-none animate-in fade-in slide-in-from-top-1" 
                    value={formData.consultationReason === "Otro (especificar abajo)" ? "" : formData.consultationReason} 
                    onChange={e => setFormData({...formData, consultationReason: e.target.value})} 
                    placeholder="Escribe tu motivo específico aquí..." 
                  />
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Edad</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nivel de Estrés</label>
                <select className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.stressLevel} onChange={e => setFormData({...formData, stressLevel: e.target.value as any})}>
                  <option value="low">Bajo</option>
                  <option value="moderate">Moderado</option>
                  <option value="high">Alto</option>
                  <option value="extreme">Extremo</option>
                </select>
              </div>
              <div className="col-span-2 bg-rose-50/50 p-4 rounded-2xl border border-rose-100/50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.insulinResistanceHistory} onChange={e => setFormData({...formData, insulinResistanceHistory: e.target.checked})} className="accent-rose-600 w-5 h-5" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-rose-900 block">Diagnóstico de Resistencia a la Insulina</span>
                    <span className="text-[9px] text-rose-400 font-bold uppercase">Prediabetes / Sop / Síndrome Metabólico</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-ruler-combined text-rose-600"></i> 2. Antropometría
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Peso Actual (kg)</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl font-black" value={formData.weight || ''} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Estatura (cm)</label>
                <input type="number" className="w-full bg-slate-50 border p-3 rounded-xl" value={formData.height || ''} onChange={e => setFormData({...formData, height: Number(e.target.value)})} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-1">Cintura (cm)</label>
                <input type="number" className="w-full bg-rose-50 border border-rose-100 p-3 rounded-xl font-black text-rose-600" value={formData.waistCircumference || ''} onChange={e => setFormData({...formData, waistCircumference: Number(e.target.value)})} />
              </div>
              <div className="col-span-full bg-slate-900 p-4 rounded-2xl text-white shadow-lg flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase opacity-60 tracking-[0.2em]">IMC Calculado</p>
                  <p className="text-2xl font-black tracking-tighter">{liveBMI}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold uppercase text-rose-400">{Number(liveBMI) < 25 ? 'Normal' : 'Intervención Recomendada'}</p>
                </div>
              </div>
              <div className="col-span-full border-t pt-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Peso Objetivo</label>
                <input type="number" className="w-full bg-rose-100/50 border-rose-200 border p-4 rounded-2xl font-black text-rose-600 text-xl outline-none" value={formData.targetWeight || ''} onChange={e => setFormData({...formData, targetWeight: Number(e.target.value)})} />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-stethoscope text-rose-600"></i> 3. Diagnóstico Digestivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Hinchazón Abdominal</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['none', 'occasional', 'frequent'].map(val => (
                      <button key={val} onClick={() => setFormData({...formData, abdominalBloating: val as any})} className={`py-2 rounded-xl text-[9px] font-bold uppercase border transition-all ${formData.abdominalBloating === val ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {val === 'none' ? 'Nunca' : val === 'occasional' ? 'Ocasional' : 'Frecuente'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Frecuencia Baño (veces/día)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['less-than-1', '1', '2', '3-plus'].map(opt => (
                      <button key={opt} onClick={() => setFormData({...formData, bathroomFrequency: opt as any})} className={`py-2 rounded-xl text-[9px] font-black border transition-all ${formData.bathroomFrequency === opt ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}>
                        {opt === 'less-than-1' ? '< 1' : opt === '3-plus' ? '3+' : opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-full grid grid-cols-2 gap-3 mt-4">
                {[
                  { key: 'postMealSleepiness', label: 'Sueño tras comer' },
                  { key: 'reflux', label: 'Reflujo / Acidez' },
                  { key: 'constipation', label: 'Estreñimiento' },
                  { key: 'gas', label: 'Gases' }
                ].map(item => (
                  <label key={item.key} className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${formData[item.key as keyof NutriFormData] ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-100'}`}>
                    <input type="checkbox" checked={!!formData[item.key as keyof NutriFormData]} onChange={e => setFormData({...formData, [item.key]: e.target.checked})} className="accent-rose-600 w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase text-slate-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-utensils text-rose-600"></i> 4. Nutrición de Precisión
            </h3>
            <div className="space-y-4">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Protocolo de Alimentación</label>
                <select className="w-full bg-white border p-3 rounded-xl text-xs outline-none mb-3" value={formData.specificDietPreference} onChange={e => setFormData({...formData, specificDietPreference: e.target.value})}>
                  {Object.keys(dietDescriptions).map(diet => (
                    <option key={diet} value={diet}>{diet}</option>
                  ))}
                </select>
                <div className="bg-white/50 p-4 rounded-xl border border-slate-200 mb-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Descripción del Protocolo:</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">{dietDescriptions[formData.specificDietPreference]}</p>
                </div>
                {formData.specificDietPreference === 'Otro' && (
                  <input className="w-full bg-white border p-3 rounded-xl text-xs outline-none" placeholder="Describe tu dieta o indicación específica..." value={formData.otherDietPreference} onChange={e => setFormData({...formData, otherDietPreference: e.target.value})} />
                )}
              </div>

              {/* SECCIÓN DE ALERGIAS */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Alergias e Intolerancias</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  {commonAllergiesList.map(allergy => (
                    <button 
                      key={allergy} 
                      onClick={() => toggleAllergy(allergy)}
                      className={`py-2 px-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${formData.commonAllergies.includes(allergy) ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Otras Alergias / Detalles Específicos</label>
                <textarea 
                  className="w-full bg-white border p-3 rounded-xl text-xs h-20 outline-none" 
                  value={formData.allergies} 
                  onChange={e => setFormData({...formData, allergies: e.target.value})} 
                  placeholder="Ej: Intolerancia severa a la fructosa, alergia a colorantes..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Comidas Favoritas</label>
                  <textarea className="w-full bg-slate-50 border p-3 rounded-xl text-xs h-20 outline-none" value={formData.favoriteFoods} onChange={e => setFormData({...formData, favoriteFoods: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-1">Alimentos que Evitas</label>
                  <textarea className="w-full bg-rose-50/30 border border-rose-100 p-3 rounded-xl text-xs h-20 outline-none" value={formData.dislikedFoods} onChange={e => setFormData({...formData, dislikedFoods: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-8 animate-in slide-in-from-right-4">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
              <i className="fas fa-person-running text-rose-600"></i> 5. Rendimiento y Vida
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50/50 p-6 rounded-[2.5rem] border border-blue-100">
                <label className="text-[11px] font-black text-blue-900 uppercase tracking-widest block mb-2">Agua Diaria (L)</label>
                <input type="number" step="0.5" className="w-full bg-white border border-blue-200 p-4 rounded-2xl text-xl font-black text-blue-900 outline-none" value={formData.waterIntake || ''} onChange={e => setFormData({...formData, waterIntake: Number(e.target.value)})} />
              </div>

              <div className="bg-indigo-50/50 p-6 rounded-[2.5rem] border border-indigo-100">
                <label className="text-[11px] font-black text-indigo-900 uppercase tracking-widest block mb-4 text-center">Nivel de Actividad</label>
                <div className="grid grid-cols-1 gap-2">
                  {activityLevels.map(lvl => (
                    <button 
                      key={lvl.id} 
                      onClick={() => setFormData({...formData, activityLevel: lvl.id as any})}
                      className={`flex flex-col items-center p-3 rounded-xl border transition-all ${formData.activityLevel === lvl.id ? 'bg-indigo-600 text-white shadow-md border-indigo-600' : 'bg-white text-slate-500 border-indigo-100 hover:border-indigo-300'}`}
                    >
                      <span className="text-[10px] font-black uppercase">{lvl.label}</span>
                      <span className="text-[8px] opacity-70 leading-none mt-1">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Actividad Principal</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {activitySegments.map(seg => (
                  <button key={seg.id} onClick={() => setFormData({ ...formData, exerciseType: seg.label })} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${formData.exerciseType === seg.label ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-rose-200'}`}>
                    <i className={`fas ${seg.icon} text-lg`}></i>
                    <span className="text-[9px] font-bold uppercase text-center leading-tight">{seg.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {formData.exerciseType !== 'No hago actividad' && (
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Sesiones por semana</label>
                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(num => (
                    <button key={num} onClick={() => setFormData({...formData, exerciseFrequency: num})} className={`py-3 rounded-xl text-sm font-black border transition-all ${formData.exerciseFrequency === num ? 'bg-slate-900 text-white' : 'bg-white text-slate-400'}`}>
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 6:
        return (
          <div className="space-y-6 text-center py-10">
            <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"><i className="fas fa-check text-2xl"></i></div>
            <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Análisis Completo Listo</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4">Todo está preparado para generar tu protocolo de 7 días, calorías y ayuno.</p>
          </div>
        );
      default: return null;
    }
  };

  const handleGenerate = async () => {
    if (!formData.name || formData.weight <= 0 || formData.height <= 0) {
      alert("Por favor completa los datos básicos (Nombre, Peso, Altura).");
      return;
    }
    setLoading(true);
    try {
      const result = await generateChileanPlan(formData);
      setPlan(result);
      setActiveDayIdx(0); 
    } catch (e) {
      console.error(e);
      alert("Error en la conexión. Reintenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <header className="bg-white border-b border-stone-200 py-4 px-8 sticky top-0 z-50 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter uppercase">Balloom <span className="text-rose-600">Clinic</span></h1>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 pb-24">
        {!plan && !loading && (
          <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Diagnóstico Balloom</h2>
                <p className="text-rose-400 font-bold text-[9px] uppercase tracking-widest">IA Metabólica Avanzada</p>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div key={s} className={`h-1.5 w-4 rounded-full ${step >= s ? 'bg-rose-500' : 'bg-slate-700'}`}></div>
                ))}
              </div>
            </div>
            <div className="p-10">
              {renderStep()}
              <div className="flex justify-between items-center mt-12 pt-8 border-t">
                {step > 1 && <button onClick={() => setStep(step - 1)} className="text-slate-400 font-bold text-[10px] uppercase">Atrás</button>}
                <div className="ml-auto">
                  {step < 6 ? (
                    <button onClick={() => setStep(step + 1)} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase">Siguiente</button>
                  ) : (
                    <button onClick={handleGenerate} className="bg-rose-600 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">Generar Plan Maestro</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-40 animate-in fade-in">
             <div className="w-20 h-20 border-4 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{loadingMessages[loadingStep]}</h2>
             <p className="text-[10px] text-slate-400 font-bold uppercase mt-6">IA Metabólica Procesando...</p>
          </div>
        )}

        {plan && (
          <div className="animate-in fade-in space-y-12">
            <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-50">
              <div className="border-b-8 border-slate-900 pb-12 mb-12 flex flex-col md:flex-row justify-between items-end gap-10">
                <div className="flex-grow">
                  <h1 className="text-2xl font-black uppercase tracking-tighter">Balloom <span className="text-rose-600">Clinic</span></h1>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mt-2 leading-[0.9]">Plan Maestro de<br/><span className="text-rose-600">7 Días</span></h2>
                </div>
                <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white min-w-[340px] shadow-2xl">
                  <div className="space-y-3 text-[10px] font-bold uppercase tracking-widest">
                    <div className="flex justify-between border-b border-white/10 pb-1"><span>Paciente:</span> <span>{formData.name}</span></div>
                    <div className="flex justify-between"><span className="text-rose-500">IMC:</span> <span className="text-rose-500 font-black">{liveBMI}</span></div>
                    <div className="flex justify-between"><span className="text-indigo-400">Nivel:</span> <span className="text-indigo-400 font-black">{formData.activityLevel.toUpperCase()}</span></div>
                  </div>
                </div>
              </div>

              {/* TARJETA DE META CALÓRICA PROMINENTE */}
              <div className="mb-12 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-[6px] border-slate-800 overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase text-rose-400 tracking-[0.4em] mb-2 flex items-center gap-2">
                    <i className="fas fa-fire-alt"></i> Meta Calórica Diaria Asignada
                  </p>
                  <p className="text-7xl font-black tracking-tighter leading-none">{plan.dailyCalories || 0} <span className="text-2xl font-bold text-slate-400 uppercase tracking-widest ml-1">Kcal</span></p>
                </div>
                <div className="bg-emerald-500/10 p-6 rounded-[2.5rem] border border-emerald-500/20 text-center relative z-10 backdrop-blur-sm min-w-[200px]">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Impacto Actividad</p>
                  <p className="text-3xl font-black text-white">+{estimatedExerciseBurn}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Calorías / Día</p>
                </div>
                <i className="fas fa-bolt absolute -right-8 -bottom-8 text-white/5 text-[15rem] pointer-events-none"></i>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
                  <h3 className="text-[11px] font-black text-rose-600 uppercase mb-4 tracking-[0.4em]">Justificación Médica</h3>
                  <p className="text-slate-800 text-lg leading-relaxed italic text-justify">{plan.justificationSummary || "No disponible."}</p>
                </div>
                <div className="bg-slate-50 p-10 rounded-[3rem] text-slate-800 border border-slate-100 flex flex-col justify-center">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase mb-4 tracking-[0.4em]">Análisis Metabólico Profundo</h3>
                  <p className="text-slate-700 text-lg leading-relaxed italic text-justify">{plan.metabolicBreakdown || "No disponible."}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* PROTOCOLO DE AYUNO EXPANDIDO */}
                <div className="bg-emerald-50 p-10 rounded-[3.5rem] border border-emerald-100 shadow-sm flex flex-col">
                  <h3 className="text-[11px] font-black text-emerald-600 uppercase mb-6 tracking-[0.4em] flex items-center gap-2">
                    <i className="fas fa-calendar-check"></i> Ciclo de Ayuno Semanal
                  </h3>
                  <div className="space-y-6 flex-grow">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
                      <div>
                        <p className="text-[9px] font-black text-emerald-700 uppercase opacity-60">Protocolo Seleccionado</p>
                        <p className="text-3xl font-black text-emerald-900 tracking-tighter">{plan.fastingDetails?.type || plan.fastingSchedule || "No especificado"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-emerald-700 uppercase opacity-60">Ventana Alimentación</p>
                        <p className="text-xl font-bold text-emerald-800">{plan.fastingDetails?.window || "8 Horas"}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-3 flex items-center gap-2">
                        <i className="fas fa-mug-hot"></i> Líquidos Permitidos (Ayuno)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(plan.fastingDetails?.allowedLiquids || ["Agua", "Café solo", "Té sin azúcar"]).map((liq, lIdx) => (
                          <span key={lIdx} className="bg-white/80 border border-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-bold text-emerald-800 shadow-sm">
                            {liq}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-emerald-600/5 p-5 rounded-2xl border border-emerald-200">
                      <h4 className="text-[10px] font-black text-emerald-700 uppercase mb-2">Reglas Ventana de Alimentación</h4>
                      <p className="text-xs text-emerald-900 leading-relaxed italic">{plan.fastingDetails?.feedingRules || "Priorizar proteínas y grasas saludables para romper el ayuno sin picos de insulina."}</p>
                    </div>
                  </div>
                </div>
                
                {/* PROTOCOLO BALLOOM SLIM MEJORADO */}
                <div className="space-y-6">
                  <div className="bg-rose-50 p-10 rounded-[3.5rem] border border-rose-100 h-full flex flex-col justify-start shadow-sm">
                    <h3 className="text-[11px] font-black text-rose-600 uppercase mb-6 tracking-[0.4em] flex items-center gap-2">
                      <i className="fas fa-capsules"></i> Cápsulas Balloom Slim
                    </h3>
                    
                    <div className="space-y-6">
                      <div className="bg-white/80 p-6 rounded-[2.5rem] border border-rose-200 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-2">
                          <i className="fas fa-clock text-rose-600"></i>
                          <h4 className="text-[10px] font-black text-rose-700 uppercase">Indicación y Justificación</h4>
                        </div>
                        <p className="text-lg font-black text-rose-900 italic leading-tight mb-2">"{plan.balloomSlimSchedule || "Consultar protocolo estándar."}"</p>
                        <div className="w-10 h-1 bg-rose-200 rounded-full"></div>
                      </div>
                      
                      <div className="bg-rose-900/5 p-6 rounded-[2.5rem] border border-rose-200 shadow-sm">
                        <div className="flex items-center gap-3 mb-3 text-rose-800">
                          <i className="fas fa-ban"></i>
                          <h4 className="text-[10px] font-black uppercase">Criterios de Exclusión (Cuándo evitar)</h4>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed italic font-medium">
                          {plan.balloomSlimContraindications || "Siga el protocolo general si no hay síntomas adversos."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="p-10 border-2 rounded-[3.5rem] bg-white">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 tracking-[0.4em] flex items-center gap-2">
                     <i className="fas fa-microscope text-rose-600"></i> Análisis Metabólico
                   </h3>
                   <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap text-justify">{plan.clinicalAnalysis || "Análisis no disponible."}</p>
                </div>
                <div className="p-10 border-2 rounded-[3.5rem] bg-slate-50">
                   <h3 className="text-[11px] font-black text-slate-900 uppercase mb-6 tracking-[0.4em] flex items-center gap-2">
                     <i className="fas fa-wand-magic-sparkles text-rose-600"></i> Esculpido Corporal
                   </h3>
                   <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap text-justify">{plan.bodySculptingAdvice || "Recomendación no disponible."}</p>
                </div>
              </div>

              <div className="space-y-12">
                <div className="text-center">
                  <h3 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Calendario Nutricional</h3>
                  <div className="flex justify-center gap-2 mt-8 flex-wrap">
                    {(plan?.masterWeek || []).map((day, idx) => (
                      <button key={idx} onClick={() => setActiveDayIdx(idx)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${activeDayIdx === idx ? 'bg-rose-600 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                        {day.dayName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {(plan?.masterWeek?.[activeDayIdx]?.meals || []).map((meal, mIdx) => (
                    <div key={mIdx} className="bg-white border-2 p-8 rounded-[3rem] shadow-sm hover:border-rose-100 transition-colors">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-rose-500 font-black text-[9px] uppercase tracking-widest">{meal.time}</p>
                          <h6 className="font-black text-slate-900 text-2xl uppercase tracking-tighter">{meal.label}</h6>
                        </div>
                        <i className="fas fa-utensils text-slate-100 text-2xl"></i>
                      </div>
                      <div className="space-y-6">
                        {(meal?.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 relative group">
                            <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg shadow-sm">
                              {opt.calories || 0} Kcal
                            </span>
                            <p className="font-black text-slate-800 text-xl mb-3 pr-20">{opt.name}</p>
                            <p className="text-xs text-slate-500 italic font-serif leading-relaxed border-t border-slate-100 pt-3">{opt.preparation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-20 pt-10 border-t flex justify-center gap-4 print:hidden">
                <button onClick={() => setPlan(null)} className="text-slate-400 font-bold uppercase text-xs hover:text-rose-600 transition-colors">Nueva Evaluación</button>
                <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase shadow-xl hover:scale-105 transition-all">
                  <i className="fas fa-print mr-2"></i> IMPRIMIR REPORTE COMPLETO
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        @media print {
          @page { margin: 15mm; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; }
          button, header { display: none !important; }
          .rounded-[4rem] { border-radius: 0 !important; box-shadow: none !important; border: 0 !important; }
        }
        .animate-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
