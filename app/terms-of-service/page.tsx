import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - TGATB Habit Tracker",
  description: "Terms of Service for The Good and The Bad: Habit Tracker",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: February 13, 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Welcome</h2>
            <p>
              Welcome to TGATB Habit Tracker (&quot;The Good and The Bad&quot;, &quot;we&quot;,
              &quot;us&quot;, &quot;our&quot;). By using our web and mobile applications, you
              agree to these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Use of the App</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must be at least 13 years old to use the app.</li>
              <li>
                You agree not to misuse the app or attempt to access it in unauthorized ways.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">User Content</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                You are responsible for the content you add (habits, notes, etc.).
              </li>
              <li>
                We reserve the right to remove content that violates these terms or applicable
                laws.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                All app content, trademarks, and code are owned by us or our licensors.
              </li>
              <li>
                You may not copy, modify, or distribute our content without permission.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p>
              The app uses third-party services (Google Cloud, Firebase, etc.). Your use of
              these services is subject to their respective terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p>
              The app is provided &quot;as is&quot; without warranties of any kind. We are not
              liable for any damages arising from your use of the app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Termination</h2>
            <p>
              We may suspend or terminate your access to the app for violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to These Terms</h2>
            <p>
              We may update these Terms of Service from time to time. Changes will be posted
              in the app and on our website.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Open Source</h2>
            <p>
              TGATB Habit Tracker is open source under the Apache 2.0 License. You can review
              the complete source code at:{" "}
              <a
                href="https://github.com/adsurkasur/tgatb-habit-tracker"
                className="text-primary underline"
              >
                github.com/adsurkasur/tgatb-habit-tracker
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{" "}
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
            <Link href="/privacy-policy" className="text-primary underline">
              Privacy Policy
            </Link>
          </p>
          <p>
            &copy; 2025-2026{" "}
            <a href="https://github.com/adsurkasur" className="text-primary underline">
              adsurkasur
            </a>
            . All rights reserved.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-all duration-200"
          >
            Open TGATB Habit Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
