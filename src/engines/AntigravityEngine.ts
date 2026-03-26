import { GoogleGenerativeAI } from "@google/generative-ai";

export class AntigravityEngine {
  private genAI: GoogleGenerativeAI;
  private officeLocation = { lat: -6.175, lon: 106.827 };
  private maxDistance = 0.1; // 100 meters in km

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Validates if the given coordinates are within 100m of the office.
   */
  public validateGeoFence(lat: number, lon: number): boolean {
    const distance = this.calculateDistance(
      lat,
      lon,
      this.officeLocation.lat,
      this.officeLocation.lon
    );
    return distance <= this.maxDistance;
  }

  /**
   * Uses Gemini AI to check if the text is professional for a leave request.
   */
  public async smartFilter(text: string): Promise<{ isProfessional: boolean; reason?: string }> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following leave request reason and determine if it is professional or not. 
    If it contains slang, rude words, or unprofessional language, return JSON format: {"isProfessional": false, "reason": "brief explanation"}.
    Otherwise return {"isProfessional": true}.
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().replace(/```json|```/g, "").trim();
    
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // Fallback if AI doesn't return clean JSON
      return { isProfessional: !jsonStr.toLowerCase().includes("unprofessional") };
    }
  }

  /**
   * Haversine formula to calculate distance between two points in km.
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
