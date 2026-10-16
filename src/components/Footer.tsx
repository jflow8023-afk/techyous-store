import { InstagramIcon, TikTokIcon } from "@/components/BrandIcons";
import { Button } from "@/components/ui/button";
import { SOCIALS } from "@/lib/contact";
import { useT } from "@/lib/i18n";

const SOCIAL_ICONS: Record<string, typeof InstagramIcon> = {
  "instagram-store": InstagramIcon,
  "instagram-personal": InstagramIcon,
  tiktok: TikTokIcon,
};

export function Footer() {
  const { lang } = useT();

  return (
    <footer className="mt-8 border-t">
          <ul className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-20 py-8">
            {SOCIALS.map((s) => {
              const Icon = SOCIAL_ICONS[s.id] ?? InstagramIcon;
              return (
                <li key={s.id}>
                  <Button asChild variant="ghost" size="icon" className="h-11 w-11 rounded-full border text-muted-foreground hover:border-primary/40 hover:text-primary [&_svg]:size-5">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label[lang]} — ${s.handle}`}
                    title={`${s.label[lang]} — ${s.handle}`}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                  </Button>
                </li>
              );
            })}
          </ul>
    </footer>
  );
}
