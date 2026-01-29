
export interface NutriFormData {
  // 1. Identificación y Riesgo
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  stressLevel: 'low' | 'moderate' | 'high' | 'extreme';
  smoking: boolean;
  alcoholConsumption: 'none' | 'occasional' | 'frequent';
  sedentaryHours: number;
  consultationReason: string;
  insulinResistanceHistory: boolean;
  medicalConditions: string[];
  otherMedicalCondition: string;
  medications: string;
  familyHistory: string;

  // 2. Antropometría
  weight: number;
  height: number;
  waistCircumference: number;
  maxWeightReached: number;
  minWeightAdult: number;
  recentWeightFluctuations: string;
  targetWeight: number;
  mainGoal: string; 
  desiredBodyChange: string; 

  // 3. Bioquímica e Intestinal
  postMealSleepiness: boolean;
  neckDarkSpots: boolean;
  skinTags: boolean;
  swollenFeet: boolean;
  abdominalBloating: 'none' | 'occasional' | 'frequent';
  frequentHeadaches: 'none' | 'occasional' | 'frequent';
  constipation: boolean;
  reflux: boolean;
  gas: boolean;
  otherSymptom: string; 
  bathroomFrequency: 'less-than-1' | '1' | '2' | '3-plus';
  symptomsDescription: string;

  // 4. Nutrición
  dietType: string;
  specificDietPreference: string;
  otherDietPreference: string;
  favoriteFoods: string;
  dislikedFoods: string;
  commonAllergies: string[]; 
  allergies: string;
  cravings: 'sweet' | 'salty' | 'both' | 'none';
  emotionalEating: boolean;
  eatingEnvironment: string;

  // 5. Estilo de Vida
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
  exerciseFrequency: number;
  exerciseIntensity: 'low' | 'moderate' | 'high';
  exerciseType: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'athlete';
  sleepQuality: 'good' | 'fair' | 'poor';
  sleepDuration: number;
  waterIntake: number; 

  // 6. Evaluación Psicológica
  selfEfficacyLevel: number;
  eatingDisorderScreening: {
    binging: boolean;
    purging: boolean;
    insulinMisuse: boolean;
  };

  // Otros
  areasToSlim: string[];
  areasToTone: string[];
  fastingHours: number;
  previousSupplements: string;
  socialSupport: string;
  diet24hRecall: string;
}

export interface NutritionPlan {
  justificationSummary: string;
  clinicalAnalysis: string;
  bodySculptingAdvice: string;
  metabolicBreakdown: string;
  bmi: number;
  tdee: number;
  nutritionalStatus: string;
  dailyCalories: number;
  macros: { p: number; c: number; f: number };
  balloomSlimProtocol: string;
  balloomSlimSchedule: string; 
  balloomSlimContraindications: string;
  metabolicGoals: string;
  fastingSchedule: string; 
  fastingDetails?: {
    type: string;
    window: string;
    allowedLiquids: string[];
    feedingRules: string;
  };
  masterWeek: {
    dayName: string;
    meals: {
      label: string;
      time: string;
      options: {
        name: string;
        ingredients: string[];
        preparation: string;
        calories: number;
      }[];
    }[];
  }[];
  progressionGuide: any[];
  shoppingList: string[];
}
