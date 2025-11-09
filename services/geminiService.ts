import { GoogleGenAI, Type } from "@google/genai";
import type { SavingsGoal, AdvancedFinancials, IntermediateFinancials, BasicFinancials, AccuracyLevel } from "../types";
import { AccuracyLevel as AccuracyLevelEnum } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (
    accuracyLevel: AccuracyLevel, 
    financials: any, 
    targetAmount: number, 
    deadline: Date,
    completedRecommendations: string[],
    currentWeek: number
): string => {
    const goalStr = `The user's goal is to save £${targetAmount.toFixed(2)} by ${deadline.toLocaleDateString('en-GB')}. The response must be encouraging, actionable, and tailored to the level of detail provided.`;
    
    const progressContext = `The user is now on week ${currentWeek} of their savings plan. Their required daily savings amount is gradually increasing.`;
    
    let completedContext = '';
    if (completedRecommendations.length > 0) {
        completedContext = `In previous weeks, they have successfully completed the following tasks: "${completedRecommendations.join('", "')}". Do not suggest these again.`;
    }

    const instruction = `Your task is to provide exactly 3 new, actionable savings recommendations. These recommendations should be slightly more challenging or build upon previous successes, helping the user find further small cuts to meet their increasing daily savings targets.`;


    switch(accuracyLevel) {
        case AccuracyLevelEnum.ADVANCED: {
            const f = financials as AdvancedFinancials;
            const transactionsSummary = f.transactions.slice(0, 50).map(t => `${t.description}: £${t.amount.toFixed(2)}`).join('; ');
            return `Analyze the user's recent spending history: ${transactionsSummary}.
${progressContext}
${completedContext}
${instruction}
Your analysis should:
1. Identify spending trends and patterns (e.g., high spending on weekends, frequent small purchases at specific stores, patterns in dining out).
2. Auto-categorize their main spending areas (e.g., Groceries, Dining Out, Transport, Subscriptions).
3. Based on the trends, identify the top 2-3 areas with the most potential for savings.
4. Provide specific, actionable weekly reduction targets for these categories as part of your 3 recommendations.
5. DO NOT suggest cancelling subscriptions, but you may comment if they form a large portion of spending.
6. Finally, provide an overall total weekly spending reduction target as a single number.
${goalStr}`;
        }
        case AccuracyLevelEnum.INTERMEDIATE: {
            const f = financials as IntermediateFinancials;
            const expensesStr = f.recurringExpenses.map(e => `${e.name} (£${e.amount.toFixed(2)})`).join(', ');
            return `A user provides their financials: monthly income £${f.monthlyIncome}, monthly spending £${f.monthlySpending}, weekly grocery spending £${f.weeklyGroceries}, and recurring expenses: ${expensesStr}.
${progressContext}
${completedContext}
${instruction}
Your task is to provide actionable savings advice with these rules:
1. Focus on weekly savings targets for negotiable categories like groceries.
2. You MUST NOT recommend cancelling any subscriptions.
3. However, if the list of recurring expenses is large (e.g., >10 items) or their total cost is a high percentage of monthly spending, you may make an observation about it without suggesting cancellation. For example: 'I notice a number of subscriptions contribute to your monthly expenses.'
4. Provide a total weekly spending reduction target as a single number.
${goalStr}`;
        }
        case AccuracyLevelEnum.BASIC:
        default: {
            const f = financials as BasicFinancials;
            return `A user has a monthly income of £${f.monthlyIncome} and spends about £${f.monthlySpending} per month. 
${progressContext}
${completedContext}
${instruction}
Your task is to:
1. Provide some general savings advice in the intro. Start by explaining that providing more details (like grocery spending or transaction history) would allow for a more personalized savings plan.
2. Suggest a single, achievable weekly spending reduction target as a number.
${goalStr}`;
        }
    }
}

export const getRecommendations = async (
    goal: SavingsGoal,
    completedRecommendations: string[],
    currentWeek: number
): Promise<{ intro: string; recommendations: { area: string; advice: string }[]; weeklySpendingReductionTarget: number; }> => {
  const { financials, accuracyLevel, targetAmount, deadline } = goal;

  const prompt = buildPrompt(accuracyLevel, financials, targetAmount, deadline, completedRecommendations, currentWeek);
  
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
                description: "A short, encouraging introductory sentence about this week's savings plan, tailored to the user's accuracy level and progress."
            },
            recommendations: {
              type: Type.ARRAY,
              description: "A list of exactly 3 new, actionable saving recommendations for the current week.",
              items: {
                type: Type.OBJECT,
                properties: {
                    area: {
                        type: Type.STRING,
                        description: "The category or area for the saving tip (e.g., 'Groceries', 'Spending Trend')."
                    },
                    advice: {
                        type: Type.STRING,
                        description: "The specific advice or target (e.g., 'Reduce by £10 per week', 'Review weekend spending')."
                    }
                },
                required: ["area", "advice"],
              },
              minItems: 3,
              maxItems: 3,
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
    return { intro: "Here are some general tips to get you started.", recommendations: [{ area: "General", advice: "Review your subscriptions and cancel any you don't use." }, {area: "Groceries", advice: "Try own-brand products."}, {area: "Eating Out", advice: "Pack lunch once a week."}], weeklySpendingReductionTarget: 0 };
  } catch (error) {
    console.error("Error fetching recommendations from Gemini:", error);
    return { intro: "Could not fetch AI tips at the moment.", recommendations: [{ area: "Error", advice: "There was an issue connecting to the AI. Please try again later." }], weeklySpendingReductionTarget: 0 };
  }
};