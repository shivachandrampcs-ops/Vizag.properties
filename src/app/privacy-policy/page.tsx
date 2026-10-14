import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/utils";

const UPDATED = "14 October 2026";

export const metadata: Metadata = {
  title: "Privacy Policy | Vizag Properties",
  description:
    "How Vizag Properties handles account, property-listing, enquiry and website usage information.",
  alternates: { canonical: `${SITE_CONFIG.url}/privacy-policy` },
};

const sections = [
  {
    title: "1. Who is responsible for your information",
    body: (
      <>
        <p>
          This draft policy applies to the Vizag Properties website and its
          account, property-listing and enquiry features. Before publication,
          identify the legal person that operates the service and is responsible
          for personal data:
        </p>
        <ul>
          <li>Data Fiduciary / operator: [INSERT FULL LEGAL ENTITY NAME AND FORM]</li>
          <li>Registered office: [INSERT COMPLETE POSTAL ADDRESS]</li>
          <li>Privacy and grievance contact: [INSERT RESPONSIBLE PERSON, ROLE AND EMAIL]</li>
        </ul>
        <p>
          The public site currently lists {SITE_CONFIG.email} and {SITE_CONFIG.phone}
          as general contact details. Confirm that the contact is monitored for
          privacy requests before relying on it as the grievance channel.
        </p>
      </>
    ),
  },
  {
    title: "2. Information the site may process",
    body: (
      <>
        <p>Depending on how you use the site, information may include:</p>
        <ul>
          <li>
            Enquiry details: name, Indian mobile number, optional email,
            preferred locality, budget, property interest and message.
          </li>
          <li>
            Seller-account details: name, required email username, password
            hash, required mobile contact number, publisher role (builder, owner
            or agent), company, WhatsApp number, locality, city and profile
            information. Mobile is not used as a sign-in credential.
          </li>
          <li>
            Listing information: property description, price, area and its
            recorded unit, address/locality, images, approvals or RERA details
            supplied by the account holder, and moderation status.
          </li>
          <li>
            Technical and security information that may be present in requests
            or hosting logs, such as IP/network data, browser/device details,
            request time and pages visited.
          </li>
        </ul>
        <p>
          Do not submit passwords, payment-card details, bank credentials,
          government identity numbers or other information that the form does
          not request.
        </p>
      </>
    ),
  },
  {
    title: "3. Why information is used",
    body: (
      <p>
        Information is used to create and secure accounts, display and moderate
        listings, receive and route buyer enquiries, respond to requests,
        administer the service, prevent abuse, troubleshoot technical issues
        and meet applicable legal obligations. Seller accounts use an email
        address and password to sign in. Passwords are stored as salted hashes,
        not as plaintext. A mobile number is collected as seller contact
        information and is not used for authentication. Email ownership is not
        independently verified by the current sign-in flow.
      </p>
    ),
  },
  {
    title: "4. When information is shared",
    body: (
      <>
        <ul>
          <li>
            Public listings: when a listing is published, its public listing
            fields and any seller contact details shown on that page can be
            viewed by visitors. Do not include information you are not
            authorised to publish.
          </li>
          <li>
            Enquiries: a property enquiry is made available to the service
            operator and may be routed to the seller responsible for that
            listing.
          </li>
          <li>
            Service providers: the site depends on configured hosting,
            database, security and media services. Listing images may be sent
            to the media provider configured for the deployment (including
            Cloudinary if that provider is enabled).
          </li>
          <li>
            Analytics: the current site loads Google Analytics to measure site
            usage. Google may process technical and usage data under its own
            terms and privacy materials.
          </li>
          <li>
            Enquiry automation: if an operator configures an external lead
            webhook, enquiry details may be sent to that endpoint. The operator
            must identify the recipient and confirm its safeguards before
            enabling it.
          </li>
          <li>
            Legal and safety: information may be disclosed where required by
            law or reasonably necessary to protect users, the service or the
            public.
          </li>
        </ul>
        <p>
          The application does not currently send transactional email or SMS
          notifications. A communication channel or service provider may change
          as the product is developed; this notice must then be updated.
        </p>
      </>
    ),
  },
  {
    title: "5. Cookies, sessions and analytics",
    body: (
      <>
        <p>
          Sign-in uses an HTTP-only session cookie named <code>vp_session</code>.
          It is used to keep a signed-in account active and is configured for a
          seven-day maximum age. The site also loads Google Analytics, which may
          use cookies or similar identifiers. Browser settings and Google&apos;s
          own controls can affect those technologies.
        </p>
        <p>
          The current implementation does not include an in-site analytics
          consent or cookie-preference panel. The operator must review whether
          this setup, its consent notice and any required controls are
          appropriate before production use.
        </p>
      </>
    ),
  },
  {
    title: "6. Retention and security",
    body: (
      <>
        <p>
          Information should be kept only for as long as needed for the stated
          purposes or as required by law. Retention periods have not been
          confirmed in this codebase and must be set before this policy is
          published: [SET RETENTION PERIODS FOR ENQUIRIES, ACCOUNTS, LISTINGS,
          ANALYTICS AND SECURITY LOGS].
        </p>
        <p>
          Access controls, password hashing, session protections and other
          safeguards are used where implemented. No internet service can
          guarantee absolute security. Report a suspected account or privacy
          issue using the published contact details above.
        </p>
      </>
    ),
  },
  {
    title: "7. Your choices and privacy requests",
    body: (
      <p>
        Subject to applicable law and any lawful retention requirement, you may
        ask the operator to provide information about, correct or erase personal
        data, withdraw consent where processing is based on consent, or raise a
        grievance. Send a request to [INSERT VERIFIED PRIVACY / GRIEVANCE EMAIL]
        and include enough information for the operator to locate your request;
        do not email passwords or identity documents unless specifically and
        safely requested. The operator must publish its identity, request
        process and applicable response timelines after legal review.
      </p>
    ),
  },
  {
    title: "8. Children and third-party sites",
    body: (
      <p>
        The service is intended for adults seeking property information and is
        not designed for children. The site may link to third-party websites or
        services; their privacy practices are governed by their own notices.
      </p>
    ),
  },
  {
    title: "9. Indian-law context and changes",
    body: (
      <p>
        This draft is prepared with reference to applicable Indian law,
        including the Digital Personal Data Protection Act, 2023 and rules and
        notifications in force, together with other laws that may apply.
        Commencement and requirements can depend on applicable notifications
        and rules. This policy is not legal advice or a certification of
        compliance. It must be reviewed by qualified Indian privacy counsel and
        updated when the operator, processing, providers or law changes.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-slate-200 bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <nav className="mb-5 text-xs text-slate-500">
            <Link href="/" className="hover:text-brand-600">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-slate-700">Privacy Policy</span>
          </nav>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Last updated: {UPDATED}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            This draft explains what information the current Vizag Properties
            website handles and why. Please read it with our{" "}
            <Link href="/terms-and-conditions" className="font-semibold text-brand-700 underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
          <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Publication placeholders remain.</strong> The operator must
            complete the legal-entity, registered-address, grievance-contact
            and data-retention fields below and obtain Indian legal review
            before treating this draft as final.
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
        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
          Questions? Contact {SITE_CONFIG.email} or call {SITE_CONFIG.phone}.
          These general contact details should be confirmed for privacy requests.
        </div>
      </div>
    </main>
  );
}
