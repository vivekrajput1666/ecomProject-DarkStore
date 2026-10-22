type TermsSection = {
  title: string;
  paragraphs: string[];
};

const sections: TermsSection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "These Terms and Conditions describe the general rules for using the DARKSTORE website and purchasing products through it.",
      "This is general ecommerce information and is not legal advice. It should be reviewed and adapted to your business details, policies, and applicable laws before production use.",
    ],
  },
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing the website or placing an order, you agree to follow these Terms and Conditions and any store policies referenced here. If you do not agree, please do not use the website.",
    ],
  },
  {
    title: "Account Registration",
    paragraphs: [
      "You are responsible for providing accurate account information, keeping your login details private, and notifying us if you believe your account has been used without permission. You should not create an account using another person's information.",
    ],
  },
  {
    title: "Products and Product Information",
    paragraphs: [
      "We aim to describe products, sizes, colors, availability, and images accurately. Screen settings and ordinary product variation may affect how items appear. Product information may be corrected or updated without notice.",
    ],
  },
  {
    title: "Prices and Payments",
    paragraphs: [
      "Prices, taxes, shipping charges, and available payment methods are shown during the shopping and checkout process where applicable. Prices may change, but changes will not normally affect an order that has already been accepted.",
    ],
  },
  {
    title: "Orders and Order Acceptance",
    paragraphs: [
      "Submitting an order is a request to purchase. We may review availability, payment, delivery details, and other order information before accepting it. We may cancel or decline an order where an item is unavailable, information is inaccurate, payment is not authorized, or misuse is suspected.",
    ],
  },
  {
    title: "Shipping and Delivery",
    paragraphs: [
      "Delivery estimates are provided for guidance and may be affected by product availability, address accuracy, carrier delays, weather, or other events outside our reasonable control. You are responsible for providing a complete and accurate delivery address.",
    ],
  },
  {
    title: "Returns and Refunds",
    paragraphs: [
      "Returns, exchanges, cancellations, and refunds are handled according to the store's applicable return policy and the information shown for the relevant order. Items may need to meet stated condition, timing, and packaging requirements.",
    ],
  },
  {
    title: "Coupons and Discounts",
    paragraphs: [
      "Coupons and promotional discounts may have their own eligibility, expiry, usage, product, customer, or order requirements. Unless stated otherwise, promotions cannot be combined, transferred, exchanged for cash, or applied after an order is placed.",
    ],
  },
  {
    title: "User Responsibilities",
    paragraphs: [
      "You agree to use the website lawfully, provide accurate information, respect other users, and avoid actions that disrupt the website, interfere with transactions, or attempt to gain unauthorized access.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "The website's text, branding, graphics, product presentation, software, and other content belong to the store or its licensors unless stated otherwise. You may use the website for personal shopping purposes, but you may not reproduce, distribute, or commercially exploit its content without permission.",
    ],
  },
  {
    title: "Prohibited Activities",
    paragraphs: [
      "You must not use the website to commit fraud, place orders with false information, scrape or copy content without permission, upload harmful code, bypass security, infringe rights, or interfere with the operation of the store.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, the website and its content are provided on an available basis. The store is not responsible for losses caused by events outside its reasonable control, interruptions, inaccurate user information, or unauthorized use of an account. Nothing here is intended to remove rights that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Changes to Terms",
    paragraphs: [
      "We may update these Terms and Conditions when the website, products, or policies change. The updated version will be posted on this page, and continued use of the website after an update may be subject to the revised terms.",
    ],
  },
  {
    title: "Governing Law",
    paragraphs: [
      "These Terms and Conditions should identify the governing law and dispute forum applicable to the business. Replace this general statement with your reviewed business-specific provision before production use.",
    ],
  },
  {
    title: "Contact Us",
    paragraphs: [
      "For questions about these Terms and Conditions, contact the store through the support details published on the website. Replace this text with your legal business name and current contact information before production use.",
    ],
  },
];

export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-[#090909] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 border-b border-white/10 pb-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            DARKSTORE / Legal
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            The general terms for browsing DARKSTORE, creating an account, and placing an order.
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
