
import { GoogleGenAI, Type } from "@google/genai";
import { NutriFormData, NutritionPlan } from "../types";

const getSystemInstruction = (data: NutriFormData) => `Eres el Director Clínico Superior de Balloom Clinic, experto en el Protocolo Control Balloon Slim (CBS) para el público de CHILE. 

TU ENFOQUE:
1. PÉRDIDA DE PESO EN CHILE: Diseña dietas con alimentos disponibles en ferias y supermercados chilenos. Usa términos locales (Hallulla, Marraqueta, Jurel, Zapallo, Merkén, etc.).
2. OPCIONES ECONÓMICAS: Para cada tiempo de comida (Desayuno, Almuerzo, Once/Merienda, Cena), debes proporcionar obligatoriamente una opción "Estándar" y una opción "Económica/Low Cost" (ej: usando jurel, huevos, legumbres, verduras de estación).
3. SACIEDAD MECÁNICA CBS: Las cápsulas Balloon Slim son el soporte principal. Explica cómo estas permiten comer platos chilenos tradicionales en porciones controladas.
4. INSTRUCCIÓN CLAVE: La cápsula se toma 45 min antes de las comidas de mayor volumen (Almuerzo y Cena).

REQUISITOS DEL INFORME:
- Genera 7 DÍAS completos de Lunes a Domingo.
- 'balloomSlimSchedule': Indica: "Tomar 1 cápsula CBS con 2 vasos de agua 45 min antes del Almuerzo y 45 min antes de la Cena".
- 'justificationSummary': Enfócate en cómo el protocolo le ayudará en su meta de "${data.specificResultGoal}" sin dejar de comer comida chilena, pero en porciones reducidas por la saciedad del balón.
- 'masterWeek': Los platos deben sonar chilenos (ej: Charquicán de pavo, Lentejas con zapallo, Reineta a la plancha, Pan integral con palta).

CALORÍAS:
Meta diaria: ${data.weight * 21} kcal aproximadamente para asegurar déficit.`;

async function fetchWithRetry(fn: () => Promise<any>, retries = 3, delay = 2000): Promise<any> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    const isRetryable = error.message?.includes("500") || 
                        error.message?.includes("Rpc failed") || 
                        error.message?.includes("xhr error") ||
                        error.message?.includes("Proxy");
    
    if (isRetryable) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateChileanPlan = async (data: NutriFormData): Promise<NutritionPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `GENERAR PROTOCOLO CBS CHILE - PACIENTE: ${data.name}
  
  FORMATO: JSON ESTRICTO.
  META: ${data.specificResultGoal}.
  ASPIRACIÓN: ${data.treatmentAspiration}.
  ESTILO: Chileno, con opciones baratas de feria.
  
  REGLA DE OPCIONES:
  Opción 1: Saludable Estándar.
  Opción 2: Económica (Usa Jurel, Legumbres, Huevos, etc.).
  
  DIETA PREFERIDA: ${data.specificDietPreference}.`;

  const callApi = async () => {
    return await ai.models.generateContent({
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
            dailyCalories: { type: Type.NUMBER },
            balloomSlimSchedule: { type: Type.STRING },
            balloomSlimContraindications: { type: Type.STRING },
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
            }
          }
        }
      }
    });
  };

  const response = await fetchWithRetry(callApi);
  const text = response.text;
  if (!text) throw new Error("La respuesta de la IA está vacía.");
  return JSON.parse(text) as NutritionPlan;
};
