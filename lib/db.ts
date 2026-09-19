import type {
  Db,
  SiteSettings,
  NavItem,
  Category,
  Automation,
  SocialPageContent,
  SocialPackage,
  PackageFeature,
  SocialLink,
  Faq,
  ServiceRequest,
  ContactMessage,
  SocialPost,
  InboxMessage,
  SocialClient,
  SocialAccount,
} from "./types";
import { seedDb } from "./seed";
import { supabase } from "./supabase";

/**
 * Supabase-backed database adapter.
 *
 * This keeps the same Db shape used by the application while storing
 * the actual data in the Supabase tables defined in supabase/schema.sql.
 *
 * IMPORTANT:
 * getDb() and mutateDb() are async because Supabase queries are async.
 */

function getClient() {
  const client = supabase();

  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return client;
}

function throwIfError(
  error: { message?: string } | null,
  operation: string
) {
  if (error) {
    throw new Error(`Supabase ${operation} failed: ${error.message}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function mapSiteSettings(row: any): SiteSettings {
  return {
    siteName: row.site_name,
    tagline: row.tagline ?? { en: "", fr: "", ar: "" },
    contactEmail: row.contact_email ?? "",
    whatsapp: row.whatsapp ?? "",
    address: row.address ?? { en: "", fr: "", ar: "" },
    footerNote: row.footer_note ?? { en: "", fr: "", ar: "" },
  };
}

function mapNavigation(row: any): NavItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    order: row.sort_order ?? 0,
    active: row.active ?? true,
  };
}

function mapCategory(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    order: row.sort_order ?? 0,
    active: row.active ?? true,
  };
}

function mapAutomation(
  row: any,
  categoryById: Map<string, string>
): Automation {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    short: row.short,
    description: row.description,
    category: row.category_id
      ? categoryById.get(row.category_id) ?? ""
      : "",
    icon: row.icon,
    benefits: row.benefits ?? [],
    workflow: row.workflow ?? [],
    integrations: row.integrations ?? [],
    order: row.sort_order ?? 0,
    active: row.active ?? true,
  };
}

function mapSocialPage(row: any): SocialPageContent {
  return {
    heroBadge: row?.hero_badge ?? { en: "", fr: "", ar: "" },
    heroTitle: row?.hero_title ?? { en: "", fr: "", ar: "" },
    heroDescription: row?.hero_description ?? { en: "", fr: "", ar: "" },
    primaryCta: row?.primary_cta ?? { en: "", fr: "", ar: "" },
    secondaryCta: row?.secondary_cta ?? { en: "", fr: "", ar: "" },

    servicesTitle: row?.services_title ?? { en: "", fr: "", ar: "" },
    servicesDescription:
      row?.services_description ?? { en: "", fr: "", ar: "" },
    services: row?.services ?? [],

    platformsTitle: row?.platforms_title ?? { en: "", fr: "", ar: "" },
    platformsDescription:
      row?.platforms_description ?? { en: "", fr: "", ar: "" },
    platforms: row?.platforms ?? [],

    packagesTitle: row?.packages_title ?? { en: "", fr: "", ar: "" },
    packagesDescription:
      row?.packages_description ?? { en: "", fr: "", ar: "" },

    processTitle: row?.process_title ?? { en: "", fr: "", ar: "" },
    processDescription:
      row?.process_description ?? { en: "", fr: "", ar: "" },
    processSteps: row?.process_steps ?? [],

    finalCtaTitle: row?.final_cta_title ?? { en: "", fr: "", ar: "" },
    finalCtaDescription:
      row?.final_cta_description ?? { en: "", fr: "", ar: "" },
    finalCtaPrimary:
      row?.final_cta_primary ?? { en: "", fr: "", ar: "" },
    finalCtaSecondary:
      row?.final_cta_secondary ?? { en: "", fr: "", ar: "" },
  };
}

function mapPackage(
  row: any,
  featuresByPackage: Map<string, PackageFeature[]>,
  platformsByPackage: Map<string, string[]>
): SocialPackage {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: Number(row.price ?? 0),
    currency: row.currency,
    billingPeriod: row.billing_period,
    badge: row.badge,
    popular: row.popular ?? false,
    visible: row.visible ?? true,
    order: row.sort_order ?? 0,

    features: featuresByPackage.get(row.id) ?? [],
    platforms: platformsByPackage.get(row.id) ?? [],

    postsPerMonth: row.posts_per_month ?? 0,
    reelsPerMonth: row.reels_per_month ?? 0,
    storiesPerMonth: row.stories_per_month ?? 0,
  };
}

function mapSocialLink(row: any): SocialLink {
  return {
    id: row.id,
    platform: row.platform,
    name: row.name,
    username: row.username ?? "",
    description: row.description ?? { en: "", fr: "", ar: "" },
    url: row.url,
    active: row.active ?? true,
    order: row.sort_order ?? 0,
  };
}

function mapFaq(row: any): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    order: row.sort_order ?? 0,
    visible: row.visible ?? true,
  };
}

function mapRequest(row: any): ServiceRequest {
  return {
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
  };
}

function mapMessage(row: any): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    whatsapp: row.whatsapp ?? "",
    company: row.company ?? "",
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapPost(
  row: any,
  clientNameById: Map<string, string>
): SocialPost {
  return {
    id: row.id,
    client: row.client_id
      ? clientNameById.get(row.client_id) ?? ""
      : "",
    platform: row.platform,
    caption: row.caption ?? "",
    media: row.media_url ?? "",
    contentType: row.content_type ?? "",
    campaign: row.campaign ?? "",
    status: row.status,
    scheduleDate: row.schedule_date
      ? String(row.schedule_date)
      : "",
  };
}

function mapInbox(
  row: any,
  _clientNameById: Map<string, string>
): InboxMessage {
  return {
    id: row.id,
    platform: row.platform,
    author: row.author ?? "",
    handle: row.handle ?? "",
    body: row.body,
    category: row.category,
    unread: row.unread ?? true,
    createdAt: row.created_at,
    suggestedReply: row.suggested_reply ?? "",
  };
}

function mapClient(
  row: any,
  packageSlugById: Map<string, string>
): SocialClient {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry ?? "",
    platforms: row.platforms ?? [],
    packageSlug: row.package_id
      ? packageSlugById.get(row.package_id) ?? ""
      : "",
    since: row.since ? String(row.since) : "",
    status: row.status,
  };
}

function mapAccount(
  row: any,
  clientNameById: Map<string, string>
): SocialAccount {
  return {
    id: row.id,
    platform: row.platform,
    handle: row.handle,
    client: row.client_id
      ? clientNameById.get(row.client_id) ?? ""
      : "",
    connected: row.connected ?? false,
    note: row.note ?? "",
  };
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
    featuresResult,
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
      .order("schedule_date", { ascending: true }),

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
      .select("*"),

    client
      .from("site_content")
      .select("value")
      .eq("key", "db_version")
      .maybeSingle(),
  ]);

  const results = [
    settingsResult,
    navigationResult,
    categoriesResult,
    automationsResult,
    socialPageResult,
    packagesResult,
    featuresResult,
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
  ];

  for (const result of results) {
    if (result.error) {
      throw new Error(`Supabase read failed: ${result.error.message}`);
    }
  }

  const settingsRow = settingsResult.data;
  const navigationRows = navigationResult.data ?? [];
  const categoryRows = categoriesResult.data ?? [];
  const automationRows = automationsResult.data ?? [];
  const socialPageRow = socialPageResult.data;
  const packageRows = packagesResult.data ?? [];
  const featureRows = featuresResult.data ?? [];
  const packagePlatformRows = packagePlatformsResult.data ?? [];
  const socialLinkRows = socialLinksResult.data ?? [];
  const faqRows = faqsResult.data ?? [];
  const requestRows = requestsResult.data ?? [];
  const messageRows = messagesResult.data ?? [];
  const postRows = postsResult.data ?? [];
  const inboxRows = inboxResult.data ?? [];
  const clientRows = clientsResult.data ?? [];
  const accountRows = accountsResult.data ?? [];

  /*
   * If the database is completely empty, initialize it from seedDb().
   *
   * This replaces the old local ensureSeed() behavior without creating
   * a db.json file.
   */
  const completelyEmpty =
    !settingsRow &&
    navigationRows.length === 0 &&
    categoryRows.length === 0 &&
    automationRows.length === 0 &&
    !socialPageRow &&
    packageRows.length === 0 &&
    socialLinkRows.length === 0 &&
    faqRows.length === 0 &&
    requestRows.length === 0 &&
    messageRows.length === 0 &&
    postRows.length === 0 &&
    inboxRows.length === 0 &&
    clientRows.length === 0 &&
    accountRows.length === 0;

  if (completelyEmpty) {
    const seeded = seedDb();
    await writeDb(seeded);
    return seeded;
  }

  const categoryById = new Map<string, string>(
    categoryRows.map((row: any) => [row.id, row.slug])
  );

  const featuresByPackage = new Map<string, PackageFeature[]>();

  for (const row of featureRows) {
    const feature: PackageFeature = {
      id: row.id,
      text: row.text,
      order: row.sort_order ?? 0,
    };

    const current = featuresByPackage.get(row.package_id) ?? [];
    current.push(feature);
    featuresByPackage.set(row.package_id, current);
  }

  const platformsByPackage = new Map<string, string[]>();

  for (const row of packagePlatformRows) {
    const current = platformsByPackage.get(row.package_id) ?? [];
    current.push(row.platform_id);
    platformsByPackage.set(row.package_id, current);
  }

  const packageSlugById = new Map<string, string>(
    packageRows.map((row: any) => [row.id, row.slug])
  );

  const clientNameById = new Map<string, string>(
    clientRows.map((row: any) => [row.id, row.name])
  );

  return {
    version: Number(versionResult.data?.value ?? 1),

    settings: settingsRow
      ? mapSiteSettings(settingsRow)
      : {
          siteName: "FLUXMEDIA",
          tagline: { en: "", fr: "", ar: "" },
          contactEmail: "",
          whatsapp: "",
          address: { en: "", fr: "", ar: "" },
          footerNote: { en: "", fr: "", ar: "" },
        },

    navigation: navigationRows.map(mapNavigation),

    categories: categoryRows.map(mapCategory),

    automations: automationRows.map((row: any) =>
      mapAutomation(row, categoryById)
    ),

    socialPage: socialPageRow
      ? mapSocialPage(socialPageRow)
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
        },

    packages: packageRows.map((row: any) =>
      mapPackage(row, featuresByPackage, platformsByPackage)
    ),

    socialLinks: socialLinkRows.map(mapSocialLink),

    faqs: faqRows.map(mapFaq),

    requests: requestRows.map(mapRequest),

    messages: messageRows.map(mapMessage),

    posts: postRows.map((row: any) =>
      mapPost(row, clientNameById)
    ),

    inbox: inboxRows.map((row: any) =>
      mapInbox(row, clientNameById)
    ),

    clients: clientRows.map((row: any) =>
      mapClient(row, packageSlugById)
    ),

    accounts: accountRows.map((row: any) =>
      mapAccount(row, clientNameById)
    ),
  };
}

/* -------------------------------------------------------------------------- */
/* Write helpers                                                              */
/* -------------------------------------------------------------------------- */

async function syncSiteSettings(db: Db) {
  const client = getClient();

  const { error } = await client.from("site_settings").upsert({
    id: 1,
    site_name: db.settings.siteName,
    tagline: db.settings.tagline,
    contact_email: db.settings.contactEmail,
    whatsapp: db.settings.whatsapp,
    address: db.settings.address,
    footer_note: db.settings.footerNote,
    updated_at: new Date().toISOString(),
  });

  throwIfError(error, "updating site settings");
}

async function syncNavigation(db: Db) {
  const client = getClient();

  const rows = db.navigation.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    sort_order: item.order,
    active: item.active,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("navigation_items")
      .upsert(rows);

    throwIfError(error, "updating navigation");
  }

  const ids = db.navigation.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("navigation_items")
    .select("id");

  throwIfError(readError, "reading navigation");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("navigation_items")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting navigation");
  }
}

async function syncCategories(db: Db) {
  const client = getClient();

  const rows = db.categories.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    sort_order: item.order,
    active: item.active,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("automation_categories")
      .upsert(rows);

    throwIfError(error, "updating categories");
  }

  const ids = db.categories.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("automation_categories")
    .select("id");

  throwIfError(readError, "reading categories");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("automation_categories")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting categories");
  }
}

async function syncAutomations(db: Db) {
  const client = getClient();

  const categoryBySlug = new Map(
    db.categories.map((category) => [
      category.slug,
      category.id,
    ])
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
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("automations")
      .upsert(rows);

    throwIfError(error, "updating automations");
  }

  const ids = db.automations.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("automations")
    .select("id");

  throwIfError(readError, "reading automations");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("automations")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting automations");
  }
}

async function syncSocialPage(db: Db) {
  const client = getClient();

  const page = db.socialPage;

  const { error } = await client
    .from("social_page_content")
    .upsert({
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
      updated_at: new Date().toISOString(),
    });

  throwIfError(error, "updating social page");
}

async function syncPackages(db: Db) {
  const client = getClient();

  const packageRows = db.packages.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    price: item.price,
    currency: item.currency,
    billing_period: item.billingPeriod,
    badge: item.badge,
    popular: item.popular,
    visible: item.visible,
    sort_order: item.order,
    posts_per_month: item.postsPerMonth,
    reels_per_month: item.reelsPerMonth,
    stories_per_month: item.storiesPerMonth,
    updated_at: new Date().toISOString(),
  }));

  if (packageRows.length > 0) {
    const { error } = await client
      .from("social_packages")
      .upsert(packageRows);

    throwIfError(error, "updating packages");
  }

  /*
   * Features and platforms are child records.
   * Rebuild them from the Db representation.
   */

  const { error: deleteFeaturesError } = await client
    .from("social_package_features")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  throwIfError(deleteFeaturesError, "clearing package features");

  const featureRows = db.packages.flatMap((pkg) =>
    pkg.features.map((feature) => ({
      id: feature.id,
      package_id: pkg.id,
      text: feature.text,
      sort_order: feature.order,
    }))
  );

  if (featureRows.length > 0) {
    const { error } = await client
      .from("social_package_features")
      .upsert(featureRows);

    throwIfError(error, "updating package features");
  }

  const { error: deletePlatformsError } = await client
    .from("social_package_platforms")
    .delete()
    .neq("package_id", "00000000-0000-0000-0000-000000000000");

  throwIfError(
    deletePlatformsError,
    "clearing package platforms"
  );

  const platformRows = db.packages.flatMap((pkg) =>
    pkg.platforms.map((platformId) => ({
      package_id: pkg.id,
      platform_id: platformId,
    }))
  );

  if (platformRows.length > 0) {
    const { error } = await client
      .from("social_package_platforms")
      .upsert(platformRows);

    throwIfError(error, "updating package platforms");
  }

  const packageIds = db.packages.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_packages")
    .select("id");

  throwIfError(readError, "reading packages");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !packageIds.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_packages")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting packages");
  }
}

async function syncSocialLinks(db: Db) {
  const client = getClient();

  const rows = db.socialLinks.map((item) => ({
    id: item.id,
    platform: item.platform,
    name: item.name,
    username: item.username,
    description: item.description,
    url: item.url,
    active: item.active,
    sort_order: item.order,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("social_links")
      .upsert(rows);

    throwIfError(error, "updating social links");
  }

  const ids = db.socialLinks.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_links")
    .select("id");

  throwIfError(readError, "reading social links");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_links")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting social links");
  }
}

async function syncFaqs(db: Db) {
  const client = getClient();

  const rows = db.faqs.map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    sort_order: item.order,
    visible: item.visible,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("faqs")
      .upsert(rows);

    throwIfError(error, "updating FAQs");
  }

  const ids = db.faqs.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("faqs")
    .select("id");

  throwIfError(readError, "reading FAQs");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("faqs")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting FAQs");
  }
}

async function syncRequests(db: Db) {
  const client = getClient();

  const rows = db.requests.map((item) => ({
    id: item.id,
    type: item.type,
    full_name: item.fullName,
    email: item.email,
    whatsapp: item.whatsapp,
    company: item.company,
    selected_id: item.selectedId,
    selected_name: item.selectedName,
    selected_price: item.selectedPrice ?? null,
    description: item.description,
    additional: item.additional,
    platforms: item.platforms ?? [],
    goals: item.goals ?? null,
    brand_info: item.brandInfo ?? null,
    status: item.status,
    created_at: item.createdAt,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("service_requests")
      .upsert(rows);

    throwIfError(error, "updating service requests");
  }

  const ids = db.requests.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("service_requests")
    .select("id");

  throwIfError(readError, "reading service requests");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("service_requests")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting service requests");
  }
}

async function syncMessages(db: Db) {
  const client = getClient();

  const rows = db.messages.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    whatsapp: item.whatsapp,
    company: item.company,
    message: item.message,
    status: item.status,
    created_at: item.createdAt,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("contact_messages")
      .upsert(rows);

    throwIfError(error, "updating contact messages");
  }

  const ids = db.messages.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("contact_messages")
    .select("id");

  throwIfError(readError, "reading contact messages");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("contact_messages")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting contact messages");
  }
}

async function syncClients(db: Db) {
  const client = getClient();

  const packageBySlug = new Map(
    db.packages.map((pkg) => [pkg.slug, pkg.id])
  );

  const rows = db.clients.map((item) => ({
    id: item.id,
    name: item.name,
    industry: item.industry,
    package_id: packageBySlug.get(item.packageSlug) ?? null,
    platforms: item.platforms,
    since: item.since || null,
    status: item.status,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("social_clients")
      .upsert(rows);

    throwIfError(error, "updating clients");
  }

  const ids = db.clients.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_clients")
    .select("id");

  throwIfError(readError, "reading clients");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_clients")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting clients");
  }
}

async function syncAccounts(db: Db) {
  const client = getClient();

  const clientByName = new Map(
    db.clients.map((item) => [item.name, item.id])
  );

  const rows = db.accounts.map((item) => ({
    id: item.id,
    client_id: clientByName.get(item.client) ?? null,
    platform: item.platform,
    handle: item.handle,
    connected: item.connected,
    note: item.note,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("social_accounts")
      .upsert(rows);

    throwIfError(error, "updating social accounts");
  }

  const ids = db.accounts.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_accounts")
    .select("id");

  throwIfError(readError, "reading social accounts");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_accounts")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting social accounts");
  }
}

async function syncPosts(db: Db) {
  const client = getClient();

  const clientByName = new Map(
    db.clients.map((item) => [item.name, item.id])
  );

  const rows = db.posts.map((item) => ({
    id: item.id,
    client_id: clientByName.get(item.client) ?? null,
    platform: item.platform,
    caption: item.caption,
    media_url: item.media,
    content_type: item.contentType,
    campaign: item.campaign,
    status: item.status,
    schedule_date: item.scheduleDate || null,
  }));

  if (rows.length > 0) {
    const { error } = await client
      .from("social_posts")
      .upsert(rows);

    throwIfError(error, "updating social posts");
  }

  const ids = db.posts.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_posts")
    .select("id");

  throwIfError(readError, "reading social posts");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_posts")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting social posts");
  }
}

async function syncInbox(db: Db) {
  const client = getClient();

  const clientByName = new Map(
    db.clients.map((item) => [item.name, item.id])
  );

  /*
   * InboxMessage does not have a client field in the TypeScript contract,
   * so client_id is intentionally left null.
   */

  const rows = db.inbox.map((item) => ({
    id: item.id,
    client_id: null,
    platform: item.platform,
    author: item.author,
    handle: item.handle,
    body: item.body,
    category: item.category,
    unread: item.unread,
    suggested_reply: item.suggestedReply,
    created_at: item.createdAt,
  }));

  void clientByName;

  if (rows.length > 0) {
    const { error } = await client
      .from("social_inbox")
      .upsert(rows);

    throwIfError(error, "updating social inbox");
  }

  const ids = db.inbox.map((item) => item.id);

  const { data: existing, error: readError } = await client
    .from("social_inbox")
    .select("id");

  throwIfError(readError, "reading social inbox");

  const toDelete = (existing ?? [])
    .map((row: any) => row.id)
    .filter((id: string) => !ids.includes(id));

  if (toDelete.length > 0) {
    const { error } = await client
      .from("social_inbox")
      .delete()
      .in("id", toDelete);

    throwIfError(error, "deleting social inbox");
  }
}

/* -------------------------------------------------------------------------- */
/* Full write                                                                 */
/* -------------------------------------------------------------------------- */

async function writeDb(db: Db): Promise<void> {
  /*
   * Parent tables must be synchronized before child tables because
   * Supabase foreign keys depend on them.
   */

  await syncSiteSettings(db);

  await syncCategories(db);
  await syncAutomations(db);

  await syncNavigation();

  await syncSocialPage(db);

  await syncPackages(db);

  await syncSocialLinks(db);
  await syncFaqs(db);

  /*
   * These are independent data collections.
   */

  await syncRequests(db);
  await syncMessages(db);

  await syncClients(db);
  await syncAccounts(db);
  await syncPosts(db);
  await syncInbox(db);

  /*
   * Store the Db version in site_content because the schema doesn't
   * have a dedicated version column.
   */

  const client = getClient();

  const { error } = await client.from("site_content").upsert({
    key: "db_version",
    value: db.version,
    updated_at: new Date().toISOString(),
  });

  throwIfError(error, "updating database version");
}

/* -------------------------------------------------------------------------- */
/* Mutation                                                                   */
/* -------------------------------------------------------------------------- */

export async function mutateDb<T>(
  fn: (db: Db) => T | Promise<T>
): Promise<T> {
  const db = await getDb();

  /*
   * Work on a deep copy so a failed mutation doesn't modify the
   * object returned by getDb() in memory.
   */
  const workingDb = structuredClone(db);

  const result = await fn(workingDb);

  await writeDb(workingDb);

  return result;
}

/* -------------------------------------------------------------------------- */
/* Sorting helper                                                             */
/* -------------------------------------------------------------------------- */

export const sortBy = <T,>(
  arr: T[],
  key: (t: T) => number
) => [...arr].sort((a, b) => key(a) - key(b));
