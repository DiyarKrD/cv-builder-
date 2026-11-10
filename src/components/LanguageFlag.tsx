/**
 * Renders a language flag as an image (via flagcdn.com) when `flag`
 * is a 2-letter ISO country code (e.g. "gb", "iq"). Falls back to
 * rendering the raw string for any legacy data still storing an
 * emoji flag.
 */
const FLAG_CDN = 'https://flagcdn.com/w40';

export function isCountryCode(flag: string): boolean {
  return /^[a-z]{2}$/i.test(flag.trim());
}

export function LanguageFlag({
  flag,
  title,
  imgClassName = 'w-5 h-auto',
  spanClassName = '',
}: {
  flag: string;
  title?: string;
  imgClassName?: string;
  spanClassName?: string;
}) {
  if (isCountryCode(flag)) {
    return (
      <img
        src={`${FLAG_CDN}/${flag.trim().toLowerCase()}.png`}
        alt={title ?? flag}
        title={title}
        className={`inline-block rounded-[2px] shadow-sm ${imgClassName}`}
        draggable={false}
      />
    );
  }
  return (
    <span className={spanClassName} title={title}>
      {flag}
    </span>
  );
}
