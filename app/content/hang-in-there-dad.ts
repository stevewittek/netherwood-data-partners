import type { Product } from "./products";

export const gamePath = "/games/hang-in-there-dad/";
export const redditGameUrl = "https://www.reddit.com/r/HangInThereDad/comments/1xm6tkb/hang_in_there_dad/";
export const gameBanner = "/images/hang-in-there-dad/game-banner.png";
export const gameMetadata = {
  title: "Hang in There, Dad! | Free Dad Joke Word Game | Netherwood Data Partners",
  description: "Play Hang in There, Dad!, a free Hangman-style word puzzle game inspired by dad jokes and family fun. Guess punchlines and help Dad escape ridiculous situations.",
  keywords: "Hang in There Dad, dad joke game, Hangman word game, Reddit games, free word puzzles, family-friendly games, casual puzzle games",
};
export const hangDadProduct: Product = {
  id: "hang-in-there-dad", slug: "hang-in-there-dad", name: "Hang in There, Dad!", shortName: "Hang in There, Dad!",
  status: "Free to Play", category: "Word Puzzle",
  summary: "A free Hangman-style word game. Guess the punchlines, help Dad escape ridiculous situations, and see how many jokes you can solve.",
  description: [], platforms: ["Family-Friendly", "Reddit Game"], productUrl: gamePath,
  openSource: false, featured: false, featureHeading: "How to Play", features: [],
  image: { src: "/images/hang-in-there-dad/oreo-tree-rescue.svg", width: 870, height: 520,
    alt: "Dad hangs from a tree branch beside Oreo the cat as his ladder tips away." },
};
export const gameSteps = [
  "Read the joke and look at the missing punchline.",
  "Guess letters to fill in the answer.",
  "Wrong guesses make Dad's situation progressively worse.",
  "Solve the punchline, save Dad, and continue to the next level.",
];
export const favoriteJokes = [
  { question: "Why did the scarecrow win an award?", answer: "Because he was outstanding in his field." },
  { question: "How can you tell a tree is a dogwood?", answer: "By its bark." },
  { question: "Why did the mushroom get invited to the party?", answer: "Because he's a fun guy." },
  { question: "Why did the tomato blush?", answer: "Because it saw the salad dressing." },
];
