import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface Recommendation {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function getTradingRecommendation(symbol: string, priceData: any[]): Promise<Recommendation> {
  const prompt = `Analiza los siguientes datos de mercado para ${symbol}:
  ${JSON.stringify(priceData.slice(-10))}
  
  Basado en estos datos, proporciona una recomendación de trading detallada.
  Responde únicamente en formato JSON con el siguiente esquema:
  {
    "action": "BUY" | "SELL" | "HOLD",
    "confidence": number (0-1),
    "reasoning": "explicación detallada en español",
    "riskLevel": "LOW" | "MEDIUM" | "HIGH"
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating recommendation:", error);
    return {
      action: 'HOLD',
      confidence: 0,
      reasoning: "No se pudo generar una recomendación en este momento.",
      riskLevel: 'LOW'
    };
  }
}
