/* ============================================================================
   GALLERY BARBERS — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   This is the only file you need to touch to connect the site to real services.
   Everything here is PUBLIC (it ships to the browser), so never put a secret
   key, password, or API secret in this file. Only publishable/restricted keys.

   Prices, service names and gallery photos are NOT here — those live directly
   in index.html so they stay visible to Google. Look for the
   "EDIT ME" comments in that file.
   ========================================================================= */

window.GB_CONFIG = {

  /* ── Business contact ───────────────────────────────────────────────────
     Verified from the shop and its signage. Change here and the booking
     form, WhatsApp links and call buttons all follow.                      */
  phone:        "+447955040765",
  phoneDisplay: "+44 7955 040765",
  whatsapp:     "447955040765",          // digits only, no + and no spaces
  whatsappGreeting: "Hi Gallery Barbers, I'd like to book an appointment.",


  /* ── Booking ────────────────────────────────────────────────────────────
     mode: "whatsapp"  → the form collects everything, then hands the customer
                         a pre-filled WhatsApp message to send. Works today,
                         with no backend and no monthly fee. This is the
                         default and it is honest: nothing is "confirmed"
                         until the shop replies.
     mode: "endpoint"  → the form POSTs JSON to `endpoint` instead. Use this
                         once you have a booking provider, a form service
                         (Formspree / Basin / Web3Forms), or your own API.

     live: false → the date/time picker is clearly labelled DEMO AVAILABILITY
                   and shows generic opening-hours slots. It does NOT know
                   what is actually free.
     live: true  → only flip this once `endpoint` is talking to a real diary
                   that returns genuine availability. Leaving it false is the
                   safe, non-misleading default.                            */
  booking: {
    mode:     "whatsapp",
    endpoint: "",                        // e.g. "https://formspree.io/f/xxxxxxx"
    live:     false,
    leadTimeHours: 2,                    // earliest bookable slot from now
    maxDaysAhead:  60,
    slotMinutes:   30
  },


  /* ── Opening hours ──────────────────────────────────────────────────────
     Read from the shop's own window sign: "MON~SAT: 9AM-5.30PM".
     ⚠ CONFIRM THESE WITH THE SHOP BEFORE LAUNCH — they also drive the
     structured data in index.html and the demo booking slots.
     Use 24h "HH:MM". Set a day to null for closed.                         */
  hours: {
    mon: ["09:00", "17:30"],
    tue: ["09:00", "17:30"],
    wed: ["09:00", "17:30"],
    thu: ["09:00", "17:30"],
    fri: ["09:00", "17:30"],
    sat: ["09:00", "17:30"],
    sun: null
  },


  /* ── Google Maps ────────────────────────────────────────────────────────
     The map is only loaded after the visitor accepts it (see the cookie
     banner) — that keeps you on the right side of PECR/GDPR and stops a
     third-party iframe hurting your Core Web Vitals.

     To switch from the basic embed to the official Maps Embed API:
       1. console.cloud.google.com → enable "Maps Embed API"
       2. create an API key, then RESTRICT it to your domain (HTTP referrer)
       3. paste it below.
     Leaving it empty falls back to the keyless Google Maps embed.          */
  maps: {
    apiKey:  "",                         // e.g. "AIzaSy..."
    query:   "Gallery Barbers, Stall 10-11, Leeds Kirkgate Market, Leeds LS2 7HJ",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Gallery+Barbers%2C+Stall+10-11%2C+Leeds+Kirkgate+Market%2C+Leeds+LS2+7HJ%2C+United+Kingdom",
    reviewsUrl:    "https://www.google.com/maps/search/?api=1&query=Gallery+Barbers%2C+Stall+10-11%2C+Leeds+Kirkgate+Market%2C+Leeds+LS2+7HJ%2C+United+Kingdom"
  },


  /* ── Google reviews (Places API) ────────────────────────────────────────
     The 4.9 / 342 figures shown on the page are the shop's real Google
     numbers, entered by hand. To pull live review TEXT you must use the
     official Places API and display Google's attribution — never scrape
     Google Maps, and never write your own "customer" quotes.

     A browser-side key can be read by anyone, so the supported pattern is:
     call Places from a small server function and expose the result at
     `proxyUrl` below. Then set enabled: true.                              */
  reviews: {
    enabled:  false,
    placeId:  "",                        // find it: developers.google.com/maps/documentation/places/web-service/place-id
    proxyUrl: "",                        // your own endpoint that calls Places server-side
    ratingValue: 4.9,
    reviewCount: 342
  },


  /* ── Social ─────────────────────────────────────────────────────────────
     Instagram is confirmed. The others are placeholders — the buttons stay
     visibly disabled until you paste a real URL in, so the site never links
     to an account that might not exist.                                    */
  social: {
    instagram: "https://www.instagram.com/gallery_barber/",
    facebook:  "",                       // the shop sign shows a Facebook logo — ask them for the page URL
    tiktok:    "",
    google:    "https://www.google.com/maps/search/?api=1&query=Gallery+Barbers%2C+Stall+10-11%2C+Leeds+Kirkgate+Market%2C+Leeds+LS2+7HJ%2C+United+Kingdom"
  },


  /* ── Instagram grid (optional) ──────────────────────────────────────────
     Off by default. Only turn this on with a legitimate integration:
     Instagram Basic Display / Graph API via your own server, or a licensed
     widget provider. Do not embed scraped images.                          */
  instagramFeed: {
    enabled: false,
    proxyUrl: ""                         // your endpoint returning [{ image, permalink, caption }]
  }
};
