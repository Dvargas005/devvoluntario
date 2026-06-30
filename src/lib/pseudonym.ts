import { createHash } from "crypto";

const COLORS = [
  "Crimson", "Amber", "Coral", "Teal", "Indigo",
  "Violet", "Azure", "Jade", "Copper", "Silver",
  "Golden", "Scarlet", "Cobalt", "Olive", "Ivory",
  "Slate", "Rust", "Sage", "Plum", "Onyx",
  "Ochre", "Sienna", "Cerulean", "Vermilion",
];

const ANIMALS = [
  "Jaguar", "Ocelot", "Tapir", "Macaw", "Sloth",
  "Otter", "Harpy Eagle", "Capybara", "Anteater", "Oilbird",
  "Spectacled Bear", "Red Siskin", "Curassow", "Peccary", "River Dolphin",
  "Howler Monkey", "Toucan", "Iguana", "Anaconda", "Caiman",
  "Flamingo", "Coati", "Armadillo", "Piranha", "Manatee",
  "Condor", "Puma", "Kinkajou", "Margay", "Tamarin",
];

export function generatePseudonym(userId: string): string {
  const hash = createHash("sha256").update(userId).digest("hex");

  const colorIndex = parseInt(hash.slice(0, 8), 16) % COLORS.length;
  const animalIndex = parseInt(hash.slice(8, 16), 16) % ANIMALS.length;
  const suffix = hash.slice(16, 18);

  return `${COLORS[colorIndex]} ${ANIMALS[animalIndex]} ${suffix}`;
}
