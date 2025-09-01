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
      header: "eyJmaWQiOjEzMTg0NDcsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgwMjMxODU5MTJiMEE3OTEyMzM3M2U3MTgyNDQ5ZjgyZjdiMDVkOTlGIn0",
      payload: "eyJkb21haW4iOiJpYnJhbi1taW5pLWFwcHMudmVyY2VsLmFwcCJ9",
      signature: "MHgzYTgxNWM3ZGNiZTI2YTI1MzU3ZTU4YjFiY2JkN2IzNTE4NDFjNGEyZWZjNDgzODEwZjhkNjM5MGNkM2Y5MDU5NjI3ZGVhODc5MjllNjc3MWRjMTAxODMzYWU4M2ZkNjc5NmQzMmEzZmNhYWJhYWViM2MyMzQ2MzY2YmNkMGU5MTFj",
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
    "noindex": false
  },

    baseBuilder: {
      allowedAddresses: ["0xDCde6D1373e56a262DD06bf37572562D055d9888"],
    },
  });
}
