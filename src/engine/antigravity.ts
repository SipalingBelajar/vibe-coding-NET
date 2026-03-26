import { GoogleGenerativeAI } from "@google/generative-ai";

export class Antigravity {
  private static officeLocation = { lat: -6.175, lng: 106.827 };
  private static threshold = 0.1; // 100 meters in km

  /**
   * Validates if the given coordinates are within 100m of the office.
   */
  public static validateRequest(lat: number, lng: number): { allowed: boolean; message?: string } {
    const distance = this.calculateDistance(
      lat,
      lng,
      this.officeLocation.lat,
      this.officeLocation.lng
    );

    if (distance > this.threshold) {
      return { allowed: false, message: 'Kamu di luar jangkauan kantor!' };
    }

    return { allowed: true };
  }

  /**
   * Uses Gemini AI to check if the reason text contains rude or impolite words.
   */
  public static async checkReason(text: string): Promise<{ valid: boolean }> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || "";
    if (!apiKey) {
      // If API key is missing, fail safe (assume invalid if we can't check) 
      // or return valid: true to not block user? 
      // Let's assume we need to check.
      return { valid: false };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following text for rude, impolite, or unprofessional language. 
    If it is rude or impolite, return "false". Otherwise return "true". 
    Text: "${text}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const resultText = response.text().toLowerCase().trim();

    return { valid: resultText.includes("true") };
  }

  /**
   * Haversine formula to calculate distance between two points in km.
   */
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
