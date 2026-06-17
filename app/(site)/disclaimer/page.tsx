import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "ToolNook is provided free of charge, as-is and with no obligation or warranty. Read how the tools work, their limits, and your responsibilities.",
};

const UPDATED = "17 June 2026";

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Disclaimer &amp; No-Obligation Notice
        </h1>
        <p className="mt-2 text-sm text-muted">Last updated: {UPDATED}</p>
      </header>

      <div className="space-y-8 text-sm leading-relaxed text-primary">
        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            1. Free and without obligation
          </h2>
          <p className="text-muted">
            ToolNook is offered free of charge, as a convenience, and with no obligation
            of any kind. Using the site creates no contract, account, subscription, or
            commitment between you and ToolNook. You are under no obligation to use the
            tools, and ToolNook is under no obligation to provide, maintain, update, or
            continue to offer them. Any tool may be changed, paused, or removed at any
            time without notice.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            2. Provided &ldquo;as is&rdquo;
          </h2>
          <p className="text-muted">
            All tools and content on ToolNook are provided &ldquo;as is&rdquo; and
            &ldquo;as available,&rdquo; without warranties of any kind, whether express or
            implied. To the fullest extent permitted by law, ToolNook disclaims all
            warranties, including but not limited to merchantability, fitness for a
            particular purpose, accuracy, reliability, and non-infringement. We do not
            warrant that the tools will be uninterrupted, error-free, or that results will
            be correct or complete.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            3. Not professional advice
          </h2>
          <p className="text-muted">
            ToolNook&rsquo;s tools — including the loan, invoice, tip, expense, percentage,
            and other calculators — are provided for general informational and convenience
            purposes only. They do not constitute financial, legal, tax, accounting,
            security, medical, or other professional advice. Outputs are estimates and may
            contain errors. Always verify results independently and consult a qualified
            professional before relying on them for any decision.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            4. Your responsibility
          </h2>
          <p className="text-muted">
            You are solely responsible for the data you enter, the outputs you generate,
            and how you use them. You are responsible for keeping your own backups of any
            input or result that matters to you, and for confirming that any output meets
            your needs before acting on it. Do not rely on ToolNook as the sole source for
            any critical, financial, legal, or safety-related task.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            5. How your data is handled
          </h2>
          <p className="text-muted">
            ToolNook is designed to run entirely in your browser. The text, files, and
            values you enter into a tool are processed locally on your device and are not
            uploaded to, stored on, or seen by a ToolNook server. We do not run analytics
            or tracking on the site, and we do not set advertising cookies.
          </p>
          <p className="mt-3 text-muted">
            A small number of tools (the AI model comparator, token counter, and cost
            estimator) load a public, read-only pricing catalogue from a third-party
            provider (OpenRouter) so the figures stay current. This request contains{" "}
            <strong className="text-primary">none</strong> of your input — only the public
            model list is fetched. Aside from this, no information you enter leaves your
            browser.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            6. Third-party services and links
          </h2>
          <p className="text-muted">
            Some tools may rely on third-party data or libraries, and the site may link to
            external websites. ToolNook does not control and is not responsible for the
            content, accuracy, availability, or practices of any third party. Your use of
            third-party services is governed by their own terms and policies.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            7. Limitation of liability
          </h2>
          <p className="text-muted">
            To the fullest extent permitted by law, ToolNook and its operators shall not be
            liable for any direct, indirect, incidental, consequential, special, or
            exemplary damages — including loss of data, profits, or goodwill — arising out
            of or in connection with your use of, or inability to use, the site or its
            tools, even if advised of the possibility of such damages. Because the service
            is provided free of charge, this limitation applies to the maximum extent the
            law allows.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-display text-lg font-semibold text-primary">
            8. Changes to this notice
          </h2>
          <p className="text-muted">
            We may update this disclaimer from time to time. Continued use of the site
            after a change constitutes acceptance of the revised notice. The
            &ldquo;last updated&rdquo; date above reflects the most recent revision.
          </p>
        </section>

        <p className="border-t border-border pt-6 text-muted">
          If you do not agree with any part of this notice, please do not use the site.
        </p>
      </div>
    </div>
  );
}
