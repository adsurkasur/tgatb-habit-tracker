import type { Metadata } from "next";
import Link from "next/link";
import { isValidLocale, routing, type AppLocale } from "@/i18n/routing";

type LocaleParams = {
	params: Promise<{ locale: string }>;
};

type PrivacyCopy = {
	meta: {
		title: string;
		description: string;
	};
	title: string;
	lastUpdated: string;
	sections: {
		overview: {
			title: string;
			body: string;
		};
		informationCollected: {
			title: string;
			dataYouProvide: {
				title: string;
				habitData: string;
				settings: string;
				googleAccount: string;
			};
			dataCollectedAutomatically: {
				title: string;
				analytics: string;
				errorTracking: string;
			};
			dataNotCollected: {
				title: string;
				noPayments: string;
				noLocation: string;
				noContacts: string;
				noAds: string;
				noSelling: string;
			};
		};
		dataStorage: {
			title: string;
			local: string;
			cloudBackup: string;
		};
		thirdPartyServices: {
			title: string;
			intro: string;
			firebase: string;
			firebaseAnalytics: string;
			vercelAnalytics: string;
			googleDrive: string;
			sentry: string;
		};
		rightsControls: {
			title: string;
			analyticsConsent: string;
			dataDeletion: string;
			cloudBackupControl: string;
			dataExport: string;
		};
		deleteData: {
			title: string;
			intro: string;
			steps: string;
			willDelete: string;
			willDeleteItems: string;
			willNotDelete: string;
			willNotDeleteItems: string;
			alternative: string;
		};
		deleteAccount: {
			title: string;
			intro: string;
			appSteps: string;
			googleDriveSteps: string;
			revokeSteps: string;
			completion: string;
		};
		dataSecurity: {
			title: string;
			body: string;
		};
		childrenPrivacy: {
			title: string;
			body: string;
		};
		policyChanges: {
			title: string;
			body: string;
		};
		contactUs: {
			title: string;
			body: string;
		};
		openSource: {
			title: string;
			body: string;
		};
	};
	links: {
		termsOfService: string;
		openApp: string;
	};
	footer: {
		copyright: string;
	};
};

function parseNumberedList(input: string): string[] {
	return input
		.split("\n")
		.map((line) => line.replace(/^\d+\.\s*/, "").trim())
		.filter(Boolean);
}

function parseHeadingAndSteps(input: string): { heading: string; items: string[] } {
	const lines = input.split("\n").map((line) => line.trim()).filter(Boolean);
	const heading = lines[0]?.replace(/:$/, "") ?? "";
	const items = lines.slice(1).map((line) => line.replace(/^\d+\.\s*/, "").trim());
	return { heading, items };
}

async function getPrivacyCopy(locale: AppLocale): Promise<PrivacyCopy> {
	const messages = (await import(`../../../messages/${locale}.json`)).default;
	return messages.PrivacyPolicyPage as PrivacyCopy;
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
	const { locale } = await params;
	const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
	const copy = await getPrivacyCopy(resolvedLocale);

	const alternates: Record<string, string> = {};
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.tgatb.click";

	for (const loc of routing.locales) {
		const urlPath = loc === routing.defaultLocale ? "" : `/${loc}`;
		alternates[loc] = `${baseUrl}${urlPath}/privacy-policy`;
	}

	return {
		title: copy.meta.title,
		description: copy.meta.description,
		metadataBase: new URL(baseUrl),
		alternates: {
			languages: alternates,
			canonical: alternates[resolvedLocale],
		},
		openGraph: {
			title: copy.meta.title,
			description: copy.meta.description,
			url: alternates[resolvedLocale],
			locale: resolvedLocale === "en" ? "en_US" : "id_ID",
			type: "website",
		},
	};
}

export default async function LocalizedPrivacyPolicyPage({ params }: LocaleParams) {
	const { locale } = await params;
	const resolvedLocale: AppLocale = isValidLocale(locale) ? locale : routing.defaultLocale;
	const copy = await getPrivacyCopy(resolvedLocale);

	const deleteDataSteps = parseNumberedList(copy.sections.deleteData.steps);
	const deleteAccountAppSteps = parseNumberedList(copy.sections.deleteAccount.appSteps);
	const googleDriveSteps = parseHeadingAndSteps(copy.sections.deleteAccount.googleDriveSteps);
	const revokeSteps = parseHeadingAndSteps(copy.sections.deleteAccount.revokeSteps);

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-3xl px-6 py-12">
				<h1 className="mb-2 text-3xl font-bold">{copy.title}</h1>
				<p className="mb-8 text-sm text-muted-foreground">{copy.lastUpdated}</p>

				<div className="prose prose-sm max-w-none space-y-6 dark:prose-invert">
					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.overview.title}</h2>
						<p>
							{copy.sections.overview.body}{" "}
							<a href="https://github.com/adsurkasur" className="text-primary underline">
								adsurkasur
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.informationCollected.title}</h2>

						<h3 className="mb-2 mt-4 text-lg font-medium">
							{copy.sections.informationCollected.dataYouProvide.title}
						</h3>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.informationCollected.dataYouProvide.habitData}</li>
							<li>{copy.sections.informationCollected.dataYouProvide.settings}</li>
							<li>{copy.sections.informationCollected.dataYouProvide.googleAccount}</li>
						</ul>

						<h3 className="mb-2 mt-4 text-lg font-medium">
							{copy.sections.informationCollected.dataCollectedAutomatically.title}
						</h3>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.informationCollected.dataCollectedAutomatically.analytics}</li>
							<li>{copy.sections.informationCollected.dataCollectedAutomatically.errorTracking}</li>
						</ul>

						<h3 className="mb-2 mt-4 text-lg font-medium">
							{copy.sections.informationCollected.dataNotCollected.title}
						</h3>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.informationCollected.dataNotCollected.noPayments}</li>
							<li>{copy.sections.informationCollected.dataNotCollected.noLocation}</li>
							<li>{copy.sections.informationCollected.dataNotCollected.noContacts}</li>
							<li>{copy.sections.informationCollected.dataNotCollected.noAds}</li>
							<li>{copy.sections.informationCollected.dataNotCollected.noSelling}</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.dataStorage.title}</h2>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.dataStorage.local}</li>
							<li>{copy.sections.dataStorage.cloudBackup}</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.thirdPartyServices.title}</h2>
						<p>{copy.sections.thirdPartyServices.intro}</p>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.thirdPartyServices.firebase}</li>
							<li>{copy.sections.thirdPartyServices.firebaseAnalytics}</li>
							<li>{copy.sections.thirdPartyServices.vercelAnalytics}</li>
							<li>{copy.sections.thirdPartyServices.googleDrive}</li>
							<li>{copy.sections.thirdPartyServices.sentry}</li>
						</ul>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.rightsControls.title}</h2>
						<ul className="list-disc space-y-1 pl-6">
							<li>{copy.sections.rightsControls.analyticsConsent}</li>
							<li>{copy.sections.rightsControls.dataDeletion}</li>
							<li>{copy.sections.rightsControls.cloudBackupControl}</li>
							<li>{copy.sections.rightsControls.dataExport}</li>
						</ul>
					</section>

					<section id="delete-data">
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.deleteData.title}</h2>
						<p className="mb-3">{copy.sections.deleteData.intro}</p>
						<ol className="mb-4 list-decimal space-y-2 pl-6">
							{deleteDataSteps.map((step) => (
								<li key={step}>{step}</li>
							))}
						</ol>
						<p className="mb-3">{copy.sections.deleteData.willDelete}</p>
						<p className="mb-4">{copy.sections.deleteData.willDeleteItems}</p>
						<p className="mb-3">{copy.sections.deleteData.willNotDelete}</p>
						<p className="mb-4">{copy.sections.deleteData.willNotDeleteItems}</p>
						<p>{copy.sections.deleteData.alternative}</p>
					</section>

					<section id="delete-account">
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.deleteAccount.title}</h2>
						<p className="mb-3">{copy.sections.deleteAccount.intro}</p>
						<ol className="mb-4 list-decimal space-y-2 pl-6">
							{deleteAccountAppSteps.map((step) => (
								<li key={step}>{step}</li>
							))}
						</ol>
						<p className="mb-3">{googleDriveSteps.heading}:</p>
						<ol className="mb-4 list-decimal space-y-2 pl-6">
							{googleDriveSteps.items.map((step) => (
								<li key={step}>{step}</li>
							))}
						</ol>
						<p className="mb-3">{revokeSteps.heading}:</p>
						<ol className="mb-4 list-decimal space-y-2 pl-6">
							{revokeSteps.items.map((step) => (
								<li key={step}>{step}</li>
							))}
						</ol>
						<p>
							{copy.sections.deleteAccount.completion}{" "}
							<a href="mailto:adsurkasur.dev@gmail.com" className="text-primary underline">
								adsurkasur.dev@gmail.com
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.dataSecurity.title}</h2>
						<p>{copy.sections.dataSecurity.body}</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.childrenPrivacy.title}</h2>
						<p>{copy.sections.childrenPrivacy.body}</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.policyChanges.title}</h2>
						<p>{copy.sections.policyChanges.body}</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.contactUs.title}</h2>
						<p>
							{copy.sections.contactUs.body}{" "}
							<a href="mailto:adsurkasur.dev@gmail.com" className="text-primary underline">
								adsurkasur.dev@gmail.com
							</a>
							.
						</p>
					</section>

					<section>
						<h2 className="mb-3 text-xl font-semibold">{copy.sections.openSource.title}</h2>
						<p>
							{copy.sections.openSource.body}{" "}
							<a
								href="https://github.com/adsurkasur/tgatb-habit-tracker"
								className="text-primary underline"
							>
								github.com/adsurkasur/tgatb-habit-tracker
							</a>
						</p>
					</section>
				</div>

				<div className="mt-12 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
					<p>
						<Link href="../terms-of-service" className="text-primary underline">
							{copy.links.termsOfService}
						</Link>
					</p>
					<p>{copy.footer.copyright}</p>
				</div>

				<div className="mt-8 text-center">
					<Link
						href=".."
						className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-all duration-200 hover:bg-primary/90"
					>
						{copy.links.openApp}
					</Link>
				</div>
			</div>
		</div>
	);
}
