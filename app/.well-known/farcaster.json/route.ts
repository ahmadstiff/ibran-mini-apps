function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE,
    },
  "frame": {
    "name": "ibran-mini-apps",
    "homeUrl": "https://ibran-mini-apps.vercel.app",
    "iconUrl": "https://ibran-mini-apps.vercel.app/icon.png",
    "version": "1",
    "imageUrl": "https://ibran-mini-apps.vercel.app/image.png",
    "subtitle": "ibran",
    "webhookUrl": "https://ibran-mini-apps.vercel.app/api/webhook",
    "description": "ibran",
    "splashImageUrl": "https://ibran-mini-apps.vercel.app/splash.png",
    "primaryCategory": "finance",
    "splashBackgroundColor": "#000000",
    "noindex": true
  },

    baseBuilder: {
      allowedAddresses: ["0xDCde6D1373e56a262DD06bf37572562D055d9888"],
    },
  });
}
