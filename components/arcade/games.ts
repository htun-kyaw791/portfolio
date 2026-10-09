// Game registry without the game code, so the palette and pages can list games
// without pulling any game into their bundle.

export const games = [
  { id: "snake", file: "snake.ts", label: "Snake", blurb: "eat 10 dots without biting yourself" },
  { id: "breakout", file: "breakout.ts", label: "Stack Smash", blurb: "breakout where the bricks are my tech stack" },
  { id: "typing", file: "typing.ts", label: "Typing test", blurb: "type real code from my projects" },
] as const;

export type GameId = (typeof games)[number]["id"];

export function isGameId(v: unknown): v is GameId {
  return games.some((g) => g.id === v);
}
