// Direction of a navigation, for the page slide (view transitions): the
// header tabs go left → right, and a deeper path (a project) is "forward".

const ORDER = ["/", "/about-me", "/projects", "/arcade", "/terminal", "/contact-me"];

function topLevel(path: string) {
  const first = "/" + (path.split(/[?#]/)[0].split("/")[1] ?? "");
  return first === "/" ? "/" : first;
}

export type NavType = "nav-forward" | "nav-back";

export function navTypes(from: string, to: string): NavType[] {
  const a = topLevel(from);
  const b = topLevel(to);
  if (a === b) {
    const depth = (p: string) => p.split(/[?#]/)[0].split("/").filter(Boolean).length;
    const d = depth(to) - depth(from);
    return d > 0 ? ["nav-forward"] : d < 0 ? ["nav-back"] : [];
  }
  const ia = ORDER.indexOf(a);
  const ib = ORDER.indexOf(b);
  if (ia < 0 || ib < 0) return [];
  return [ib > ia ? "nav-forward" : "nav-back"];
}
