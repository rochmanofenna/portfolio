import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Mindiology",
  description:
    "An iOS ordering and loyalty app for Mindiology, a Jakarta F&B group — built with Expo and React Native, in Indonesian, across multiple restaurant brands.",
};

const screens = [
  { src: "home", caption: "Home — location switcher, promos, quick actions" },
  { src: "explore", caption: "Explore — menu search and filters" },
  { src: "item", caption: "Item detail — notes, tax-exclusive pricing, cart" },
  { src: "order", caption: "Orders — active and past" },
  { src: "profile", caption: "Profile — loyalty tier, points, member barcode" },
];

export default function MindiologyPage() {
  return (
    <main className="mx-auto max-w-[72ch] px-6 py-24 text-[18px] leading-relaxed">
      <Link
        href="/"
        className="text-[15px] text-muted underline underline-offset-4 hover:no-underline"
      >
        Ryan Rochmanofenna
      </Link>

      <h1 className="mt-8 text-4xl font-bold tracking-tight">Mindiology</h1>

      <p className="mt-4 text-lg text-muted">
        An iOS ordering and loyalty app for my parents&rsquo; F&amp;B group in
        Jakarta. It covers more than one restaurant &mdash; Mindiology Coffee at
        Emerald Bintaro and Kamarasan among them &mdash; so the app opens on a
        location switcher rather than a single menu.
      </p>

      <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[15px]">
        <a
          className="underline underline-offset-4 hover:no-underline"
          href="https://github.com/rochmanofenna/mindiology_coffee"
        >
          Source on GitHub &rarr;
        </a>
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {screens.map((screen) => (
          <figure key={screen.src}>
            <div className="overflow-hidden rounded-2xl border border-line">
              <Image
                src={`/projects/mindiology/${screen.src}.webp`}
                alt={screen.caption}
                width={500}
                height={1082}
                className="w-full"
              />
            </div>
            <figcaption className="mt-2 text-[15px] text-muted">
              {screen.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-16 space-y-12">
        <section>
          <h2 className="font-medium">One group, several restaurants</h2>
          <p className="mt-2 text-muted">
            The group runs multiple brands, so location is a first-class concept
            rather than an afterthought: the header carries a location picker,
            and the menu, promotions, and reservations all follow from it.
            That&rsquo;s the same problem Sajian solves on the web &mdash;
            Mindiology is also its first live tenant &mdash; approached from the
            native side, for regulars who order often enough to want an app.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Loyalty as the reason to open it</h2>
          <p className="mt-2 text-muted">
            An ordering app people install once and forget is a failed app. This
            one leads with membership: a tier (Perunggu &mdash; bronze), a point
            balance, a scannable member barcode for in-store purchases, vouchers
            and daily specials. The barcode matters most in practice, since it
            works for customers who walk in and order at the counter rather than
            through the app at all.
          </p>
        </section>

        <section>
          <h2 className="font-medium">Built for how Indonesians actually order</h2>
          <p className="mt-2 text-muted">
            The interface is Indonesian throughout, not translated as an
            afterthought. Prices display as Rupiah with{" "}
            <span className="font-mono text-[15px]">
              Belum termasuk PB1 10%
            </span>{" "}
            &mdash; the local restaurant tax shown exclusive of the listed price,
            the way customers here expect to see it. Reservations sit alongside
            ordering, because dine-in matters as much as takeaway.
          </p>
        </section>
      </div>

      <section className="mt-16 border-t border-line pt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">
          Stack
        </h2>
        <p className="mt-3 text-muted">
          Expo and React Native with expo-router for file-based navigation,
          shipped as a signed iOS build, with Sentry for crash and error
          reporting.
        </p>
        <p className="mt-3 text-[15px] text-muted">
          There&rsquo;s no live demo here for the reason every mobile app has
          this problem: an iOS build is compiled ARM64 that a browser
          can&rsquo;t execute, and asking someone to sideload a build to look at
          your work is a request nobody accepts. Screenshots are the honest
          option.
        </p>
      </section>
    </main>
  );
}
