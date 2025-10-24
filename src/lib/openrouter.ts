interface GymPlanRequest {
  fitnessGoal: string;
  fitnessLevel: string;
  daysPerWeek: number;
  equipmentAccess: string;
}

interface GymPlanResponse {
  planContent: {
    overview: string;
    goals: string[];
    weeklySchedule: DaySchedule[];
    progressionNotes: string;
  };
  weeklySchedule: DaySchedule[];
}

interface DaySchedule {
  day: number;
  dayName: string;
  focus: string;
  exercises: ExerciseDetail[];
}

interface ExerciseDetail {
  name: string;
  sets: number;
  reps: string;
  weight: string;
  notes?: string;
}

export async function generateGymPlan(request: GymPlanRequest): Promise<GymPlanResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  const prompt = buildPrompt(request);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert fitness trainer and workout plan designer. Create detailed, practical workout plans tailored to individual goals and constraints. Always provide structured, actionable plans with specific exercises, sets, and reps.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenRouter API');
    }

    return parseAIResponse(content, request);
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}

function buildPrompt(request: GymPlanRequest): string {
  const { fitnessGoal, fitnessLevel, daysPerWeek, equipmentAccess } = request;

  return `Create a comprehensive ${daysPerWeek}-day per week gym workout plan with the following details:

**User Profile:**
- Fitness Goal: ${formatGoal(fitnessGoal)}
- Experience Level: ${formatLevel(fitnessLevel)}
- Training Days Per Week: ${daysPerWeek}
- Equipment Access: ${formatEquipment(equipmentAccess)}

**Requirements:**
1. Provide a brief overview of the plan (2-3 sentences)
2. List 3-5 specific goals this plan will help achieve
3. Create a detailed weekly schedule with ${daysPerWeek} workout days
4. For each workout day, include:
   - Day number and name (e.g., "Day 1 - Upper Body")
   - Primary focus area
   - 5-8 specific exercises with sets, reps, and weight guidance
   - Brief notes on form or progression when relevant
5. Add progression notes for how to advance the plan over 4-8 weeks

**Output Format:**
Please structure your response as JSON with this exact format:
{
  "overview": "Brief plan overview",
  "goals": ["Goal 1", "Goal 2", "Goal 3"],
  "weeklySchedule": [
    {
      "day": 1,
      "dayName": "Upper Body Push",
      "focus": "Chest, Shoulders, Triceps",
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": "8-10",
          "weight": "Start with 60-70% of 1RM",
          "notes": "Focus on controlled descent"
        }
      ]
    }
  ],
  "progressionNotes": "How to progress over time"
}

Make the plan challenging but appropriate for a ${formatLevel(fitnessLevel)} level trainee. Be specific with exercise names, rep ranges, and practical weight guidelines.`;
}

function formatGoal(goal: string): string {
  const goals: Record<string, string> = {
    weight_loss: 'Weight Loss & Fat Burning',
    muscle_gain: 'Muscle Growth & Hypertrophy',
    strength: 'Strength & Power Development',
    endurance: 'Endurance & Conditioning',
    general_fitness: 'General Fitness & Health',
  };
  return goals[goal] || goal;
}

function formatLevel(level: string): string {
  const levels: Record<string, string> = {
    beginner: 'Beginner (0-1 years training)',
    intermediate: 'Intermediate (1-3 years training)',
    advanced: 'Advanced (3+ years training)',
  };
  return levels[level] || level;
}

function formatEquipment(equipment: string): string {
  const equipmentTypes: Record<string, string> = {
    gym: 'Full Gym Access (barbells, dumbbells, machines, cables)',
    home: 'Home Equipment (dumbbells, resistance bands, adjustable bench)',
    bodyweight: 'Bodyweight Only (minimal equipment)',
  };
  return equipmentTypes[equipment] || equipment;
}

function parseAIResponse(content: string, request: GymPlanRequest): GymPlanResponse {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.overview || !parsed.weeklySchedule || !Array.isArray(parsed.weeklySchedule)) {
      throw new Error('Invalid AI response structure');
    }

    return {
      planContent: {
        overview: parsed.overview,
        goals: parsed.goals || [],
        weeklySchedule: parsed.weeklySchedule,
        progressionNotes: parsed.progressionNotes || '',
      },
      weeklySchedule: parsed.weeklySchedule,
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    console.log('Raw AI response:', content);

    return generateFallbackPlan(request);
  }
}

function generateFallbackPlan(request: GymPlanRequest): GymPlanResponse {
  const { fitnessGoal, fitnessLevel, daysPerWeek, equipmentAccess } = request;

  const fallbackSchedule: DaySchedule[] = Array.from({ length: daysPerWeek }, (_, i) => ({
    day: i + 1,
    dayName: `Day ${i + 1} - Full Body`,
    focus: 'Full Body Workout',
    exercises: [
      {
        name: 'Squats',
        sets: 3,
        reps: '10-12',
        weight: 'Bodyweight or light weight',
      },
      {
        name: 'Push-ups',
        sets: 3,
        reps: '8-12',
        weight: 'Bodyweight',
      },
      {
        name: 'Rows',
        sets: 3,
        reps: '10-12',
        weight: 'Light to moderate',
      },
      {
        name: 'Plank',
        sets: 3,
        reps: '30-60 seconds',
        weight: 'Bodyweight',
      },
    ],
  }));

  return {
    planContent: {
      overview: `A ${daysPerWeek}-day per week ${formatGoal(fitnessGoal).toLowerCase()} plan for ${formatLevel(fitnessLevel).split(' ')[0].toLowerCase()} level with ${formatEquipment(equipmentAccess).toLowerCase()}.`,
      goals: [
        `Achieve ${formatGoal(fitnessGoal).toLowerCase()}`,
        'Build consistent training habits',
        'Improve overall fitness and health',
      ],
      weeklySchedule: fallbackSchedule,
      progressionNotes: 'Increase weight by 5-10% when you can complete all sets with good form.',
    },
    weeklySchedule: fallbackSchedule,
  };
}
