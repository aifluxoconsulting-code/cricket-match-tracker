export const TEAMS = {
  yeakub: { id: "yeakub", name: "Yeakub Mollah Cricket Team", short: "Yeakub Mollah" },
  akash: { id: "akash", name: "Akash Cricket Team", short: "Akash" },
} as const;

export type TeamId = keyof typeof TEAMS;

export const PREDEFINED_PLAYERS = [
  "Munna",
  "Shahin Bhai",
  "Jia Bhai",
  "Hassan",
  "Shuvo Bhai",
  "Saddam Bhai",
  "Roman",
  "Kashem Bhai",
  "Dula Bhai",
  "Onik Bhai",
  "Fahim Bhai",
  "Shopon",
  "Rakib Bhai",
];
