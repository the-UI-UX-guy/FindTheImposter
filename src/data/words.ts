export const CATEGORIES = [
  'Animals', 'Food', 'Places', 'Movies', 'Objects', 
  'Nature', 'Sports', 'Technology', 'Everyday Life', 'People'
] as const;

export type Category = typeof CATEGORIES[number];

export const WORD_DATABASE: Record<Category, string[]> = {
  Animals: [
    'Dog', 'Cat', 'Elephant', 'Penguin', 'Tiger', 'Dolphin', 'Giraffe', 
    'Kangaroo', 'Lion', 'Monkey', 'Zebra', 'Bear', 'Wolf', 'Rabbit', 'Fox'
  ],
  Food: [
    'Pizza', 'Burger', 'Biryani', 'Ice Cream', 'Pasta', 'Sushi', 'Taco', 
    'Salad', 'Pancake', 'Waffle', 'Steak', 'Donut', 'Sandwich', 'Curry'
  ],
  Places: [
    'Beach', 'Airport', 'School', 'Hospital', 'Mountain', 'Library', 
    'Museum', 'Park', 'Restaurant', 'Supermarket', 'Gym', 'Cinema'
  ],
  Movies: [
    'Action', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Documentary', 
    'Thriller', 'Animation', 'Fantasy', 'Drama'
  ],
  Objects: [
    'Umbrella', 'Laptop', 'Camera', 'Clock', 'Guitar', 'Bicycle', 'Phone', 
    'Wallet', 'Keys', 'Glasses', 'Backpack', 'Chair', 'Table', 'Lamp'
  ],
  Nature: [
    'Tree', 'River', 'Ocean', 'Forest', 'Desert', 'Sun', 'Moon', 'Star', 
    'Cloud', 'Rain', 'Snow', 'Flower', 'Grass', 'Rock'
  ],
  Sports: [
    'Football', 'Basketball', 'Tennis', 'Baseball', 'Golf', 'Swimming', 
    'Volleyball', 'Boxing', 'Cycling', 'Running'
  ],
  Technology: [
    'Internet', 'Robot', 'Software', 'Hardware', 'Algorithm', 'Battery', 
    'Screen', 'Keyboard', 'Mouse', 'Server', 'Cloud'
  ],
  'Everyday Life': [
    'Sleep', 'Work', 'Study', 'Eat', 'Shower', 'Drive', 'Walk', 'Talk', 
    'Listen', 'Read', 'Write', 'Clean'
  ],
  People: [
    'Doctor', 'Teacher', 'Engineer', 'Artist', 'Musician', 'Actor', 
    'Writer', 'Chef', 'Police', 'Firefighter', 'Pilot'
  ]
};

export const getRandomWordAndHint = (category: Category | 'RANDOM'): { secretWord: string, hintWord: string } => {
  let selectedCategory: Category;
  if (category === 'RANDOM') {
    selectedCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  } else {
    selectedCategory = category;
  }
  
  const words = WORD_DATABASE[selectedCategory];
  const wordIndex = Math.floor(Math.random() * words.length);
  const secretWord = words[wordIndex];
  
  // Pick a hint word from the same category that is not the secret word
  let hintIndex = Math.floor(Math.random() * words.length);
  while (hintIndex === wordIndex && words.length > 1) {
    hintIndex = Math.floor(Math.random() * words.length);
  }
  
  return { secretWord, hintWord: words[hintIndex] };
};
