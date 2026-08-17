import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Sajian",
  description:
    "A multi-tenant restaurant platform for Indonesia: AI-generated storefronts, subdomain-routed tenants, and live QR-to-cashier ordering into the ESB point-of-sale.",
};

const facts = [
  { label: "Architecture", value: "One app, many tenants" },
  { label: "Isolation", value: "Service-role + RLS" },
  { label: "Test suite", value: "216 tests" },
  { label: "Ordering", value: "Live in production" },
];

const sections = [
  {
    heading: "Tenant isolation, enforced twice",
    body: "A single Next.js app serves every restaurant, routed by subdomain. Isolation runs at the application layer through service-role scoping, with Postgres row-level security underneath as a backstop — so an application-layer bug still can't hand one restaurant another's orders. A live multi-tenant integration suite verifies this against real tenants rather than mocks, because the failure mode being guarded against is exactly the one mocks don't reproduce.",
  },
  {
    heading: "Storefronts the model writes",
    body: "Owners don't configure a theme; a model emits JSX for their storefront sections. That output is untrusted by definition, so it passes through a sanitizer, compiles to MDX, and renders from a SHA-256-keyed cache — versioned, and live only once the owner approves it. Roughly 73% of the 216-test suite points at that sanitizer boundary, because it's the single place where model output becomes executable code.",
  },
  {
    heading: "Onboarding from a photo",
    body: "A restaurant joins by uploading menu photos. Claude vision and DALL·E 3 extract the menu items, colors, and logo, and persist them into a storefront draft the owner can edit — replacing the hours of manual data entry that usually gates this kind of platform.",
  },
  {
    heading: "Orders that reach the kitchen",
    body: "A production-credentialed integration pushes orders into the ESB point-of-sale: a customer scans a QR code, orders on their phone, and the ticket appears at the cashier. Payment is cash-at-counter first, with online payments and WhatsApp notifications staged behind it. It is live at Mindiology Coffee in Bintaro.",
  },
];

export default function SajianPage() {
  return (
    <main className="mx-auto max-w-[72ch] px-6 py-24 text-[18px] leading-relaxed">
      <Link
        href="/"
        className="text-[15px] text-muted underline underline-offset-4 hover:no-underline"
      >
        Ryan Rochmanofenna
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">Sajian</h1>

      <p className="mt-4 text-lg text-muted">
        A multi-tenant restaurant platform for Indonesia. Restaurants get an
        ordering page in about fifteen minutes, keep their full margin, and take
        payment straight to their own bank — no aggregator in the middle.
      </p>

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <a
          className="underline underline-offset-4 hover:no-underline"
          href="https://sajian.app"
        >
          sajian.app &rarr;
        </a>
        <a
          className="underline underline-offset-4 hover:no-underline"
          href="https://mindiology.sajian.app"
        >
          A live storefront &rarr;
        </a>
      </p>

      <Image
        src="/projects/sajian/home.webp"
        alt="The Sajian home page, showing a live Mindiology storefront on a phone"
        width={1600}
        height={807}
        className="mt-8 w-full border border-line"
        priority
      />

      <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-4 text-[15px] sm:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-xs uppercase tracking-wide text-subtle">
              {fact.label}
            </dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-16 space-y-12">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-medium">{section.heading}</h2>
            <p className="mt-2 text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">
          Stack
        </h2>
        <p className="mt-3 text-muted">
          Next.js App Router, Supabase (Postgres, Auth, Realtime), TypeScript,
          Tailwind, Zustand for the cart, ESB POS for order routing.
        </p>
      </section>
    </main>
  );
}
