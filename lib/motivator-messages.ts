import type { MotivatorPersonality } from "@shared/schema";

/**
 * Motivational message contexts.
 *
 * - completed: habit marked done (no notable streak)
 * - streak: 3+ day streak
 * - milestone: 7, 14, 30, 60, or 100 day streak
 * - missed: habit not completed today
 * - relapse: broke a streak of 3+ days
 * - firstDay: first ever completion of a habit
 * - comeback: completed after 2+ missed days
 */
export type MotivatorContext =
  | "completed"
  | "streak"
  | "milestone"
  | "missed"
  | "relapse"
  | "firstDay"
  | "comeback"
  | "reminder";

export type MotivatorMessages = Record<
  MotivatorPersonality,
  Record<MotivatorContext, string[]>
>;

export const motivatorMessages: MotivatorMessages = {
  positive: {
    completed: [
      "\uD83C\uDF1F Amazing work! You're building great habits!",
      "\uD83D\uDCAA Keep it up! Every step counts!",
      "\u2728 You're on fire! Great job staying consistent!",
      "\uD83C\uDF89 Fantastic! You're making real progress!",
      "\uD83C\uDF08 Wonderful! Your dedication is inspiring!",
    ],
    streak: [
      "\uD83D\uDD25 You're on a roll! Keep that streak alive!",
      "\uD83C\uDF1F Consistency is your superpower!",
      "\uD83D\uDCAA Day after day, you show up. That's amazing!",
      "\u2B50 Streaks don't lie \u2014 you're doing great!",
      "\uD83C\uDFC6 Every day you keep going is a win!",
    ],
    milestone: [
      "\uD83C\uDF8A INCREDIBLE! What a milestone! You should be so proud!",
      "\uD83C\uDFC5 You've reached an amazing milestone! Celebrate this!",
      "\uD83D\uDE80 Look how far you've come! This is huge!",
      "\uD83C\uDF1F A milestone like this shows real commitment!",
      "\uD83E\uDD73 This calls for a celebration! What an achievement!",
    ],
    missed: [
      "\uD83C\uDF31 No worries! Tomorrow is a fresh start!",
      "\uD83D\uDCAB It's okay! Progress takes time. You've got this!",
      "\uD83C\uDF1F Don't give up! Every day is a new opportunity!",
      "\uD83D\uDC96 Be kind to yourself. Tomorrow you'll do better!",
      "\uD83C\uDF38 Small setbacks lead to bigger comebacks!",
    ],
    relapse: [
      "\uD83D\uDC9A Streaks end, but your journey doesn't. Start again!",
      "\uD83C\uDF31 A fresh start is just as brave as keeping going.",
      "\uD83D\uDCAB What matters is that you're still here. Try again!",
      "\u2764\uFE0F One slip doesn't erase all your progress.",
      "\uD83C\uDF1F You've done it before. You'll do it again!",
    ],
    firstDay: [
      "\uD83C\uDF89 Your first step! This is where it all begins!",
      "\uD83C\uDF1F Welcome to your new habit journey!",
      "\uD83D\uDE80 The hardest part is starting. You did it!",
      "\uD83C\uDF31 Day one is the most important day!",
      "\u2728 Every great journey starts with a single step!",
    ],
    comeback: [
      "\uD83D\uDCAA Welcome back! It takes courage to return!",
      "\uD83C\uDF1F You came back \u2014 that's what matters most!",
      "\uD83D\uDE80 Picking yourself up is the real victory!",
      "\uD83C\uDF08 Glad to see you back! Let's keep going!",
      "\u2764\uFE0F Coming back is harder than starting. Well done!",
    ],
    reminder: [
      "🌟 Hey! Time to check in on your habits!",
      "💪 Your habits are waiting for you! Let's go!",
      "✨ A quick check-in keeps the momentum alive!",
      "🌈 Don't forget — every day counts! Open up!",
      "🎯 You've got this! Time for your daily check-in!",
    ],
  },
  adaptive: {
    completed: [
      "\uD83D\uDCC8 Good progress! Consistency is key.",
      "\u2705 Well done! You're building momentum.",
      "\uD83C\uDFAF Nice work! Stay focused on your goals.",
      "\uD83D\uDCCA Solid effort! Keep tracking your progress.",
      "\u26A1 Good job! Small wins add up over time.",
    ],
    streak: [
      "\uD83D\uDCC8 Solid streak. Keep the momentum going.",
      "\u2705 Consistency pays off. You're proving it.",
      "\uD83C\uDFAF Day by day, you're building something real.",
      "\u26A1 Streaks reflect discipline. Nice work.",
      "\uD83D\uDCCA Your consistency is showing in the data.",
    ],
    milestone: [
      "\uD83C\uDFC5 Notable milestone. Take a moment to appreciate your effort.",
      "\uD83D\uDCC8 This milestone is evidence of real change.",
      "\uD83C\uDFAF Impressive. Use this as fuel for the next stretch.",
      "\u2705 A milestone worth noting. What's the next target?",
      "\u26A1 Significant progress. Keep applying what works.",
    ],
    missed: [
      "\uD83D\uDCDD Noted. What can you adjust for tomorrow?",
      "\uD83D\uDD04 Reset and try again. Learning from setbacks.",
      "\u2696\uFE0F Balance is important. Reflect and move forward.",
      "\uD83C\uDFAF Refocus on your why. What matters most?",
      "\uD83D\uDCDA Every miss is data. Use it to improve.",
    ],
    relapse: [
      "\uD83D\uDCDD Streak broken. Analyze what happened and adjust.",
      "\uD83D\uDD04 Setbacks are normal. The key is your next move.",
      "\u2696\uFE0F One break doesn't define your trajectory.",
      "\uD83D\uDCCA Review what led to the break. Adjust your approach.",
      "\uD83C\uDFAF Lost streak, not lost progress. Recalibrate.",
    ],
    firstDay: [
      "\u2705 First day logged. The foundation is set.",
      "\uD83D\uDCC8 Day one is data point one. Build from here.",
      "\uD83C\uDFAF Good start. Now focus on day two.",
      "\u26A1 You've begun. Consistency will do the rest.",
      "\uD83D\uDCCA First entry recorded. Track your trajectory.",
    ],
    comeback: [
      "\uD83D\uDD04 You're back. That matters more than the gap.",
      "\uD83D\uDCC8 Returning shows intent. Now build consistency.",
      "\u2705 Welcome back. Pick up where you left off.",
      "\uD83C\uDFAF The gap happened. Focus on what's ahead.",
      "\u26A1 Resuming is a decision. Good one.",
    ],
    reminder: [
      "📋 Time for your daily habit check-in.",
      "⏰ Reminder: log your habits while it's fresh.",
      "📊 Your habits won't track themselves. Check in now.",
      "✅ Daily review time. How did today go?",
      "🎯 Stay on track — open up and log your progress.",
    ],
  },
  harsh: {
    completed: [
      "\uD83D\uDCAF Finally! Don't let this be a one-time thing.",
      "\uD83D\uDD25 About time! Keep this energy going.",
      "\u26A1 Good. Now prove you can do it again.",
      "\uD83D\uDCAA Decent work. Don't get comfortable.",
      "\uD83C\uDFAF One day down. Many more to go.",
    ],
    streak: [
      "\uD83D\uDD25 A streak means nothing if you break it tomorrow.",
      "\uD83C\uDFAF Don't celebrate yet. Keep pushing.",
      "\u26A1 Good, you're consistent. Don't let it slip.",
      "\uD83D\uDCAA Streaks are built daily. Show up tomorrow too.",
      "\uD83D\uDCAF Not bad. But can you double it?",
    ],
    milestone: [
      "\uD83C\uDFC5 Milestone hit. Now set a bigger one.",
      "\uD83D\uDD25 Impressive. But complacency kills progress.",
      "\u26A1 You proved you can do it. Now keep proving it.",
      "\uD83C\uDFAF Good number. The next one should be bigger.",
      "\uD83D\uDCAF Milestone reached. The real test is what comes next.",
    ],
    missed: [
      "\u274C Really? You had one job today.",
      "\uD83D\uDEAB Excuses won't build habits. Action will.",
      "\u23F0 Time wasted. No shortcuts to success.",
      "\uD83D\uDC94 Another missed opportunity. When will you learn?",
      "\uD83D\uDD04 Here we go again. Prove me wrong tomorrow.",
    ],
    relapse: [
      "\u274C All that progress, gone. Was it worth skipping?",
      "\uD83D\uDC94 You broke the streak. Now you know how it feels.",
      "\uD83D\uDEAB Back to zero. How many times will this happen?",
      "\u23F0 Discipline failed. Rebuild it or don't bother.",
      "\uD83D\uDD04 Streak lost. Are you going to cry about it or fix it?",
    ],
    firstDay: [
      "\u26A1 Day one. Talk is cheap. Show up tomorrow.",
      "\uD83C\uDFAF You started. That's the bare minimum.",
      "\uD83D\uDD25 One day means nothing. Prove it was real.",
      "\uD83D\uDCAA Don't pat yourself on the back yet. This is just the start.",
      "\uD83D\uDCAF Everyone starts. Few continue. Which are you?",
    ],
    comeback: [
      "\uD83D\uDD04 Back again? Let's see if you actually stick around this time.",
      "\u26A1 You left. You came back. Don't make leaving a habit.",
      "\uD83C\uDFAF Returning is easy. Staying is the hard part.",
      "\uD83D\uDCAA Glad you're back. Now prove you mean it.",
      "\uD83D\uDD25 The gap on your record doesn't lie. Fix it.",
    ],
    reminder: [
      "⏰ Your habits aren't going to log themselves.",
      "🔥 No excuses. Open the app and check in.",
      "💀 Skipping your check-in? That's how streaks die.",
      "⚡ You committed to this. Time to show up.",
      "🎯 Don't be lazy. Open the app. Now.",
    ],
  },
};
