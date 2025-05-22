import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BotService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    this.model = this.genAI.getGenerativeModel({
      model: 'models/gemini-1.5-flash-latest', // Gunakan model yang tersedia
    });
  }

  async generateResponse(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }
}
