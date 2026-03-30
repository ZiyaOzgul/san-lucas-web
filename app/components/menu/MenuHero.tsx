type Props = {
  title: string;
  subtitle: string;
};

export function MenuHero({ title, subtitle }: Props) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h1 className="text-xl font-bold text-text leading-snug">{title}</h1>
      <p className="text-muted text-sm mt-1 leading-relaxed">{subtitle}</p>
    </div>
  );
}
