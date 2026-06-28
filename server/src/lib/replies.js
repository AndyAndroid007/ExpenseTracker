/**
 * Centralized Conversational Replies Registry
 * Stores template functions for user-facing system messages and alerts.
 */
export const REPLIES = {
  welcome: [
    () => "Hey! 👋 I'm Spendly. Tell me what you spent today, or say 'no spend' if you didn't spend anything.",
    () => "Hello! 💰 Ready to track some expenses? Tell me what you bought today, or say 'no spend' if you saved it all!",
    () => "Hey there! 🚀 Let's log your expenses. What did you spend today? (or tell me 'no spend' if you saved)",
    () => "Welcome! 👋 Spendly at your service. Tell me how much you spent today, or say 'no spend'.",
    () => "Hi! Ready to build your streak? Log an expense or tell me 'no spend'!"
  ],
  parse_failure: [
    () => "Hmm, I couldn't catch that. Try: 'Spent 200 on food' or 'no spend today'.",
    () => "Sorry, I didn't quite get that. Try something like 'Rent 15000' or 'no spend yesterday'.",
    () => "I'm not sure how to parse that. Could you format it like 'Lunch 120' or 'no spend today'?",
    () => "Whoops! That didn't match. Try telling me: 'Swiggy 300' or 'did not spend today'.",
    () => "Hmm, I couldn't process that sentence. Try: 'Spent 150 on taxi' or 'zero spend today'."
  ],
  query_redirect: [
    () => "I can only help you log expenses or save days right now.",
    () => "I'm focused on logging expenses and streaks for now! Try logging one instead.",
    () => "I can't answer queries yet. Let's stick to logging your spending or saving!",
    () => "Currently, I can only help you log transactions and maintain streaks.",
    () => "That sounds like a question, but I can only track your expenses right now!"
  ],
  chitchat: [
    () => "Doesn't look like an expense — try something like 'spent 200 on lunch' or 'no spend today'.",
    () => "Just chitchatting? Let's log an expense instead! Try 'Coffee 150'.",
    () => "Let me help you track money! Tell me what you spent today, or say 'no spend'.",
    () => "I'm all ears, but I can only log transactions. Try: 'Spent 400 on petrol'.",
    () => "Not sure if that's an expense. Try logging something like 'Uber 200' or 'no spend'."
  ],
  future_rejection: [
    () => "Nice try, time traveler! 🚀 We can't log expenses for future dates. Don't get ahead of yourself!",
    () => "Whoa, back to the future! 🛸 We can't log expenses for future dates. Don't get ahead of yourself!",
    () => "Nice try, time traveler! 🔮 We can't log future expenses. Live in the moment and don't get ahead of yourself!",
    () => "Whoa, time traveler! 🚀 We can't log expenses for future dates. Don't get ahead of yourself!",
    () => "Hold on, time traveler! 🛸 Future logging is disabled. Live in the present!"
  ],
  expense_confirmation: [
    ({ amount, category }) => `₹${amount} added under ${category} for today. Edit?`,
    ({ amount, category }) => `Logged ₹${amount} for ${category}. Want to make changes?`,
    ({ amount, category }) => `Got it! ₹${amount} under ${category}. Confirm or edit?`,
    ({ amount, category }) => `Saved ₹${amount} under ${category}. Correct?`,
    ({ amount, category }) => `Added ₹${amount} to ${category}. Confirm or edit?`
  ],
  no_spend_confirmation: [
    ({ streak }) => `Got it! No-spend day logged. 🔥 Streak: ${streak} days`,
    ({ streak }) => `Awesome, zero spending today logged! 🔥 Streak: ${streak} days`,
    ({ streak }) => `Log saved! No spending today. 🔥 Streak: ${streak} days`,
    ({ streak }) => `Streak maintained! Zero spending logged. 🔥 Streak: ${streak} days`,
    ({ streak }) => `No-spend logged! Keep it up. 🔥 Streak: ${streak} days`
  ],
  save_day_confirmation: [
    ({ amount, streak }) => `Awesome! Saved ₹${amount} today. 💰 Streak: ${streak} days`,
    ({ amount, streak }) => `Logged! You saved ₹${amount} today. 💰 Streak: ${streak} days`,
    ({ amount, streak }) => `Saved ₹${amount} logged. Great job! 💰 Streak: ${streak} days`,
    ({ amount, streak }) => `Added savings of ₹${amount}. 💰 Streak: ${streak} days`,
    ({ amount, streak }) => `₹${amount} saved today logged successfully! 💰 Streak: ${streak} days`
  ]
};

/**
 * Retrieves a random template string for a given category.
 * 
 * @param {string} category - Category key matching REPLIES
 * @param {object} params - Dynamic parameters passed to the template function
 * @returns {string} Formatted response string
 */
export const getRandomReply = (category, params = {}) => {
  const list = REPLIES[category];
  if (!list || list.length === 0) {
    throw new Error(`Reply category '${category}' not found in REPLIES registry`);
  }
  const index = Math.floor(Math.random() * list.length);
  return list[index](params);
};

export default getRandomReply;
