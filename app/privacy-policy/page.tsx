import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - TGATB Habit Tracker",
  description: "Privacy Policy for The Good and The Bad: Habit Tracker",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 7, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p>
              TGATB Habit Tracker (&quot;The Good and The Bad&quot;) is a minimalist habit tracking
              application developed by <a href="https://github.com/adsurkasur" className="text-primary underline">adsurkasur</a>. This Privacy Policy explains how we handle
              your information when you use our web application at{" "}
              <a href="https://www.tgatb.click" className="text-primary underline">www.tgatb.click</a>{" "}
              and our Android mobile application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">Data You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Habit data:</strong> Names, types (good/bad), completion logs, and streaks
                you create within the app. This data is stored locally on your device by default.
              </li>
              <li>
                <strong>Settings preferences:</strong> Dark mode, language, motivator personality,
                and other app preferences stored locally on your device.
              </li>
              <li>
                <strong>Google account information (optional):</strong> If you choose to sign in with
                Google for cloud backup, we access your name, email address, and profile picture
                solely for authentication and Google Drive backup functionality.
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Data Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Analytics data (with consent):</strong> We use Vercel Analytics and Firebase
                Analytics to collect anonymous usage statistics such as page views, device type, and
                general interaction patterns. Analytics are only initialized after you provide consent.
              </li>
              <li>
                <strong>Error tracking (optional):</strong> If enabled, Sentry collects crash reports
                and error logs to help us improve app stability. This is only active when analytics
                consent is given and a Sentry DSN is configured.
              </li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Data We Do NOT Collect</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We do not collect payment information</li>
              <li>We do not collect location data</li>
              <li>We do not collect contacts or phone data</li>
              <li>We do not serve advertisements or collect ad-related data</li>
              <li>We do not sell your data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How Your Data Is Stored</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Local storage (default):</strong> All habit data and settings are stored
                locally on your device using browser localStorage (web) or Capacitor Preferences
                (Android). No data leaves your device unless you explicitly enable cloud backup.
              </li>
              <li>
                <strong>Cloud backup (optional):</strong> If you sign in with Google, you may choose
                to back up your data to your own Google Drive. Your data is stored as a file in your
                personal Google Drive  we do not have access to your Google Drive files.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Firebase Authentication:</strong> For Google sign-in. Governed by{" "}
                <a href="https://firebase.google.com/support/privacy" className="text-primary underline">
                  Google&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong>Firebase Analytics:</strong> For anonymous usage statistics (consent required).
              </li>
              <li>
                <strong>Vercel Analytics:</strong> For anonymous web analytics (consent required).
              </li>
              <li>
                <strong>Google Drive API:</strong> For optional cloud backup, accessing only your own
                app-created files.
              </li>
              <li>
                <strong>Sentry (optional):</strong> For error and crash reporting when enabled.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Rights and Controls</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Analytics consent:</strong> You can enable or disable analytics at any time
                in the app settings.
              </li>
              <li>
                <strong>Data deletion:</strong> You can delete all your habit data from the app
                settings (&quot;Delete All Habits&quot;). Since data is stored locally, clearing
                your browser data or uninstalling the app will also remove all data.
              </li>
              <li>
                <strong>Cloud backup control:</strong> You can sign out at any time to stop cloud
                backup. Your Google Drive backup files can be managed directly from your Google
                Drive.
              </li>
              <li>
                <strong>Data export:</strong> You can export your data as a JSON file from the app
                settings at any time.
              </li>
            </ul>
          </section>

          <section id="delete-data">
            <h2 className="text-xl font-semibold mb-3">Delete Your Data</h2>
            <p className="mb-3">
              TGATB Habit Tracker stores your habit data locally on your device. You can delete
              all your data at any time without needing to delete your account:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Open the app</li>
              <li>Tap the <strong>menu icon</strong> (hamburger menu) in the top-left corner</li>
              <li>Scroll down to <strong>Habit Management</strong></li>
              <li>Tap <strong>&quot;Delete All Habits&quot;</strong></li>
              <li>Confirm the deletion when prompted</li>
            </ol>
            <p className="mb-3">This will permanently delete:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>All your habits and their names</li>
              <li>All completion logs and streak data</li>
              <li>All history records</li>
            </ul>
            <p className="mb-3">This will <strong>not</strong> delete:</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>Your app settings (dark mode, language, etc.) — these reset when you clear app data or uninstall</li>
              <li>Any backup files previously saved to your Google Drive — you can delete those directly from your Google Drive</li>
            </ul>
            <p>
              Alternatively, you can <strong>uninstall the app</strong> or <strong>clear app data</strong> from
              your device settings to remove all locally stored information.
            </p>
          </section>

          <section id="delete-account">
            <h2 className="text-xl font-semibold mb-3">Delete Your Account</h2>
            <p className="mb-3">
              If you signed in with Google and want to completely remove your account and all
              associated data, follow these steps:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Open the app</li>
              <li>Tap the <strong>menu icon</strong> (hamburger menu) in the top-left corner</li>
              <li>Scroll down to <strong>Habit Management</strong> and tap <strong>&quot;Delete All Habits&quot;</strong> to remove your data</li>
              <li>Scroll to <strong>Account &amp; Data</strong> and tap <strong>&quot;Logout&quot;</strong> to sign out</li>
              <li>Uninstall the app to remove all remaining local data</li>
            </ol>
            <p className="mb-3">To remove your Google Drive backup files:</p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Go to <a href="https://drive.google.com" className="text-primary underline">Google Drive</a></li>
              <li>Search for &quot;tgatb&quot; or &quot;habit&quot; to find backup files</li>
              <li>Delete the backup files</li>
            </ol>
            <p className="mb-3">To revoke the app&apos;s access to your Google account:</p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Go to <a href="https://myaccount.google.com/permissions" className="text-primary underline">Google Account Permissions</a></li>
              <li>Find &quot;TGATB Habit Tracker&quot; in the list</li>
              <li>Click <strong>&quot;Remove Access&quot;</strong></li>
            </ol>
            <p>
              After completing these steps, all your data and account access will be fully removed.
              If you need assistance, contact us at{" "}
              <a href="mailto:adsurkasur.dev@gmail.com" className="text-primary underline">
                adsurkasur.dev@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p>
              We implement reasonable security measures to protect your data. Your habit data is
              stored locally on your device and is not transmitted to our servers. Cloud backup
              data is stored in your personal Google Drive using Google&apos;s security infrastructure.
              However, no method of electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Children&apos;s Privacy</h2>
            <p>
              Our app is not directed at children under the age of 13. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and
              believe your child has provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be reflected
              by updating the &quot;Last updated&quot; date at the top of this page. We encourage
              you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:{" "}
              <a href="mailto:adsurkasur.dev@gmail.com" className="text-primary underline">
                adsurkasur.dev@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Open Source</h2>
            <p>
              TGATB Habit Tracker is open source under the Apache 2.0 License. You can review
              the complete source code at:{" "}
              <a href="https://github.com/adsurkasur/tgatb-habit-tracker" className="text-primary underline">
                github.com/adsurkasur/tgatb-habit-tracker
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-sm text-muted-foreground">
          <p>&copy; 2025-2026 <a href="https://github.com/adsurkasur" className="text-primary underline">adsurkasur</a>. All rights reserved.</p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Open TGATB Habit Tracker
          </a>
        </div>
      </div>
    </div>
  );
}
