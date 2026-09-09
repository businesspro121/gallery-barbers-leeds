/* ============================================================================
   GALLERY BARBERS — SITE CONFIGURATION
   ----------------------------------------------------------------------------
   The one file to edit to point the site at real services.

   Everything here is PUBLIC — it ships to the browser — so never put a secret
   key, password or API secret in it. Publishable / referrer-restricted keys only.

   Prices, services and gallery photos are NOT here. They live directly in
   index.html so search engines can read them; see the comments above the
   Services and Gallery sections there.
   ========================================================================= */

window.GB_CONFIG = {

  /* ── Contact ────────────────────────────────────────────────────────────
     Change these and the booking form, WhatsApp links, call buttons and
     footer all follow.                                                     */
  phone:        "+447955040765",
  phoneDisplay: "+44 7955 040765",
  whatsapp:     "447955040765",          // digits only, no + and no spaces
  whatsappGreeting: "Hi Gallery Barbers, I'd like to book an appointment.",


  /* ── Opening hours ──────────────────────────────────────────────────────
     Drive three things at once: the Visit section, the booking form's time
     slots, and the structured data Google reads. Keep them in step with the
     openingHoursSpecification block in index.html.

     24-hour "HH:MM". Set a day to null for closed.                          */
  hours: {
    mon: ["09:00", "17:30"],
    tue: ["09:00", "17:30"],
    wed: ["09:00", "17:30"],
    thu: ["09:00", "17:30"],
    fri: ["09:00", "17:30"],
    sat: ["09:00", "17:30"],
    sun: null
  },


  /* ── Booking ────────────────────────────────────────────────────────────
     mode: "whatsapp"  → the form gathers everything, then hands the customer
                         a pre-written WhatsApp message to send. Works with no
                         backend and no monthly fee. This is the default.
     mode: "endpoint"  → the form POSTs JSON to `endpoint` instead. Use this
                         once there is a booking provider, a form service
                         (Formspree / Basin / Web3Forms) or your own API.

     live: false → time slots come from the opening hours above, and the
                   wording says the shop will confirm. Set it to true only
                   once `endpoint` returns real availability, so the site
                   never shows a slot as free when it isn't.                 */
  booking: {
    mode:     "whatsapp",
    endpoint: "",                        // e.g. "https://formspree.io/f/xxxxxxx"
    live:     false,
    leadTimeHours: 2,                    // earliest bookable slot from now
    maxDaysAhead:  60,
    slotMinutes:   30
  },


  /* ── Google Maps ────────────────────────────────────────────────────────
     The map loads only after the visitor asks for it. That keeps the site on
     the right side of PECR/GDPR and keeps a third-party iframe out of the
     critical path.

     Optional: to use the official Maps Embed API rather than the standard
     embed, enable "Maps Embed API" in the Google Cloud console, create a key,
     restrict it to your domain (HTTP referrer), and paste it below.         */
  maps: {
    apiKey:  "",
    query:   "Gallery Barbers, Stall 10-11, Leeds Kirkgate Market, Leeds LS2 7HJ",
    directionsUrl: "https://www.google.com/maps/search/?api=1&query=Gallery+Barbers%2C+Stall+10-11%2C+Leeds+Kirkgate+Market%2C+Leeds+LS2+7HJ%2C+United+Kingdom",
    reviewsUrl:    "https://www.google.com/maps/search/?api=1&query=Gallery+Barbers%2C+Stall+10-11%2C+Leeds+Kirkgate+Market%2C+Leeds+LS2+7HJ%2C+United+Kingdom"
  },


  /* ── Social ─────────────────────────────────────────────────────────────
     Add a URL and its button appears automatically; leave one empty and the
     site simply doesn't link to it.                                         */
  social: {
    instagram: "https://www.instagram.com/gallery_barber/",
    facebook:  "",
    tiktok:    ""
  }
};
