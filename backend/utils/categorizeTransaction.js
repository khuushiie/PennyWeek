const categorizeTransaction = (note) => {
  console.log('categorizeTransaction called with note:', note); // Debug
  if (!note || typeof note !== 'string') {
    console.log('Invalid note, returning Uncategorized');
    return 'Uncategorized';
  }

  const lowerNote = note.toLowerCase();
  const rules = [
    { keywords: ['restaurant', 'food', 'dinner', 'lunch', 'groceries'], category: 'Food' },
    { keywords: ['taxi', 'uber', 'transport', 'bus', 'train', 'fare'], category: 'Transport' },
    { keywords: ['electricity', 'water', 'internet', 'phone', 'bill'], category: 'Utilities' },
    { keywords: ['salary', 'wage', 'paycheck'], category: 'Salary' },
    { keywords: ['freelance', 'project', 'gig'], category: 'Freelance' },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => lowerNote.includes(keyword))) {
      console.log('Matched category:', rule.category, 'for keywords:', rule.keywords);
      return rule.category;
    }
  }

  console.log('No match, returning Uncategorized');
  return 'Uncategorized';
};

module.exports = categorizeTransaction;