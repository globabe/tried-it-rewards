import mark from "@/assets/triedit-mark.png.asset.json";

export function BrandLogo({
  size = 34,
  showWordmark = true,
  subtitle,
}: {
  size?: number;
  showWordmark?: boolean;
  subtitle?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <img
        src={mark.url}
        alt="TriedIt logo"
        width={size}
        height={size}
        className="rounded-lg mix-blend-multiply"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span className="leading-tight">
          <span className="block text-[1.15rem] font-bold tracking-tight">
            Tried<span className="text-gradient-brand">It</span>
          </span>
          {subtitle && (
            <span className="block text-xs text-muted-foreground">{subtitle}</span>
          )}
        </span>
      )}
    </span>
  );
}
