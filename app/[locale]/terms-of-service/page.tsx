import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, routing, type AppLocale } from "@/i18n/routing";

type TermsCopy = {
  metadataTitle: string;
  metadataDescription: string;
  title: string;
  lastUpdated: string;
  sections: {
    welcomeTitle: string;
    welcomeBody: string;
    useTitle: string;
    useItem1: string;
    useItem2: string;
    userContentTitle: string;
    userContentItem1: string;
    userContentItem2: string;
    ipTitle: string;
    ipItem1: string;
    ipItem2: string;
    thirdPartyTitle: string;
    thirdPartyBody: string;
    limitationTitle: string;
    limitationBody: string;
    terminationTitle: string;
    terminationBody: string;
    changesTitle: string;
    changesBody: string;
    openSourceTitle: string;
    openSourceBody: string;
    contactTitle: string;
    contactBody: string;
  };
  links: {
    privacyPolicy: string;
    openApp: string;
  };
  footerRights: string;
};

const termsByLocale: Record<AppLocale, TermsCopy> = {
  en: {
    metadataTitle: "Terms of Service - TGATB Habit Tracker",
    metadataDescription: "Terms of Service for The Good and The Bad: Habit Tracker",
    title: "Terms of Service",
    lastUpdated: "Last updated: February 13, 2026",
    sections: {
      welcomeTitle: "Welcome",
      welcomeBody:
        "Welcome to TGATB Habit Tracker (\"The Good and The Bad\", \"we\", \"us\", \"our\"). By using our web and mobile applications, you agree to these Terms of Service.",
      useTitle: "Use of the App",
      useItem1: "You must be at least 13 years old to use the app.",
      useItem2: "You agree not to misuse the app or attempt to access it in unauthorized ways.",
      userContentTitle: "User Content",
      userContentItem1: "You are responsible for the content you add (habits, notes, etc.).",
      userContentItem2: "We reserve the right to remove content that violates these terms or applicable laws.",
      ipTitle: "Intellectual Property",
      ipItem1: "All app content, trademarks, and code are owned by us or our licensors.",
      ipItem2: "You may not copy, modify, or distribute our content without permission.",
      thirdPartyTitle: "Third-Party Services",
      thirdPartyBody: "The app uses third-party services (Google Cloud, Firebase, etc.). Your use of these services is subject to their respective terms.",
      limitationTitle: "Limitation of Liability",
      limitationBody: "The app is provided \"as is\" without warranties of any kind. We are not liable for any damages arising from your use of the app.",
      terminationTitle: "Termination",
      terminationBody: "We may suspend or terminate your access to the app for violation of these terms.",
      changesTitle: "Changes to These Terms",
      changesBody: "We may update these Terms of Service from time to time. Changes will be posted in the app and on our website.",
      openSourceTitle: "Open Source",
      openSourceBody: "TGATB Habit Tracker is open source under the Apache 2.0 License. You can review the complete source code at:",
      contactTitle: "Contact Us",
      contactBody: "If you have any questions about these Terms of Service, please contact us at:",
    },
    links: {
      privacyPolicy: "Privacy Policy",
      openApp: "Open TGATB Habit Tracker",
    },
    footerRights: "All rights reserved.",
  },
  id: {
    metadataTitle: "Syarat dan Ketentuan - TGATB Habit Tracker",
    metadataDescription: "Syarat dan Ketentuan untuk The Good and The Bad: Habit Tracker",
    title: "Syarat dan Ketentuan",
    lastUpdated: "Terakhir diperbarui: 13 Februari 2026",
    sections: {
      welcomeTitle: "Selamat Datang",
      welcomeBody:
        "Selamat datang di TGATB Habit Tracker (\"The Good and The Bad\", \"kami\"). Dengan menggunakan aplikasi web dan mobile kami, Anda menyetujui Syarat dan Ketentuan ini.",
      useTitle: "Penggunaan Aplikasi",
      useItem1: "Anda harus berusia minimal 13 tahun untuk menggunakan aplikasi.",
      useItem2: "Anda setuju untuk tidak menyalahgunakan aplikasi atau mencoba mengaksesnya dengan cara yang tidak sah.",
      userContentTitle: "Konten Pengguna",
      userContentItem1: "Anda bertanggung jawab atas konten yang Anda tambahkan (kebiasaan, catatan, dan lain-lain).",
      userContentItem2: "Kami berhak menghapus konten yang melanggar syarat ini atau hukum yang berlaku.",
      ipTitle: "Hak Kekayaan Intelektual",
      ipItem1: "Semua konten aplikasi, merek dagang, dan kode dimiliki oleh kami atau pemberi lisensi kami.",
      ipItem2: "Anda tidak boleh menyalin, memodifikasi, atau mendistribusikan konten kami tanpa izin.",
      thirdPartyTitle: "Layanan Pihak Ketiga",
      thirdPartyBody: "Aplikasi menggunakan layanan pihak ketiga (Google Cloud, Firebase, dan lain-lain). Penggunaan layanan tersebut tunduk pada ketentuan masing-masing layanan.",
      limitationTitle: "Batasan Tanggung Jawab",
      limitationBody: "Aplikasi disediakan \"sebagaimana adanya\" tanpa jaminan apa pun. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan aplikasi oleh Anda.",
      terminationTitle: "Penghentian",
      terminationBody: "Kami dapat menangguhkan atau mengakhiri akses Anda ke aplikasi jika terjadi pelanggaran terhadap syarat ini.",
      changesTitle: "Perubahan pada Ketentuan",
      changesBody: "Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Perubahan akan dipublikasikan di aplikasi dan situs web kami.",
      openSourceTitle: "Sumber Terbuka",
      openSourceBody: "TGATB Habit Tracker bersifat sumber terbuka dengan lisensi Apache 2.0. Anda dapat meninjau seluruh kode sumber di:",
      contactTitle: "Hubungi Kami",
      contactBody: "Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di:",
    },
    links: {
      privacyPolicy: "Kebijakan Privasi",
      openApp: "Buka TGATB Habit Tracker",
    },
    footerRights: "Semua hak dilindungi.",
  },
};

type LocaleParams = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const copy = termsByLocale[resolvedLocale];

  return {
    title: copy.metadataTitle,
    description: copy.metadataDescription,
  };
}

export default async function LocalizedTermsOfServicePage({ params }: LocaleParams) {
  const { locale } = await params;
  const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
  const copy = termsByLocale[resolvedLocale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">{copy.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{copy.lastUpdated}</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.welcomeTitle}</h2>
            <p>{copy.sections.welcomeBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.useTitle}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.useItem1}</li>
              <li>{copy.sections.useItem2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.userContentTitle}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.userContentItem1}</li>
              <li>{copy.sections.userContentItem2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.ipTitle}</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>{copy.sections.ipItem1}</li>
              <li>{copy.sections.ipItem2}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.thirdPartyTitle}</h2>
            <p>{copy.sections.thirdPartyBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.limitationTitle}</h2>
            <p>{copy.sections.limitationBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.terminationTitle}</h2>
            <p>{copy.sections.terminationBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.changesTitle}</h2>
            <p>{copy.sections.changesBody}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.openSourceTitle}</h2>
            <p>
              {copy.sections.openSourceBody}{" "}
              <a
                href="https://github.com/adsurkasur/tgatb-habit-tracker"
                className="text-primary underline"
              >
                github.com/adsurkasur/tgatb-habit-tracker
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">{copy.sections.contactTitle}</h2>
            <p>
              {copy.sections.contactBody}{" "}
              <a
                href="mailto:adsurkasur.dev@gmail.com"
                className="text-primary underline"
              >
                adsurkasur.dev@gmail.com
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
            &copy; 2025-2026{" "}
            <a href="https://github.com/adsurkasur" className="text-primary underline">
              adsurkasur
            </a>
            . {copy.footerRights}
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
