import { GoogleGenAI, Type } from "@google/genai";
import type { SavingsGoal, AdvancedFinancials, IntermediateFinancials, BasicFinancials, AccuracyLevel } from "../types";
import { AccuracyLevel as AccuracyLevelEnum } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (accuracyLevel: AccuracyLevel, financials: any, targetAmount: number, deadline: Date): string => {
    const goalStr = `The user's goal is to save £${targetAmount.toFixed(2)} by ${deadline.toLocaleDateString('en-GB')}. The response must be encouraging and actionable.`;

    switch(accuracyLevel) {
        case AccuracyLevelEnum.ADVANCED: {
            const f = financials as AdvancedFinancials;
            // Summarize to fit context window and anonymize a bit.
            const transactionsSummary = f.transactions.slice(0, 50).map(t => `${t.description}: £${t.amount.toFixed(2)}`).join('; ');
            return `Analyze the user's recent spending: ${transactionsSummary}. Auto-categorize their main spending areas (e.g., Groceries, Dining Out, Transport). Identify the top 2-3 categories with the most potential for savings. Provide specific, actionable weekly reduction targets for these categories to help them meet their goal. Finally, provide an overall total weekly spending reduction target as a number. ${goalStr}`;
        }
        case AccuracyLevelEnum.INTERMEDIATE: {
            const f = financials as IntermediateFinancials;
            const expensesStr = f.recurringExpenses.map(e => `${e.name} (£${e.amount})`).join(', ');
            return `A user has monthly income £${f.monthlyIncome}, monthly spending £${f.monthlySpending}, weekly grocery spending £${f.weeklyGroceries}, and recurring expenses: ${expensesStr}. Suggest a target for reducing their weekly grocery bill and provide one targeted recommendation for another recurring expense to help them achieve their goal. Also provide a total weekly spending reduction target as a number. ${goalStr}`;
        }
        case AccuracyLevelEnum.BASIC:
        default: {
            const f = financials as BasicFinancials;
            return `A user has a monthly income of £${f.monthlyIncome} and spends about £${f.monthlySpending} per month. Based on this, suggest a single, achievable weekly spending reduction target (as a number) to help them reach their goal. ${goalStr}`;
        }
    }
}

export const getRecommendations = async (goal: SavingsGoal): Promise<{ intro: string; recommendations: { area: string; advice: string }[]; weeklySpendingReductionTarget: number; }> => {
  const { financials, accuracyLevel, targetAmount, deadline } = goal;

  const prompt = buildPrompt(accuracyLevel, financials, targetAmount, deadline);
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intro: {
                type: Type.STRING,
                description: "A short, encouraging introductory sentence about the savings plan."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "A list of actionable saving recommendations.",
              items: {
                type: Type.OBJECT,
                properties: {
                    area: {
                        type: Type.STRING,
                        description: "The category or area for the saving tip (e.g., 'Groceries', 'Weekly Spending')."
                    },
                    advice: {
                        type: Type.STRING,
                        description: "The specific advice or target (e.g., 'Reduce by £10 per week', 'Cancel one subscription')."
                    }
                },
                required: ["area", "advice"],
              }
            },
            weeklySpendingReductionTarget: {
                type: Type.NUMBER,
                description: "The total recommended reduction in weekly spending, as a single number (e.g., 15.50)."
            }
          },
          required: ["intro", "recommendations", "weeklySpendingReductionTarget"],
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    if (result && result.recommendations) {
      return result;
    }
    
    // Fallback in case of unexpected response format
    return { intro: "Here are some general tips to get you started.", recommendations: [{ area: "General", advice: "Review your subscriptions and cancel any you don't use." }], weeklySpendingReductionTarget: 0 };
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    return { intro: "Could not fetch AI tips at the moment.", recommendations: [{ area: "Error", advice: "There was an issue connecting to the AI. Please try again later." }], weeklySpendingReductionTarget: 0 };
  }
};