const MOTTO_WORDS = [
  { key: "cousu", label: "Cousu" },
  { key: "pour", label: "Pour" },
  { key: "durer", label: "Durer" },
];

export function BrandMotto({ className = "brand-motto" }: { className?: string }) {
  return (
    <p className={className} aria-label="Cousu pour durer">
      {MOTTO_WORDS.map((word) => (
        <span
          className={`brand-motto__word brand-motto__word--${word.key}`}
          key={word.key}
          aria-hidden="true"
        >
          {word.label}
        </span>
      ))}
    </p>
  );
}
