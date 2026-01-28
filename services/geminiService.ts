
import { GoogleGenAI } from "@google/genai";
import { Employee } from "../types";

export const getAIInsights = async (employees: Employee[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const dataSummary = employees.map(emp => ({
    nome: emp.name,
    cargo: emp.position,
    diasTrabalhados: emp.entries.length,
    entradas: emp.entries.map(e => ({ tipo: e.type, data: e.date }))
  }));

  const prompt = `
    Analise os dados deste lava-jato e forneça 3 insights estratégicos curtos (máximo 2 frases cada) para o dono.
    Foque em: produtividade, custo de folha ou sugestões de bônus.
    Dados dos funcionários: ${JSON.stringify(dataSummary)}
    Responda em Português.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights da IA:", error);
    return "Não foi possível gerar insights no momento. Tente novamente mais tarde.";
  }
};
