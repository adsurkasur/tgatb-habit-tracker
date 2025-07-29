import { MotivatorPersonality, HabitType } from "@shared/schema";

interface MotivatorMessage {
  success: string[];
  failure: string[];
}

const motivatorMessages: Record<MotivatorPersonality, MotivatorMessage> = {
  positive: {
    success: [
      "🌟 Amazing work! You're building great habits!",
      "💪 Keep it up! Every step counts!",
      "✨ You're on fire! Great job staying consistent!",
      "🎉 Fantastic! You're making real progress!",
      "🌈 Wonderful! Your dedication is inspiring!",
    ],
    failure: [
      "🌱 No worries! Tomorrow is a fresh start!",
      "💫 It's okay! Progress takes time. You've got this!",
      "🌟 Don't give up! Every day is a new opportunity!",
      "💖 Be kind to yourself. Tomorrow you'll do better!",
      "🌸 Small setbacks lead to bigger comebacks!",
    ],
  },
  adaptive: {
    success: [
      "📈 Good progress! Consistency is key.",
      "✅ Well done! You're building momentum.",
      "🎯 Nice work! Stay focused on your goals.",
      "📊 Solid effort! Keep tracking your progress.",
      "⚡ Good job! Small wins add up over time.",
    ],
    failure: [
      "📝 Noted. What can you adjust for tomorrow?",
      "🔄 Reset and try again. Learning from setbacks.",
      "⚖️ Balance is important. Reflect and move forward.",
      "🎯 Refocus on your why. What matters most?",
      "📚 Every miss is data. Use it to improve.",
    ],
  },
  harsh: {
    success: [
      "💯 Finally! Don't let this be a one-time thing.",
      "🔥 About time! Keep this energy going.",
      "⚡ Good. Now prove you can do it again.",
      "💪 Decent work. Don't get comfortable.",
      "🎯 One day down. Many more to go.",
    ],
    failure: [
      "❌ Really? You had one job today.",
      "🚫 Excuses won't build habits. Action will.",
      "⏰ Time wasted. No shortcuts to success.",
      "💔 Another missed opportunity. When will you learn?",
      "🔄 Here we go again. Prove me wrong tomorrow.",
    ],
  },
};

export class Motivator {
  static getMessage(
    personality: MotivatorPersonality,
    success: boolean,
    habitType: HabitType,
    streak: number
  ): string {
    const messages = motivatorMessages[personality];
    const messageArray = success ? messages.success : messages.failure;
    
    // For bad habits, flip the success/failure logic
    const actualSuccess = habitType === "bad" ? !success : success;
    const actualMessages = actualSuccess ? messages.success : messages.failure;
    
    const randomIndex = Math.floor(Math.random() * actualMessages.length);
    let message = actualMessages[randomIndex];
    
    // Add streak information for good performance
    if (actualSuccess && streak > 1) {
      message += ` (${streak} day streak!)`;
    }
    
    return message;
  }

  static getPersonalityDescription(personality: MotivatorPersonality): string {
    switch (personality) {
      case "positive":
        return "Encouraging and supportive";
      case "adaptive":
        return "Balanced and realistic";
      case "harsh":
        return "Direct and challenging";
    }
  }
}
