
import { GoogleGenAI, Type } from "@google/genai";
import { NutriFormData, NutritionPlan } from "../types";

const getSystemInstruction = (data: NutriFormData) => `Eres el Director Clínico Superior de Balloom Clinic. Tu especialidad es la medicina metabólica y estética de precisión.

TU MISIÓN:
Generar un informe de diagnóstico médico y nutricional de ALTA GAMA que sea técnicamente impecable y visualmente estructurado.

REQUISITOS DEL INFORME:
1. SEMANA COMPLETA (7 DÍAS): Debes generar de Lunes a Domingo sin excepción.
2. CALORÍAS POR PLATO: Cada opción de comida DEBE tener su valor calórico específico en el campo 'calories'.
3. VARIEDAD: Proporciona 2-3 opciones por comida para evitar el aburrimiento del paciente.
4. PROTOCOLO BALLOOM SLIM (CRÍTICO): 
   - 'balloomSlimSchedule': Define exactamente cuándo y cómo tomarlo. DEBE incluir una justificación metabólica basada en los datos del paciente (ej: "Debido a tu reporte de sueño tras comer, se recomienda 30 min antes del almuerzo para mitigar el pico insulínico").
   - 'balloomSlimContraindications': Proporciona advertencias de seguridad y CRITERIOS DE EXCLUSIÓN. Indica cuándo el paciente NO debe tomar la cápsula (ej: "Suspender si el nivel de estrés autopercibido es extremo ese día para no sobreestimular el cortisol" o "No tomar si no se han dormido al menos 6 horas").
5. PROPUESTA DE AYUNO (ESTRUCTURADO): 
   - 'fastingSchedule': Resumen corto del ciclo (ej: "16/8 Ciclo Metabólico").
   - 'fastingDetails': Desglose técnico incluyendo tipo de ayuno, ventana horaria sugerida, líquidos permitidos y reglas de la ventana de alimentación.

SECCIONES CLÍNICAS:
- 'justificationSummary': Inicia con: "Basado en la evaluación integral del paciente [Nombre], considerando su motivo de consulta ([Motivo]) y sus antecedentes de [Antecedentes], se le sugiere..."
- 'clinicalAnalysis': Análisis profundo de marcadores inflamatorios y resistencia a la insulina.
- 'bodySculptingAdvice': Cómo atacar la grasa localizada según los datos de cintura y zonas a tratar.
- 'metabolicBreakdown': Justificación técnica del TDEE y el déficit aplicado considerando su nivel de actividad (${data.activityLevel}).`;

export const generateChileanPlan = async (data: NutriFormData): Promise<NutritionPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `GENERAR DIAGNÓSTICO INTEGRAL BALLOOM CLINIC
  
  FORMATO: JSON ESTRICTO.
  PACIENTE: ${data.name}, ${data.age} años. Peso ${data.weight}kg, Cintura ${data.waistCircumference}cm.
  NIVEL ACTIVIDAD: ${data.activityLevel} (Frecuencia: ${data.exerciseFrequency} veces/semana).
  OBJETIVO: ${data.consultationReason}.
  CONDICIÓN: ${data.insulinResistanceHistory ? 'Resistencia a la Insulina' : 'Normal'}.
  SÍNTOMAS REPORTADOS: ${data.postMealSleepiness ? 'Sueño post-prandial' : ''}, ${data.abdominalBloating !== 'none' ? 'Hinchazón' : ''}, Estrés: ${data.stressLevel}.
  ACTIVIDAD ESPECÍFICA: ${data.exerciseType}.
  
  GENERAR:
  1. Justificación Médica.
  2. Análisis Metabólico y Estético.
  3. Desglose de Calorías y Macros.
  4. Protocolo Balloom Slim con JUSTIFICACIÓN CLÍNICA de horarios y CRITERIOS DE EXCLUSIÓN claros.
  5. Calendario Semanal de Ayuno Intermitente con desglose de líquidos y reglas de ventana.
  6. Plan de 7 días con 2+ opciones por comida y sus calorías individuales.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(data),
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          justificationSummary: { type: Type.STRING },
          clinicalAnalysis: { type: Type.STRING },
          bodySculptingAdvice: { type: Type.STRING },
          metabolicBreakdown: { type: Type.STRING },
          bmi: { type: Type.NUMBER },
          tdee: { type: Type.NUMBER },
          nutritionalStatus: { type: Type.STRING },
          dailyCalories: { type: Type.NUMBER },
          macros: {
            type: Type.OBJECT,
            properties: { p: { type: Type.NUMBER }, c: { type: Type.NUMBER }, f: { type: Type.NUMBER } }
          },
          balloomSlimProtocol: { type: Type.STRING },
          balloomSlimSchedule: { type: Type.STRING },
          balloomSlimContraindications: { type: Type.STRING },
          metabolicGoals: { type: Type.STRING },
          fastingSchedule: { type: Type.STRING },
          fastingDetails: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              window: { type: Type.STRING },
              allowedLiquids: { type: Type.ARRAY, items: { type: Type.STRING } },
              feedingRules: { type: Type.STRING }
            }
          },
          masterWeek: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                dayName: { type: Type.STRING },
                meals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      time: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            preparation: { type: Type.STRING },
                            calories: { type: Type.NUMBER }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          progressionGuide: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { phase: { type: Type.STRING }, objective: { type: Type.STRING }, details: { type: Type.STRING } } } },
          shoppingList: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("API falló");
  return JSON.parse(text) as NutritionPlan;
};
