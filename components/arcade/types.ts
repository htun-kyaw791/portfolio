import type { TechType } from "@/lib/taxonomy";

export type ArcadeTech = { title: string; type: TechType };

export type GameProps = {
  technos: readonly ArcadeTech[];
  /** Called once per winning round; the console shows the continue link. */
  onWin: () => void;
};
