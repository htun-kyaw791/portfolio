/** ">_" terminal mark used for the favicon and apple touch icon. */
export function BrandIcon({ size }: { size: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#011627",
        border: `${Math.max(1, size / 32)}px solid #1e2d3d`,
        borderRadius: size * 0.22,
        fontFamily: "Fira Code",
        fontWeight: 600,
        fontSize: size * 0.5,
        letterSpacing: -size * 0.04,
      }}
    >
      <span style={{ color: "#43d9ad" }}>&gt;</span>
      <span style={{ color: "#fea55f" }}>_</span>
    </div>
  );
}
