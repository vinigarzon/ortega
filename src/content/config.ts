import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      excerpt: z.string().optional().default(""),
      category: z.string().default("Entrevistas"),
      type: z.enum(["blog", "videoteca"]).default("blog"),
      featuredImage: z.string().optional(),
      author: z.string().optional().default("Ortega & Ortega Abogados"),
      videoEmbed: z
        .string()
        .optional()
        .transform((v) => (v && v.trim() !== "" ? v : undefined))
        .pipe(z.string().url().optional()),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const lawyers = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    position: z.string(),
    photo: z.string().optional(),
    /** Zoom de la foto en la card. 1.0 = sin zoom, >1 = más grande, <1 = más pequeña (con borde navy). */
    photoZoom: z.number().min(0.6).max(2).default(1),
    /** Posición vertical del recorte: 0% (arriba) – 100% (abajo). Default 18% */
    photoFocusY: z.number().min(0).max(100).default(18),
    bio: z.string().optional().default(""),
    specialty: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    email: z.string().optional().default(""),
    order: z.number().default(99),
    active: z.boolean().default(true),
  }),
});

const gallery = defineCollection({
  type: "data",
  schema: z.object({
    // Configuración global del carrusel
    autoplay: z.boolean().default(true),
    intervalSeconds: z.number().min(2).max(30).default(5),
    transitionMs: z.number().min(200).max(3000).default(700),
    showArrows: z.boolean().default(true),
    showDots: z.boolean().default(true),
    pauseOnHover: z.boolean().default(true),
    items: z.array(
      z.object({
        image: z.string(),
        caption: z.string().optional().default(""),
        category: z.string().optional().default("oficina"),
        order: z.number().default(99),
      })
    ),
  }),
});

const settings = defineCollection({
  type: "data",
  schema: z.object({
    site: z
      .object({
        title: z.string(),
        tagline: z.string(),
        logo: z.string(),
        favicon: z.string().optional(),
      })
      .optional(),
    seo: z
      .object({
        metaTitle: z.string(),
        metaDescription: z.string(),
        ogImage: z.string().optional(),
      })
      .optional(),
    contact: z
      .object({
        phone: z.string().optional(),
        mobile: z.string().optional(),
        mobile2: z.string().optional(),
        email: z.string().optional(),
        /** Email donde llegan las notificaciones de leads del formulario. */
        leadEmail: z.string().email().optional(),
        address: z.string().optional(),
        mapsEmbed: z.string().optional(),
        whatsapp: z.string().optional(),
      })
      .optional(),
    social: z
      .object({
        twitter: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
        linkedin: z.string().optional(),
        youtube: z.string().optional(),
        tiktok: z.string().optional(),
      })
      .optional(),
    footer: z
      .object({
        copyright: z.string(),
        text: z.string().optional(),
      })
      .optional(),
    homepage: z
      .object({
        hero: z.object({
          title: z.string().optional().default(""),
          subtitle: z.string(),
          backgroundImage: z.string(),
          buttonText: z.string().optional(),
          buttonLink: z.string().optional(),
        }),
        sections: z
          .array(
            z.object({
              id: z.string(),
              title: z.string(),
              eyebrow: z.string().optional(),
              body: z.string().optional(),
              image: z.string().optional(),
              list: z.array(z.string()).optional(),
              cta: z
                .object({
                  text: z.string(),
                  link: z.string(),
                })
                .optional(),
            })
          )
          .optional(),
      })
      .optional(),
  }),
});

export const collections = { blog, lawyers, gallery, settings };
