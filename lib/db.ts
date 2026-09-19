import type {
  Automation,
  Category,
  ContactMessage,
  Db,
  Faq,
  InboxMessage,
  NavItem,
  ServiceRequest,
  SocialAccount,
  SocialClient,
  SocialLink,
  SocialPackage,
  SocialPost,
  SocialPageContent,
  SiteSettings,
} from "./types";
import { getSupabase } from "./supabase";

function getClient() {
  return getSupabase();
}

function throwIfError(error: { message?: string } | null) {
  if (error) {
    throw new Error(error.message || "Supabase request failed");
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function asObject<T>(value: unknown, fallback: T): T {
  return (value ?? fallback) as T;
}

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

function dateOnly(value: string | null | undefined): string {
  if (!value) return "";
  return String(value).slice(0, 10);
}

/* -------------------------------------------------------------------------- */
/* Read                                                                       */
/* -------------------------------------------------------------------------- */

export async function getDb(): Promise<Db> {
  const client = getClient();

  const [
    settingsResult,
    navigationResult,
    categoriesResult,
    automationsResult,
    socialPageResult,
    packagesResult,
    packageFeaturesResult,
    packagePlatformsResult,
    socialLinksResult,
    faqsResult,
    requestsResult,
    messagesResult,
    postsResult,
    inboxResult,
    clientsResult,
    accountsResult,
    versionResult,
  ] = await Promise.all([
    client.from("site_settings").select("*").eq("id", 1).maybeSingle(),

    client
      .from("navigation_items")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("automation_categories")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("automations")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("social_page_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle(),

    client
      .from("social_packages")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("social_package_features")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("social_package_platforms")
      .select("*"),

    client
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true }),

    client
      .from("service_requests")
      .select("*")
      .order("created_at", { ascending: false }),

    client
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false }),

    client
      .from("social_posts")
      .select("*")
      .order("schedule_date", { ascending: true, nullsFirst: false }),

    client
      .from("social_inbox")
      .select("*")
      .order("created_at", { ascending: false }),

    client
      .from("social_clients")
      .select("*")
      .order("created_at", { ascending: true }),

    client
      .from("social_accounts")
      .select("*")
      .order("platform", { ascending: true }),

    client
      .from("site_content")
      .select("value")
      .eq("key", "db_version")
      .maybeSingle(),
  ]);

  throwIfError(settingsResult.error);
  throwIfError(navigationResult.error);
  throwIfError(categoriesResult.error);
  throwIfError(automationsResult.error);
  throwIfError(socialPageResult.error);
  throwIfError(packagesResult.error);
  throwIfError(packageFeaturesResult.error);
  throwIfError(packagePlatformsResult.error);
  throwIfError(socialLinksResult.error);
  throwIfError(faqsResult.error);
  throwIfError(requestsResult.error);
  throwIfError(messagesResult.error);
  throwIfError(postsResult.error);
  throwIfError(inboxResult.error);
  throwIfError(clientsResult.error);
  throwIfError(accountsResult.error);
  throwIfError(versionResult.error);

  const settingsRow = settingsResult.data;
  const navigationRows = navigationResult.data ?? [];
  const categoryRows = categoriesResult.data ?? [];
  const automationRows = automationsResult.data ?? [];
  const socialPageRow = socialPageResult.data;
  const packageRows = packagesResult.data ?? [];
  const featureRows = packageFeaturesResult.data ?? [];
  const packagePlatformRows = packagePlatformsResult.data ?? [];
  const socialLinkRows = socialLinksResult.data ?? [];
  const faqRows = faqsResult.data ?? [];
  const requestRows = requestsResult.data ?? [];
  const messageRows = messagesResult.data ?? [];
  const postRows = postsResult.data ?? [];
  const inboxRows = inboxResult.data ?? [];
  const clientRows = clientsResult.data ?? [];
  const accountRows = accountsResult.data ?? [];

  const categoryMap = new Map(
    categoryRows.map((row) => [row.id, row.slug])
  );

  const packageMap = new Map(
    packageRows.map((row) => [row.id, row.slug])
  );

  const clientMap = new Map(
    clientRows.map((row) => [row.id, row.name])
  );

  const featuresByPackage = new Map<string, any[]>();

  for (const feature of featureRows) {
    const list = featuresByPackage.get(feature.package_id) ?? [];
    list.push(feature);
    featuresByPackage.set(feature.package_id, list);
  }

  const platformsByPackage = new Map<string, string[]>();

  for (const relation of packagePlatformRows) {
    const list = platformsByPackage.get(relation.package_id) ?? [];

    if (relation.platform_id) {
      list.push(relation.platform_id);
    }

    platformsByPackage.set(relation.package_id, list);
  }

  const settings: SiteSettings = {
    siteName: settingsRow?.site_name ?? "FLUXMEDIA",
    tagline: asObject(settingsRow?.tagline, { en: "", fr: "", ar: "" }),
    contactEmail: settingsRow?.contact_email ?? "",
    whatsapp: settingsRow?.whatsapp ?? "",
    address: asObject(settingsRow?.address, { en: "", fr: "", ar: "" }),
    footerNote: asObject(settingsRow?.footer_note, {
      en: "",
      fr: "",
      ar: "",
    }),
  };

  const navigation: NavItem[] = navigationRows.map((row) => ({
    id: row.id,
    label: asObject(row.label, { en: "", fr: "", ar: "" }),
    href: row.href,
    order: row.sort_order,
    active: row.active,
  }));

  const categories: Category[] = categoryRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: asObject(row.name, { en: "", fr: "", ar: "" }),
    order: row.sort_order,
    active: row.active,
  }));

  const automations: Automation[] = automationRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: asObject(row.title, { en: "", fr: "", ar: "" }),
    short: asObject(row.short, { en: "", fr: "", ar: "" }),
    description: asObject(row.description, { en: "", fr: "", ar: "" }),
    category: row.category_id
      ? categoryMap.get(row.category_id) ?? ""
      : "",
    icon: row.icon,
    benefits: asArray(row.benefits),
    workflow: asArray(row.workflow),
    integrations: row.integrations ?? [],
    order: row.sort_order,
    active: row.active,
  }));

  const socialPage: SocialPageContent = socialPageRow
    ? {
        heroBadge: asObject(socialPageRow.hero_badge, {
          en: "",
          fr: "",
          ar: "",
        }),
        heroTitle: asObject(socialPageRow.hero_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        heroDescription: asObject(socialPageRow.hero_description, {
          en: "",
          fr: "",
          ar: "",
        }),
        primaryCta: asObject(socialPageRow.primary_cta, {
          en: "",
          fr: "",
          ar: "",
        }),
        secondaryCta: asObject(socialPageRow.secondary_cta, {
          en: "",
          fr: "",
          ar: "",
        }),
        servicesTitle: asObject(socialPageRow.services_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        servicesDescription: asObject(
          socialPageRow.services_description,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
        services: asArray(socialPageRow.services),
        platformsTitle: asObject(socialPageRow.platforms_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        platformsDescription: asObject(
          socialPageRow.platforms_description,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
        platforms: socialPageRow.platforms ?? [],
        packagesTitle: asObject(socialPageRow.packages_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        packagesDescription: asObject(
          socialPageRow.packages_description,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
        processTitle: asObject(socialPageRow.process_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        processDescription: asObject(
          socialPageRow.process_description,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
        processSteps: asArray(socialPageRow.process_steps),
        finalCtaTitle: asObject(socialPageRow.final_cta_title, {
          en: "",
          fr: "",
          ar: "",
        }),
        finalCtaDescription: asObject(
          socialPageRow.final_cta_description,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
        finalCtaPrimary: asObject(socialPageRow.final_cta_primary, {
          en: "",
          fr: "",
          ar: "",
        }),
        finalCtaSecondary: asObject(
          socialPageRow.final_cta_secondary,
          {
            en: "",
            fr: "",
            ar: "",
          }
        ),
      }
    : {
        heroBadge: { en: "", fr: "", ar: "" },
        heroTitle: { en: "", fr: "", ar: "" },
        heroDescription: { en: "", fr: "", ar: "" },
        primaryCta: { en: "", fr: "", ar: "" },
        secondaryCta: { en: "", fr: "", ar: "" },
        servicesTitle: { en: "", fr: "", ar: "" },
        servicesDescription: { en: "", fr: "", ar: "" },
        services: [],
        platformsTitle: { en: "", fr: "", ar: "" },
        platformsDescription: { en: "", fr: "", ar: "" },
        platforms: [],
        packagesTitle: { en: "", fr: "", ar: "" },
        packagesDescription: { en: "", fr: "", ar: "" },
        processTitle: { en: "", fr: "", ar: "" },
        processDescription: { en: "", fr: "", ar: "" },
        processSteps: [],
        finalCtaTitle: { en: "", fr: "", ar: "" },
        finalCtaDescription: { en: "", fr: "", ar: "" },
        finalCtaPrimary: { en: "", fr: "", ar: "" },
        finalCtaSecondary: { en: "", fr: "", ar: "" },
      };

  const packages: SocialPackage[] = packageRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: asObject(row.description, { en: "", fr: "", ar: "" }),
    price: Number(row.price ?? 0),
    currency: row.currency,
    billingPeriod: asObject(row.billing_period, {
      en: "per month",
      fr: "par mois",
      ar: "شهريًا",
    }),
    badge: asObject(row.badge, { en: "", fr: "", ar: "" }),
    popular: row.popular,
    visible: row.visible,
    order: row.sort_order,
    features: (featuresByPackage.get(row.id) ?? []).map((feature) => ({
      id: feature.id,
      text: asObject(feature.text, { en: "", fr: "", ar: "" }),
      order: feature.sort_order,
    })),
    postsPerMonth: row.posts_per_month,
    reelsPerMonth: row.reels_per_month,
    storiesPerMonth: row.stories_per_month,
    platforms: platformsByPackage.get(row.id) ?? [],
  }));

  const socialLinks: SocialLink[] = socialLinkRows.map((row) => ({
    id: row.id,
    platform: row.platform,
    name: row.name,
    username: row.username ?? "",
    description: asObject(row.description, {
      en: "",
      fr: "",
      ar: "",
    }),
    url: row.url,
    active: row.active,
    order: row.sort_order,
  }));

  const faqs: Faq[] = faqRows.map((row) => ({
    id: row.id,
    question: asObject(row.question, { en: "", fr: "", ar: "" }),
    answer: asObject(row.answer, { en: "", fr: "", ar: "" }),
    order: row.sort_order,
    visible: row.visible,
  }));

  const requests: ServiceRequest[] = requestRows.map((row) => ({
    id: row.id,
    type: row.type,
    fullName: row.full_name,
    email: row.email,
    whatsapp: row.whatsapp,
    company: row.company ?? "",
    selectedId: row.selected_id,
    selectedName: row.selected_name,
    selectedPrice: row.selected_price ?? undefined,
    description: row.description,
    additional: row.additional ?? "",
    platforms: row.platforms ?? [],
    goals: row.goals ?? undefined,
    brandInfo: row.brand_info ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  }));

  const messages: ContactMessage[] = messageRows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp ?? "",
    company: row.company ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));

  const posts: SocialPost[] = postRows.map((row) => ({
    id: row.id,
    client: row.client_id ? clientMap.get(row.client_id) ?? "" : "",
    platform: row.platform,
    caption: row.caption ?? "",
    media: row.media_url ?? "",
    contentType: row.content_type ?? "",
    campaign: row.campaign ?? "",
    status: row.status,
    scheduleDate: dateOnly(row.schedule_date),
  }));

  const inbox: InboxMessage[] = inboxRows.map((row) => ({
    id: row.id,
    platform: row.platform,
    author: row.author ?? "",
    handle: row.handle ?? "",
    body: row.body,
    category: row.category,
    unread: row.unread,
    createdAt: row.created_at,
    suggestedReply: row.suggested_reply ?? "",
  }));

  const clients: SocialClient[] = clientRows.map((row) => ({
    id: row.id,
    name: row.name,
    industry: row.industry ?? "",
    platforms: row.platforms ?? [],
    packageSlug: row.package_id
      ? packageMap.get(row.package_id) ?? ""
      : "",
    since: dateOnly(row.since),
    status: row.status,
  }));

  const accounts: SocialAccount[] = accountRows.map((row) => ({
    id: row.id,
    platform: row.platform,
    handle: row.handle,
    client: row.client_id
      ? clientMap.get(row.client_id) ?? ""
      : "",
    connected: row.connected,
    note: row.note ?? "",
  }));

  const versionValue = versionResult.data?.value;

  const version =
    typeof versionValue === "number"
      ? versionValue
      : Number(versionValue ?? 1);

  return {
    version: Number.isFinite(version) ? version : 1,
    settings,
    navigation,
    categories,
    automations,
    socialPage,
    packages,
    socialLinks,
    faqs,
    requests,
    messages,
    posts,
    inbox,
    clients,
    accounts,
  };
}

/* -------------------------------------------------------------------------- */
/* Write                                                                      */
/* -------------------------------------------------------------------------- */

export async function mutateDb<T>(
  fn: (db: Db) => T | Promise<T>
): Promise<T> {
  const db = await getDb();

  const result = await fn(db);

  await persistDb(db);

  return result;
}

async function persistDb(db: Db) {
  const client = getClient();

  /* ------------------------------- Settings ------------------------------ */

  {
    const { error } = await client.from("site_settings").upsert(
      {
        id: 1,
        site_name: db.settings.siteName,
        tagline: db.settings.tagline,
        contact_email: db.settings.contactEmail,
        whatsapp: db.settings.whatsapp,
        address: db.settings.address,
        footer_note: db.settings.footerNote,
      },
      { onConflict: "id" }
    );

    throwIfError(error);
  }

  /* ------------------------------ Navigation ------------------------------ */

  {
    const rows = db.navigation.map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      sort_order: item.order,
      active: item.active,
    }));

    if (rows.length) {
      const { error } = await client
        .from("navigation_items")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);

      const ids = rows.map((row) => row.id);

      const { data: existing, error: readError } = await client
        .from("navigation_items")
        .select("id");

      throwIfError(readError);

      const obsolete = (existing ?? [])
        .map((row) => row.id)
        .filter((id) => !ids.includes(id));

      if (obsolete.length) {
        const { error: deleteError } = await client
          .from("navigation_items")
          .delete()
          .in("id", obsolete);

        throwIfError(deleteError);
      }
    }
  }

  /* ------------------------------ Categories ------------------------------ */

  {
    const rows = db.categories.map((item) => ({
      id: item.id,
      slug: item.slug,
      name: item.name,
      sort_order: item.order,
      active: item.active,
    }));

    if (rows.length) {
      const { error } = await client
        .from("automation_categories")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);

      const ids = rows.map((row) => row.id);

      const { data: existing, error: readError } = await client
        .from("automation_categories")
        .select("id");

      throwIfError(readError);

      const obsolete = (existing ?? [])
        .map((row) => row.id)
        .filter((id) => !ids.includes(id));

      if (obsolete.length) {
        const { error: deleteError } = await client
          .from("automation_categories")
          .delete()
          .in("id", obsolete);

        throwIfError(deleteError);
      }
    }
  }

  /* ------------------------------ Automations ----------------------------- */

  {
    const categoryBySlug = new Map(
      db.categories.map((category) => [category.slug, category.id])
    );

    const rows = db.automations.map((item) => ({
      id: item.id,
      slug: item.slug,
      category_id: categoryBySlug.get(item.category) ?? null,
      icon: item.icon,
      title: item.title,
      short: item.short,
      description: item.description,
      benefits: item.benefits,
      workflow: item.workflow,
      integrations: item.integrations,
      sort_order: item.order,
      active: item.active,
    }));

    if (rows.length) {
      const { error } = await client
        .from("automations")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);

      const ids = rows.map((row) => row.id);

      const { data: existing, error: readError } = await client
        .from("automations")
        .select("id");

      throwIfError(readError);

      const obsolete = (existing ?? [])
        .map((row) => row.id)
        .filter((id) => !ids.includes(id));

      if (obsolete.length) {
        const { error: deleteError } = await client
          .from("automations")
          .delete()
          .in("id", obsolete);

        throwIfError(deleteError);
      }
    }
  }

  /* --------------------------- Social page content ----------------------- */

  {
    const page = db.socialPage;

    const { error } = await client.from("social_page_content").upsert(
      {
        id: 1,
        hero_badge: page.heroBadge,
        hero_title: page.heroTitle,
        hero_description: page.heroDescription,
        primary_cta: page.primaryCta,
        secondary_cta: page.secondaryCta,
        services_title: page.servicesTitle,
        services_description: page.servicesDescription,
        services: page.services,
        platforms_title: page.platformsTitle,
        platforms_description: page.platformsDescription,
        platforms: page.platforms,
        packages_title: page.packagesTitle,
        packages_description: page.packagesDescription,
        process_title: page.processTitle,
        process_description: page.processDescription,
        process_steps: page.processSteps,
        final_cta_title: page.finalCtaTitle,
        final_cta_description: page.finalCtaDescription,
        final_cta_primary: page.finalCtaPrimary,
        final_cta_secondary: page.finalCtaSecondary,
      },
      { onConflict: "id" }
    );

    throwIfError(error);
  }

  /* ------------------------------- Packages ------------------------------ */

  {
    const packageRows = db.packages.map((pkg) => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      billing_period: pkg.billingPeriod,
      badge: pkg.badge,
      popular: pkg.popular,
      visible: pkg.visible,
      sort_order: pkg.order,
      posts_per_month: pkg.postsPerMonth,
      reels_per_month: pkg.reelsPerMonth,
      stories_per_month: pkg.storiesPerMonth,
    }));

    if (packageRows.length) {
      const { error } = await client
        .from("social_packages")
        .upsert(packageRows, { onConflict: "id" });

      throwIfError(error);
    }

    const packageIds = packageRows.map((row) => row.id);

    if (packageIds.length) {
      const { error } = await client
        .from("social_package_features")
        .delete()
        .in("package_id", packageIds);

      throwIfError(error);

      const { error: platformDeleteError } = await client
        .from("social_package_platforms")
        .delete()
        .in("package_id", packageIds);

      throwIfError(platformDeleteError);
    }

    const featureRows = db.packages.flatMap((pkg) =>
      pkg.features.map((feature) => ({
        id: feature.id,
        package_id: pkg.id,
        text: feature.text,
        sort_order: feature.order,
      }))
    );

    if (featureRows.length) {
      const { error } = await client
        .from("social_package_features")
        .insert(featureRows);

      throwIfError(error);
    }

    const platformRows = db.packages.flatMap((pkg) =>
      pkg.platforms.map((platform) => ({
        package_id: pkg.id,
        platform_id: platform,
      }))
    );

    if (platformRows.length) {
      const { error } = await client
        .from("social_package_platforms")
        .insert(platformRows);

      throwIfError(error);
    }

    const { data: existingPackages, error: packageReadError } = await client
      .from("social_packages")
      .select("id");

    throwIfError(packageReadError);

    const obsoletePackages = (existingPackages ?? [])
      .map((row) => row.id)
      .filter((id) => !packageIds.includes(id));

    if (obsoletePackages.length) {
      const { error } = await client
        .from("social_packages")
        .delete()
        .in("id", obsoletePackages);

      throwIfError(error);
    }
  }

  /* ------------------------------ Social links ---------------------------- */

  {
    const rows = db.socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      name: link.name,
      username: link.username,
      description: link.description,
      url: link.url,
      active: link.active,
      sort_order: link.order,
    }));

    if (rows.length) {
      const { error } = await client
        .from("social_links")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* -------------------------------- FAQs --------------------------------- */

  {
    const rows = db.faqs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.order,
      visible: faq.visible,
    }));

    if (rows.length) {
      const { error } = await client
        .from("faqs")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* ------------------------------- Requests ------------------------------- */

  {
    const rows = db.requests.map((request) => ({
      id: request.id,
      type: request.type,
      full_name: request.fullName,
      email: request.email,
      whatsapp: request.whatsapp,
      company: request.company,
      selected_id: request.selectedId,
      selected_name: request.selectedName,
      selected_price: request.selectedPrice ?? null,
      description: request.description,
      additional: request.additional,
      platforms: request.platforms ?? [],
      goals: request.goals ?? null,
      brand_info: request.brandInfo ?? null,
      status: request.status,
      created_at: request.createdAt,
    }));

    if (rows.length) {
      const { error } = await client
        .from("service_requests")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* ------------------------------- Messages ------------------------------- */

  {
    const rows = db.messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      whatsapp: message.whatsapp,
      company: message.company,
      message: message.message,
      status: message.status,
      created_at: message.createdAt,
    }));

    if (rows.length) {
      const { error } = await client
        .from("contact_messages")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* -------------------------------- Clients -------------------------------- */

  {
    const packageBySlug = new Map(
      db.packages.map((pkg) => [pkg.slug, pkg.id])
    );

    const rows = db.clients.map((client) => ({
      id: client.id,
      name: client.name,
      industry: client.industry,
      package_id: packageBySlug.get(client.packageSlug) ?? null,
      platforms: client.platforms,
      since: client.since || null,
      status: client.status,
    }));

    if (rows.length) {
      const { error } = await client
        .from("social_clients")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* -------------------------------- Accounts -------------------------------- */

  {
    const clientByName = new Map(
      db.clients.map((item) => [item.name, item.id])
    );

    const rows = db.accounts.map((account) => ({
      id: account.id,
      client_id: clientByName.get(account.client) ?? null,
      platform: account.platform,
      handle: account.handle,
      connected: account.connected,
      note: account.note,
    }));

    if (rows.length) {
      const { error } = await client
        .from("social_accounts")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* --------------------------------- Posts --------------------------------- */

  {
    const clientByName = new Map(
      db.clients.map((item) => [item.name, item.id])
    );

    const rows = db.posts.map((post) => ({
      id: post.id,
      client_id: clientByName.get(post.client) ?? null,
      platform: post.platform,
      caption: post.caption,
      media_url: post.media,
      content_type: post.contentType,
      campaign: post.campaign,
      status: post.status,
      schedule_date: post.scheduleDate || null,
    }));

    if (rows.length) {
      const { error } = await client
        .from("social_posts")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* -------------------------------- Inbox --------------------------------- */

  {
    const rows = db.inbox.map((message) => ({
      id: message.id,
      platform: message.platform,
      author: message.author,
      handle: message.handle,
      body: message.body,
      category: message.category,
      unread: message.unread,
      suggested_reply: message.suggestedReply,
      created_at: message.createdAt,
    }));

    if (rows.length) {
      const { error } = await client
        .from("social_inbox")
        .upsert(rows, { onConflict: "id" });

      throwIfError(error);
    }
  }

  /* ------------------------------- Version -------------------------------- */

  {
    const { error } = await client.from("site_content").upsert(
      {
        key: "db_version",
        value: db.version,
      },
      { onConflict: "key" }
    );

    throwIfError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Sorting helper                                                             */
/* -------------------------------------------------------------------------- */

export const sortBy = <T,>(arr: T[], key: (t: T) => number) =>
  [...arr].sort((a, b) => key(a) - key(b));