import Frame from "@/components/layout/Frame";
import NotFoundMessage from "@/components/layout/NotFoundMessage";
import "./globals.css";

// Unmatched URLs render inside the bare root layout, so this brings its own frame and styles.
// notFound() from a portfolio page uses app/(site)/not-found.tsx, which is already framed.
export default function NotFound() {
  return (
    <Frame>
      <NotFoundMessage />
    </Frame>
  );
}
