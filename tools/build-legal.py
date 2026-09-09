"""
Generates the three legal pages from one shared shell so their header, footer
and styling can never drift apart.

Run:  python tools/build-legal.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://businesspro121.github.io/gallery-barbers-leeds/"

SHELL = """<!DOCTYPE html>
<html lang="en-GB" data-motion="full">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title} | Gallery Barbers Leeds</title>
<meta name="description" content="{desc}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="{site}{slug}">
<meta name="theme-color" content="#0B0B0C">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
<script>
(function () {{
  var d = document.documentElement;
  d.classList.add('js');
  var saved = null;
  try {{ saved = localStorage.getItem('gb-motion'); }} catch (e) {{}}
  var reduced = saved ? saved === 'reduced'
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.setAttribute('data-motion', reduced ? 'reduced' : 'full');
}})();
</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>

<header class="site-header is-scrolled">
  <div class="shell site-header__inner">
    <a class="brand" href="index.html" aria-label="Gallery Barbers — home">
      <span class="brand__mark">Gallery Barbers</span>
      <span class="brand__sub">Leeds</span>
    </a>
    <div class="header__actions">
      <a class="btn btn--ghost btn--sm" href="index.html">Back to the site</a>
    </div>
  </div>
</header>

<main id="main" class="section doc">
  <div class="shell">
    <p class="eyebrow">{eyebrow}</p>
    <h1 class="section-title" style="font-size:var(--step-3)">{title}</h1>
    <p class="doc__meta">Last updated {updated}</p>

    <div class="doc__note">
      <p><strong>Template notice.</strong> {note}</p>
    </div>

    <div class="doc__body">
{body}
    </div>
  </div>
</main>

<footer class="site-footer">
  <div class="shell">
    <div class="footer__grid">
      <div class="footer__col footer__brand">
        <span class="brand__mark">Gallery Barbers</span>
        <p class="footer__blurb">Stall 10&ndash;11, Leeds Kirkgate Market, Leeds LS2 7HJ.</p>
      </div>
      <div class="footer__col">
        <h3>Get in touch</h3>
        <ul>
          <li><a href="tel:+447955040765">+44 7955 040765</a></li>
          <li><a href="https://wa.me/447955040765" target="_blank" rel="noopener noreferrer">WhatsApp the shop</a></li>
          <li><a href="index.html#book">Request an appointment</a></li>
        </ul>
      </div>
      <div class="footer__col">
        <h3>The small print</h3>
        <ul>
          <li><a href="privacy.html">Privacy policy</a></li>
          <li><a href="cookies.html">Cookie policy</a></li>
          <li><a href="terms.html">Terms of use</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <p>&copy; <span id="year">2026</span> Gallery Barbers. All rights reserved.</p>
    </div>
  </div>
</footer>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
{extra}
</body>
</html>
"""

UPDATED = "9 September 2026"

PAGES = [
    dict(
        slug="privacy.html",
        eyebrow="Legal",
        title="Privacy policy",
        desc="How Gallery Barbers in Leeds Kirkgate Market handles the personal details you send through this website.",
        note=("This policy describes how the website itself behaves and is written to be accurate "
              "about that. Gallery Barbers should still read it through, add a contact email, and "
              "have it checked before launch &mdash; especially if a booking provider, payment "
              "system or marketing list is added later."),
        body="""
      <p>
        This policy explains what happens to the information you give Gallery Barbers
        through this website. Gallery Barbers, Stall 10&ndash;11, Leeds Kirkgate Market,
        Leeds LS2 7HJ, is the data controller.
      </p>
      <p>
        You can reach us on <a href="tel:+447955040765">+44 7955 040765</a> or on
        <a href="https://wa.me/447955040765" target="_blank" rel="noopener noreferrer">WhatsApp</a>.
        <span class="editable" title="Add a contact email address before launch">An email address for privacy
        questions should be added here.</span>
      </p>

      <h2>What we collect</h2>
      <p>
        The only place this website asks for personal information is the appointment
        request form. It asks for:
      </p>
      <ul>
        <li>your name;</li>
        <li>your phone number;</li>
        <li>your email address;</li>
        <li>the service, barber, date and time you would like;</li>
        <li>anything you choose to write in the notes box.</li>
      </ul>
      <p>
        There is no account to create, no newsletter sign-up, and no advertising or
        analytics tracking on this site.
      </p>

      <h2>Where it goes</h2>
      <p>
        This website has no database and stores nothing on a server. When you submit the
        form, your details are turned into a message and handed to
        <strong>WhatsApp</strong> so you can send it to the shop yourself. Nothing is sent
        anywhere until you press send inside WhatsApp. WhatsApp is operated by Meta and
        has its own
        <a href="https://www.whatsapp.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a>.
      </p>
      <p>
        If the shop later connects a booking system, the same form will send your details
        to that provider instead. This policy will be updated to name the provider when
        that happens.
      </p>

      <h2>Why we can use it</h2>
      <p>
        Under UK GDPR we rely on your <strong>consent</strong>, given with the tick box on
        the form, and on our <strong>legitimate interest</strong> in replying to someone
        who has asked for an appointment. You can withdraw consent at any time by telling
        us.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Your message sits in the shop&rsquo;s WhatsApp or phone in the same way as any
        other customer message. We keep booking messages only as long as we need them to
        run the appointment book, and delete them when they are no longer useful.
      </p>

      <h2>Who else sees it</h2>
      <p>
        We do not sell your details and we do not share them for marketing. The only third
        parties involved in this website are:
      </p>
      <ul>
        <li><strong>WhatsApp / Meta</strong> &mdash; carries your booking message, if you send it that way.</li>
        <li><strong>Google</strong> &mdash; serves the fonts used on this site, and the map on the Visit section if you choose to load it. See the <a href="cookies.html">cookie policy</a>.</li>
        <li><strong>Our website host</strong> &mdash; serves these pages and keeps standard server logs.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        You have the right to ask for a copy of the personal information we hold about
        you, to have it corrected or erased, to restrict or object to how we use it, and
        to ask for it in a portable form. Contact us using the details above and we will
        respond within one month.
      </p>
      <p>
        If you are not happy with our response you can complain to the Information
        Commissioner&rsquo;s Office at
        <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
      </p>

      <h2>Children</h2>
      <p>
        We cut children&rsquo;s hair, but appointment requests should be made by a parent
        or guardian. We do not knowingly collect details directly from children.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top of the page changes with it.
      </p>
""",
        extra="",
    ),

    dict(
        slug="cookies.html",
        eyebrow="Legal",
        title="Cookie policy",
        desc="What this website stores in your browser, and how to change your choice. Gallery Barbers, Leeds Kirkgate Market.",
        note=("This site was deliberately built without tracking. If analytics, a chat widget or "
              "advertising pixels are added later, this page and the consent banner must be "
              "updated first &mdash; consent has to be gathered <em>before</em> such scripts load."),
        body="""
      <p>
        This website sets <strong>no advertising cookies and no analytics cookies</strong>.
        Nothing here follows you around the internet.
      </p>

      <h2>What is stored on your device</h2>
      <p>
        Two small values are saved in your browser&rsquo;s local storage. They never leave
        your device and no one else can read them:
      </p>
      <ul>
        <li><strong>gb-motion</strong> &mdash; remembers whether you turned animation off using the toggle in the footer.</li>
        <li><strong>gb-consent</strong> &mdash; remembers your answer to the cookie notice, so you are not asked again.</li>
      </ul>
      <p>
        Both are strictly necessary preference settings. Neither identifies you.
      </p>

      <h2>The Google Map</h2>
      <p>
        The map on the Visit section is an embed from Google. Google can set its own
        cookies and receive your IP address when it loads, so <strong>we do not load it
        until you ask us to</strong>. Until you press &ldquo;Load Google Map&rdquo;, no
        request is made to Google Maps at all. Google&rsquo;s own
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">privacy policy</a>
        applies once it loads.
      </p>

      <h2>Fonts</h2>
      <p>
        The typefaces on this site are served by Google Fonts, which means your browser
        makes a request to <code>fonts.googleapis.com</code> and
        <code>fonts.gstatic.com</code> when the page loads. Google receives your IP
        address as part of that request but sets no cookies for it. The fonts can be
        self-hosted instead if the shop would rather remove that request entirely.
      </p>

      <h2>Changing your mind</h2>
      <p>
        You can clear the choices this site has remembered at any time. That will bring
        the cookie notice back and switch the map off again.
      </p>
      <p>
        <button class="btn btn--gold btn--sm" type="button" id="resetConsent">Clear my saved choices</button>
        <span id="resetDone" class="field__hint" hidden style="margin-left:.6rem">Cleared &mdash; reload the page to start fresh.</span>
      </p>
      <p>
        You can also block or delete cookies and site data in your browser&rsquo;s own
        settings, though some things &mdash; like remembering that animation is off &mdash;
        will stop working.
      </p>
""",
        extra="""<script>
document.getElementById('resetConsent').addEventListener('click', function () {
  try {
    localStorage.removeItem('gb-consent');
    localStorage.removeItem('gb-motion');
  } catch (e) {}
  document.getElementById('resetDone').hidden = false;
});
</script>""",
    ),

    dict(
        slug="terms.html",
        eyebrow="Legal",
        title="Terms of use",
        desc="The terms covering use of the Gallery Barbers website, appointment requests and published prices.",
        note=("Standard terms for a small business website, written to match how this site actually "
              "works. Gallery Barbers should read them and have them checked before launch."),
        body="""
      <p>
        These terms cover your use of the Gallery Barbers website. Using the site means
        you accept them.
      </p>

      <h2>Appointment requests</h2>
      <p>
        The booking form on this site sends a <strong>request</strong>, not a confirmed
        appointment. A slot is only yours once the shop has replied to confirm it. Times
        shown in the form come from our usual opening hours and are not a live diary, so
        a time appearing available does not mean it is free.
      </p>
      <p>
        Gallery Barbers has always welcomed walk-ins, and you never need an appointment to
        be seen.
      </p>

      <h2>Prices and services</h2>
      <p>
        Prices, durations and service descriptions shown on this site are indicative and
        may change. Several are marked as placeholders awaiting confirmation. The price
        you are quoted in the shop is the price that applies &mdash; some work, such as
        colour or longer hair, is priced after we have seen it.
      </p>

      <h2>Accuracy</h2>
      <p>
        We try to keep this site accurate and up to date, but we do not guarantee that it
        is free of errors or always current. Opening hours in particular should be checked
        with the shop or on our Google listing if you are making a special journey.
      </p>

      <h2>Photographs and content</h2>
      <p>
        The photographs, text and design on this site belong to Gallery Barbers or are
        used with permission, and may not be copied or reused without our agreement.
        Google&rsquo;s ratings, logo and map content remain Google&rsquo;s property and are
        shown under Google&rsquo;s terms.
      </p>

      <h2>Links to other sites</h2>
      <p>
        Where we link to other websites &mdash; Google, Instagram, WhatsApp &mdash; we are
        not responsible for their content or their handling of your data.
      </p>

      <h2>Liability</h2>
      <p>
        This site is provided as it is. To the extent the law allows, we are not liable
        for any loss arising from using it or from being unable to use it. Nothing in
        these terms limits liability for death or personal injury caused by negligence, or
        for fraud, or any other liability that cannot lawfully be excluded.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts of
        England and Wales have jurisdiction over any dispute.
      </p>

      <h2>Contact</h2>
      <p>
        Gallery Barbers, Stall 10&ndash;11, Leeds Kirkgate Market, Leeds LS2 7HJ.
        <a href="tel:+447955040765">+44 7955 040765</a>.
      </p>
""",
        extra="",
    ),
]

for p in PAGES:
    html = SHELL.format(site=SITE, updated=UPDATED, **p)
    (ROOT / p["slug"]).write_text(html, encoding="utf-8")
    print("wrote", p["slug"], len(html), "bytes")
