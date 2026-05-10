/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { DriveCareAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Kamu adalah AI Smart Maintenance Manager bernama DriveCare.
Fokus utamamu adalah melacak perawatan rutin motor Indonesia berdasarkan identitas motor yang didaftarkan.

Tugasmu:
1. Menganalisis kondisi komponen berdasarkan KM saat ini dan riwayat servis.
2. Memberikan status 'safe' (aman/rutin), 'warning' (mulai perlu perhatian), atau 'danger' (overdue/bahaya) untuk setiap komponen utama.
3. Komponen yang WAJIB dianalisis: Oli Mesin, Oli Gardan (jika matic), Ban, Kampas Rem, CVT/Rantai, Aki, Filter Udara, Busi.
4. Berikan alasan singkat kenapa komponen tersebut berstatus demikian.

Format jawaban harus JSON. Bahasa Indonesia natural dan praktis.
`;

export async function analyzeMotorcycle(userInput: string): Promise<DriveCareAnalysis> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            motor: { type: Type.STRING },
            brand: { type: Type.STRING },
            type: { type: Type.STRING },
            estimated_km: { type: Type.NUMBER },
            health_score: { type: Type.NUMBER },
            priority_level: { type: Type.STRING },
            maintenance_checklist: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["safe", "warning", "danger"] },
                  last_service: { type: Type.STRING },
                  recommendation: { type: Type.STRING }
                },
                required: ["id", "name", "status", "recommendation"]
              }
            },
            safety_tip: { type: Type.STRING },
            summary: { type: Type.STRING }
          },
          required: [
            "motor", "brand", "type", "estimated_km", "health_score", 
            "priority_level", "maintenance_checklist", "safety_tip", "summary"
          ]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as DriveCareAnalysis;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
}
