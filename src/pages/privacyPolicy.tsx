type PolicySection = {
  title: string;
  paragraphs: string[];
};

const sections: PolicySection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "This Privacy Policy explains how DARKSTORE may collect, use, store, and share information when you visit our website, create an account, place an order, or contact us.",
      "This is general information for an ecommerce website. It should be reviewed and adapted to your actual business practices, vendors, contact details, and applicable laws before production use.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: [
      "We may collect information you provide directly, information created through your use of the website, and limited information received from service providers that help us operate the store.",
    ],
  },
  {
    title: "Personal Information",
    paragraphs: [
      "Depending on how you use the website, this may include your name, email address, phone number, billing and delivery address, account credentials, order details, and messages sent to our support team.",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: [
      "We may use information to provide and improve the store, process orders and payments, arrange delivery, manage your account, respond to enquiries, prevent misuse, send service messages, and communicate marketing messages where permitted and appropriate.",
    ],
  },
  {
    title: "Cookies and Tracking Technologies",
    paragraphs: [
      "The website may use cookies or similar technologies to keep you signed in, remember preferences, understand website usage, and improve functionality. Your browser may allow you to control or remove cookies, although some features may not work as intended without them.",
    ],
  },
  {
    title: "Payment Information",
    paragraphs: [
      "Payments may be handled by payment providers. We generally receive transaction status and limited payment details needed to confirm an order, rather than storing complete card or banking credentials on our systems. Payment providers may apply their own terms and privacy notices.",
    ],
  },
  {
    title: "Order and Delivery Information",
    paragraphs: [
      "We use order, contact, and delivery details to confirm purchases, prepare products, communicate updates, and coordinate shipping, returns, or refunds.",
    ],
  },
  {
    title: "How We Protect Your Information",
    paragraphs: [
      "We use reasonable administrative, technical, and organizational measures intended to protect information. No internet transmission or storage system can be guaranteed to be completely secure.",
    ],
  },
  {
    title: "Sharing of Information",
    paragraphs: [
      "We may share relevant information with service providers that support hosting, payments, delivery, customer support, analytics, or website operations. We may also share information when needed to comply with a legal request, protect the store, or address fraud, security, or safety concerns.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: [
      "Links or integrations may take you to services operated by third parties. Their handling of information is governed by their own policies, and you should review those policies before using those services.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We retain information for as long as reasonably needed for the purposes described here, including order records, account management, dispute handling, security, and business or legal recordkeeping requirements.",
    ],
  },
  {
    title: "User Rights",
    paragraphs: [
      "Depending on where you live and the circumstances, you may be able to ask about, access, correct, or delete certain personal information, or object to particular uses. Contact us to make a request. We may need to verify your identity before responding.",
    ],
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "The website is not intended for children who are not permitted to use online shopping services under the laws that apply to them. We do not knowingly request personal information from children for independent purchases.",
    ],
  },
  {
    title: "Changes to This Privacy Policy",
    paragraphs: [
      "We may update this page as the store, services, or practices change. The updated version will be posted here with a revised effective date where appropriate.",
    ],
  },
  {
    title: "Contact Us",
    paragraphs: [
      "For privacy questions or requests, contact the store through the support details published on the website. Replace this text with your legal business name and current privacy contact information before production use.",
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#090909] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b border-white/10 pb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            DARKSTORE / Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            A clear overview of the information we may collect and how it may be used when you shop with us.
          </p>
          <p className="mt-4 text-xs uppercase tracking-widest text-zinc-600">
            Last updated: September 24, 2026
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-500">
              On this page
            </p>
            <nav className="space-y-2 border-l border-white/10 pl-4">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replaceAll(" ", "-")}`}
                  className="block text-sm text-zinc-500 transition-colors hover:text-amber-400"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-5">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.title.toLowerCase().replaceAll(" ", "-")}
                className="rounded-xl border border-white/10 bg-white/3 p-6 sm:p-8"
              >
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-400 sm:text-base">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
