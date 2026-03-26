import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, routing, type AppLocale } from "@/i18n/routing";
import { getMessagesForLocale } from "@/i18n/messages";

type TermsCopy = {
  meta: {
    title: string;
    description: string;
  };
  title: string;
  lastUpdated: string;
  sections: {
    welcome: {
      title: string;
      body: string;
    };
    use: {
      title: string;
      item1: string;
      item2: string;
    };
    userContent: {
      title: string;
      item1: string;
      item2: string;
    };
    intellectualProperty: {
      title: string;
      item1: string;
      item2: string;
    };
    thirdParty: {
      title: string;
      body: string;
    };
    limitation: {
      title: string;
      body: string;
    };
    termination: {
      title: string;
      body: string;
    };
    changes: {
      title: string;
      body: string;
    };
    openSource: {
      title: string;
      body: string;
    };
    contact: {
      title: string;
      body: string;
    };
  };
  links: {
    privacyPolicy: string;
    openApp: string;
  };
  footer: {
    rightsReserved: string;
  };
};

async function getTermsCopy(locale: AppLocale): Promise<TermsCopy> {
  const messages = getMessagesForLocale(locale);
  return messages.TermsOfServicePage as TermsCopy;
}

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

const openGraphLocaleByAppLocale: Record<string, string> = {
  en: "en_US",
  id: "id_ID",
  ms: "ms_MY",
  th: "th_TH",
  vi: "vi_VN",
  fil: "fil_PH",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  pt: "pt_BR",
  ar: "ar_SA",
  hi: "hi_IN",
  ru: "ru_RU",
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const copy = await getTermsCopy(resolvedLocale);

  // Generate hreflang alternate links for all supported locales
  const alternates: Record<string, string> = {};
  const currentUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click";
  
  for (const loc of routing.locales) {
    const urlPath = loc === routing.defaultLocale ? "" : `/${loc}`;
    alternates[loc] = `${currentUrl}${urlPath}/terms-of-service`;
  }

  return {
    title: copy.meta.title,
    description: copy.meta.description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click"),
    alternates: {
      languages: alternates,
      canonical: alternates[resolvedLocale],
    },
    openGraph: {
      title: copy.meta.title,
      description: copy.meta.description,
      url: alternates[resolvedLocale],
      locale: openGraphLocaleByAppLocale[resolvedLocale] ?? "en_US",
      type: "website",
    },
  };
}

export default async function LocalizedTermsOfServicePage({ params }: LocaleParams) {
  const { locale } = await params;
  const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const copy = await getTermsCopy(resolvedLocale);
  const copyrightPrefix = "\u00A9 2025-2026 ";
  const supportEmail = "adsurkasur.dev@gmail.com";
  const repoUrl = "https://github.com/adsurkasur/tgatb-habit-tracker";
  const repoLabel = "github.com/adsurkasur/tgatb-habit-tracker";
  const authorUrl = "https://github.com/adsurkasur";
  const authorName = "adsurkasur";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{copy.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{copy.lastUpdated}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.welcome.title}</h2>
            <p>{copy.sections.welcome.body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.use.title}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.use.item1}</li>
              <li>{copy.sections.use.item2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.userContent.title}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.userContent.item1}</li>
              <li>{copy.sections.userContent.item2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.intellectualProperty.title}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.intellectualProperty.item1}</li>
              <li>{copy.sections.intellectualProperty.item2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.thirdParty.title}</h2>
            <p>{copy.sections.thirdParty.body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.limitation.title}</h2>
            <p>{copy.sections.limitation.body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.termination.title}</h2>
            <p>{copy.sections.termination.body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.changes.title}</h2>
            <p>{copy.sections.changes.body}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.openSource.title}</h2>
            <p>
              {copy.sections.openSource.body}{" "}
              <a
                href={repoUrl}
                className="text-primary underline"
              >
                {repoLabel}
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.contact.title}</h2>
            <p>
              {copy.sections.contact.body}{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-primary underline"
              >
                {supportEmail}
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground space-y-2">
          <p>
            <Link href="../privacy-policy" className="text-primary underline">
              {copy.links.privacyPolicy}
            </Link>
          </p>
          <p>
            {copyrightPrefix}
            <a href={authorUrl} className="text-primary underline">
              {authorName}
            </a>
            . {copy.footer.rightsReserved}
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href=".."
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all duration-200"
          >
            {copy.links.openApp}
          </Link>
        </div>
      </div>
    </div>
  );
}
