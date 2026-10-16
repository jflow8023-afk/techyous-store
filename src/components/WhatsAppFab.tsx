import { WhatsAppIcon } from "@/components/BrandIcons";
import { waGreetingText, waLink } from "@/lib/contact";
import { useT } from "@/lib/i18n";

export function WhatsAppFab() {
  const { t, lang } = useT();
  return (
    <a
      href={waLink(waGreetingText(lang))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("waChat")}
      title={t("waChat")}
      className="fixed bottom-4 end-4 z-30 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-wa transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
