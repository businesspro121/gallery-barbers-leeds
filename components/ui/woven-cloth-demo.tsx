import WovenCloth from "@/components/ui/woven-cloth";

/**
 * The Gallery Barbers hero.
 *
 * The cloth is the backdrop; the headline, trust line and calls to action sit
 * over it. Colours are the site's own tokens — charcoal ground, warm ivory
 * copy, antique-gold accent — so the section matches the rest of the page
 * rather than the component's original crimson.
 */
export default function WovenClothDemo() {
  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-[#0B0B0C]">
      {/* backdrop */}
      <WovenCloth className="absolute inset-0 -z-20 h-full w-full" />

      {/* scrim: keeps the headline readable over the moving cloth */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,11,12,.80) 0%, rgba(11,11,12,.55) 34%, rgba(11,11,12,.88) 78%, #0B0B0C 100%)",
        }}
      />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-6 pb-16 pt-28 md:px-10">
        <p className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#C6A15B]/25 bg-[#0B0B0C]/55 px-4 py-2 text-sm text-[#DBD5C9] backdrop-blur">
          <span aria-hidden="true" className="text-[#C6A15B]">
            ★★★★★
          </span>
          Rated 4.9 on Google · 342 reviews
        </p>

        <h1 className="max-w-[14ch] font-serif text-5xl font-bold leading-[0.94] tracking-tight text-[#F4F0E8] md:text-7xl lg:text-8xl">
          Precision Cuts.
          <br />
          <span className="italic text-[#C6A15B]">Leeds Style.</span>
        </h1>

        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-[#DBD5C9]">
          Sharp cuts, clean fades and welcoming service in the heart of Leeds
          Kirkgate Market.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#book"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#C6A15B] px-6 font-semibold text-[#0B0B0C] transition hover:-translate-y-0.5 hover:bg-[#E0C088]"
          >
            Book Your Appointment
          </a>
          <a
            href="https://wa.me/447955040765"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#17803F] px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#19853E]"
          >
            Chat on WhatsApp
          </a>
        </div>

        <p className="mt-8 flex flex-wrap gap-x-8 gap-y-2 border-t border-white/10 pt-6 text-sm text-[#A9A9B0]">
          <span>
            <strong className="font-semibold text-[#F4F0E8]">Unisex</strong> · men,
            women &amp; children
          </span>
          <span>
            <strong className="font-semibold text-[#F4F0E8]">Stall 10–11</strong> ·
            Leeds Kirkgate Market
          </span>
          <span>
            <strong className="font-semibold text-[#F4F0E8]">Walk-ins welcome</strong>
          </span>
        </p>
      </div>
    </section>
  );
}
