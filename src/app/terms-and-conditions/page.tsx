import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/utils";

const UPDATED = "14 October 2026";

export const metadata: Metadata = {
  title: "Terms & Conditions | Vizag Properties",
  description:
    "Terms for using Vizag Properties accounts, property listings and enquiry features.",
  alternates: { canonical: `${SITE_CONFIG.url}/terms-and-conditions` },
};

const sections = [
  {
    title: "1. Operator and acceptance",
    body: (
      <>
        <p>
          These terms apply to use of the Vizag Properties website and its
          account, listing and enquiry features. The operator must be identified
          before publication: [INSERT FULL LEGAL ENTITY NAME, FORM AND
          REGISTERED POSTAL ADDRESS]. By using the site, you agree to these
          terms and the linked{" "}
          <Link href="/privacy-policy" className="font-semibold text-brand-700 underline">
            Privacy Policy
          </Link>
          , subject to rights that cannot be limited by law.
        </p>
        <p>
          The operator&apos;s legal status, any real-estate-agent registration and
          applicable consumer-facing disclosures must be confirmed by Indian
          counsel before these terms are finalised.
        </p>
      </>
    ),
  },
  {
    title: "2. What the website does",
    body: (
      <p>
        The website provides property-search, listing, account and enquiry
        features for Visakhapatnam and nearby areas. It may help connect a
        prospective buyer with a seller or respond to consultation requests.
        The exact services, fees (if any), and any brokerage or agency role must
        be set out in a separate written agreement where applicable. Do not
        rely on a website description as a statement of the operator&apos;s legal
        status.
      </p>
    ),
  },
  {
    title: "3. Seller accounts and password sign-in",
    body: (
      <>
        <p>
          Seller accounts may be registered as a builder, property owner or
          agent. Registration and sign-in use an email address and password;
          the email address is the account username. A mobile number is
          collected as seller contact information, not as an authentication
          factor. Email ownership is not independently verified by the current
          sign-in flow. Public signup cannot create an admin account; admin
          access is assigned separately by the operator.
        </p>
        <p>
          Keep your password confidential, use accurate contact details and
          notify the operator if you suspect unauthorised account use. The
          operator may restrict or suspend accounts for security, misuse or
          breaches of these terms, subject to applicable law.
        </p>
      </>
    ),
  },
  {
    title: "4. Seller listings and user content",
    body: (
      <>
        <p>
          A seller must have authority to submit each listing and must ensure
          that its text, price, area and unit, location, images, approvals,
          RERA information, ownership and contact details are accurate and
          current to the seller&apos;s knowledge. Upload only material the seller
          is entitled to use and publish. Do not submit unlawful, misleading,
          infringing, discriminatory or fraudulent content.
        </p>
        <p>
          The seller grants the operator permission to host, reproduce, format
          and display submitted listing content as needed to operate, moderate
          and promote the listing on the service. The seller remains responsible
          for having the necessary rights and permissions, including for images
          and personal data of other people.
        </p>
        <p>
          Listings may be reviewed for platform rules, edited for presentation,
          rejected, paused or removed. Review or an account-status badge
          is not a title search, independent property inspection, RERA
          certification, legal opinion, valuation or guarantee of a seller or
          listing. A badge only reflects an internal account-status flag set by
          the site operator; it is not identity, property or legal verification.
        </p>
      </>
    ),
  },
  {
    title: "5. Buyers, enquiries and independent checks",
    body: (
      <>
        <p>
          Listing information is supplied by sellers and may change or become
          unavailable. The operator does not promise that prices, availability,
          measurements, approvals, images, builder statements or legal details
          are complete, current or independently verified. An area with no
          recorded unit is labelled as such; do not assume or convert it without
          checking the source information.
        </p>
        <p>
          Before making a decision or payment, independently inspect the
          property and verify title, ownership, encumbrances, approvals, land
          and building records, applicable RERA registration, measurements,
          tax and utility status, seller authority and contract terms. Obtain
          advice from your own lawyer, surveyor, financial adviser or other
          qualified professional. A listing, badge, site visit or enquiry is
          not legal, investment or financial advice.
        </p>
        <p>
          The website does not currently process property purchase payments or
          transfer property title. Any negotiation, agreement, deposit or sale
          is between the relevant parties unless a separate written agreement
          states otherwise. Do not send money based only on a listing or an
          unsolicited message.
        </p>
      </>
    ),
  },
  {
    title: "6. Enquiry details and communications",
    body: (
      <p>
        When you submit an enquiry, you confirm that the name and required
        Indian mobile number are yours to provide and that you have authority to
        include any other person&apos;s details. Email is optional. The operator may
          use the information to handle the enquiry and may route it to the seller
          for the selected listing as described in the Privacy Policy. The site
          does not currently send automatic email or SMS confirmations for
          enquiries.
      </p>
    ),
  },
  {
    title: "7. Acceptable use and intellectual property",
    body: (
      <p>
        Do not attempt to gain unauthorised access, interfere with the service,
        scrape or republish listings at scale, upload malware, impersonate
        another person, misuse contact details, or use the site for unlawful
        or deceptive activity. Site design, software and branding belong to
        their respective rights holders. User-submitted content remains the
        responsibility of its submitter, subject to the permissions above and
        applicable law.
      </p>
    ),
  },
  {
    title: "8. Availability, liability and consumer rights",
    body: (
      <p>
        The service may change, be interrupted or contain errors. To the extent
        permitted by applicable law, the operator does not warrant uninterrupted
        availability or guarantee a transaction outcome. Nothing in these terms
        excludes a consumer right, statutory duty or liability that cannot
        lawfully be excluded or limited. Any liability wording and remedies must
        be reviewed by Indian counsel before publication.
      </p>
    ),
  },
  {
    title: "9. Indian law, disputes and changes",
    body: (
      <>
        <p>
          These terms are intended to be read with applicable Indian law,
          including consumer-protection, information-technology, data-protection
          and real-estate laws where applicable. This draft is not legal advice
          and is not a claim that the operator is registered or compliant with
          every law that may apply.
        </p>
        <p>
          Governing-law wording and competent court / dispute forum: [INSERT
          APPROPRIATE INDIAN STATE, CITY AND FORUM AFTER LEGAL REVIEW]. This
          placeholder must not be used to remove any mandatory consumer or
          statutory remedy.
        </p>
        <p>
          The operator may update these terms when the service or applicable law
          changes. Material changes should be dated and communicated as required
          by applicable law.
        </p>
      </>
    ),
  },
  {
    title: "10. Contact and required publication details",
    body: (
      <>
        <p>
          General site contact: {SITE_CONFIG.email} · {SITE_CONFIG.phone} ·{" "}
          {SITE_CONFIG.address}. Confirm these details are monitored and current.
        </p>
        <ul>
          <li>Legal operator name and business form: [INSERT]</li>
          <li>Registered office address: [INSERT]</li>
          <li>Grievance / legal contact name and email: [INSERT]</li>
          <li>Applicable registrations and disclosures: [CONFIRM WITH COUNSEL]</li>
        </ul>
      </>
    ),
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <nav className="mb-5 text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Terms &amp; Conditions</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Last updated: {UPDATED}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            Rules for using Vizag Properties accounts, property listings and
            enquiry features. Read these terms with the{" "}
            <Link href="/privacy-policy" className="font-semibold text-brand-700 underline">
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Draft for legal review.</strong> The operator identity,
            address, grievance contact, legal status and dispute forum are
            placeholders. Complete them and obtain qualified Indian legal review
            before publication.
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <div className="legal-copy text-sm leading-7 text-slate-700">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
