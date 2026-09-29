const CATEGORIES = [
  'Animals', 'Food', 'Places', 'Movies', 'Objects', 
  'Nature', 'Sports', 'Technology', 'Everyday Life', 'People'
];

const WORD_DATABASE = {
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
    'Sleeping', 'Eating', 'Driving', 'Shopping', 'Cooking', 'Reading', 
    'Cleaning', 'Walking', 'Working', 'Talking'
  ],
  People: [
    'Doctor', 'Teacher', 'Police', 'Chef', 'Artist', 'Musician', 
    'Engineer', 'Scientist', 'Actor', 'Writer'
  ]
};

const getRandomWordAndHint = (category, difficulty = 'EASY') => {
  let selectedCategory = category;
  
  if (category === 'RANDOM' || !WORD_DATABASE[category]) {
    const randomIndex = Math.floor(Math.random() * CATEGORIES.length);
    selectedCategory = CATEGORIES[randomIndex];
  }
  
  const words = WORD_DATABASE[selectedCategory];
  const wordIndex = Math.floor(Math.random() * words.length);
  const secretWord = words[wordIndex];
  
  // Basic hint for now
  const hintWord = `Starts with ${secretWord.charAt(0)}`;
  
  return { secretWord, hintWord, selectedCategory };
};

module.exports = {
  CATEGORIES,
  WORD_DATABASE,
  getRandomWordAndHint
};
