import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();

function loadEnvFile() {
  const envPath = path.join(root, ".env.local");

  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local was not found.");
  }

  const content = fs.readFileSync(envPath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const match = trimmed.match(/^([^=]+)=(.*)$/);

    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is missing.");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const dbPath = path.join(root, "data", "db.json");

if (!fs.existsSync(dbPath)) {
  throw new Error(`Database file not found: ${dbPath}`);
}

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

async function insert(table, rows) {
  if (!rows || rows.length === 0) {
    console.log(`- ${table}: nothing to migrate`);
    return [];
  }

  const { data, error } = await supabase
    .from(table)
    .insert(rows)
    .select();

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`✓ ${table}: ${data.length} row(s)`);
  return data;
}

async function insertOne(table, row) {
  const { data, error } = await supabase
    .from(table)
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }

  console.log(`✓ ${table}: inserted`);
  return data;
}

async function migrate() {
  console.log("");
  console.log("======================================");
  console.log(" FLUXMEDIA → SUPABASE MIGRATION");
  console.log("======================================");
  console.log("");

  // ---------------------------------------------------------
  // 1. Site settings
  // ---------------------------------------------------------

  await supabase.from("site_settings").delete().neq("id", 0);

  await insertOne("site_settings", {
    id: 1,
    site_name: db.settings.siteName,
    tagline: db.settings.tagline,
    contact_email: db.settings.contactEmail,
    whatsapp: db.settings.whatsapp,
    address: db.settings.address,
    footer_note: db.settings.footerNote,
  });

  // ---------------------------------------------------------
  // 2. Navigation
  // ---------------------------------------------------------

  await supabase.from("navigation_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const navigationRows = db.navigation.map((item) => ({
    label: item.label,
    href: item.href,
    sort_order: item.order,
    active: item.active,
  }));

  const navigation = await insert("navigation_items", navigationRows);

  // ---------------------------------------------------------
  // 3. Categories
  // ---------------------------------------------------------

  await supabase.from("automation_categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const categoryRows = db.categories.map((item) => ({
    slug: item.slug,
    name: item.name,
    sort_order: item.order,
    active: item.active,
  }));

  const categories = await insert("automation_categories", categoryRows);

  const categoryMap = new Map();

  for (let i = 0; i < db.categories.length; i++) {
    categoryMap.set(
      db.categories[i].slug,
      categories[i].id
    );
  }

  // ---------------------------------------------------------
  // 4. Automations
  // ---------------------------------------------------------

  await supabase.from("automations").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const automationRows = db.automations.map((item) => ({
    slug: item.slug,
    category_id: categoryMap.get(item.category) || null,
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

  await insert("automations", automationRows);

  // ---------------------------------------------------------
  // 5. Social page content
  // ---------------------------------------------------------

  await supabase.from("social_page_content").delete().neq("id", 0);

  await insertOne("social_page_content", {
    id: 1,
    hero_badge: db.socialPage.heroBadge,
    hero_title: db.socialPage.heroTitle,
    hero_description: db.socialPage.heroDescription,
    primary_cta: db.socialPage.primaryCta,
    secondary_cta: db.socialPage.secondaryCta,
    services_title: db.socialPage.servicesTitle,
    services_description: db.socialPage.servicesDescription,
    services: db.socialPage.services,
    platforms_title: db.socialPage.platformsTitle,
    platforms_description: db.socialPage.platformsDescription,
    platforms: db.socialPage.platforms,
    packages_title: db.socialPage.packagesTitle,
    packages_description: db.socialPage.packagesDescription,
    process_title: db.socialPage.processTitle,
    process_description: db.socialPage.processDescription,
    process_steps: db.socialPage.processSteps,
    final_cta_title: db.socialPage.finalCtaTitle,
    final_cta_description: db.socialPage.finalCtaDescription,
    final_cta_primary: db.socialPage.finalCtaPrimary,
    final_cta_secondary: db.socialPage.finalCtaSecondary,
  });

  // ---------------------------------------------------------
  // 6. Social packages
  // ---------------------------------------------------------

  await supabase
    .from("social_package_platforms")
    .delete()
    .neq("package_id", "00000000-0000-0000-0000-000000000000");

  await supabase
    .from("social_package_features")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  await supabase
    .from("social_packages")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const packageRows = db.packages.map((item) => ({
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
  }));

  const packages = await insert("social_packages", packageRows);

  const packageMap = new Map();

  for (let i = 0; i < db.packages.length; i++) {
    packageMap.set(
      db.packages[i].slug,
      packages[i].id
    );
  }

  // Package features
  const featureRows = [];

  for (let i = 0; i < db.packages.length; i++) {
    const oldPackage = db.packages[i];
    const newPackageId = packages[i].id;

    for (const feature of oldPackage.features || []) {
      featureRows.push({
        package_id: newPackageId,
        text: feature.text,
        sort_order: feature.order,
      });
    }
  }

  await insert("social_package_features", featureRows);

  // Package platforms
  const packagePlatformRows = [];

  for (const oldPackage of db.packages) {
    const packageId = packageMap.get(oldPackage.slug);

    for (const platformId of oldPackage.platforms || []) {
      packagePlatformRows.push({
        package_id: packageId,
        platform_id: platformId,
      });
    }
  }

  await insert(
    "social_package_platforms",
    packagePlatformRows
  );

  // ---------------------------------------------------------
  // 7. Social links
  // ---------------------------------------------------------

  await supabase
    .from("social_links")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const socialLinkRows = db.socialLinks.map((item) => ({
    platform: item.platform,
    name: item.name,
    username: item.username,
    description: item.description,
    url: item.url,
    active: item.active,
    sort_order: item.order,
  }));

  await insert("social_links", socialLinkRows);

  // ---------------------------------------------------------
  // 8. FAQs
  // ---------------------------------------------------------

  await supabase
    .from("faqs")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const faqRows = db.faqs.map((item) => ({
    scope: "social-media",
    question: item.question,
    answer: item.answer,
    sort_order: item.order,
    visible: item.visible,
  }));

  await insert("faqs", faqRows);

  // ---------------------------------------------------------
  // 9. Service requests
  // ---------------------------------------------------------

  if (db.requests?.length) {
    const requestRows = db.requests.map((item) => ({
      type: item.type,
      full_name: item.fullName,
      email: item.email,
      whatsapp: item.whatsapp,
      company: item.company || null,
      selected_id: item.selectedId,
      selected_name: item.selectedName,
      selected_price: item.selectedPrice || null,
      description: item.description,
      additional: item.additional || null,
      platforms: item.platforms || [],
      goals: item.goals || null,
      brand_info: item.brandInfo || null,
      status: item.status,
      created_at: item.createdAt,
    }));

    await insert("service_requests", requestRows);
  } else {
    console.log("- service_requests: empty");
  }

  // ---------------------------------------------------------
  // 10. Contact messages
  // ---------------------------------------------------------

  if (db.messages?.length) {
    const messageRows = db.messages.map((item) => ({
      name: item.name,
      email: item.email,
      whatsapp: item.whatsapp || null,
      company: item.company || null,
      message: item.message,
      status: item.status,
      created_at: item.createdAt,
    }));

    await insert("contact_messages", messageRows);
  } else {
    console.log("- contact_messages: empty");
  }

  // ---------------------------------------------------------
  // 11. Social clients
  // ---------------------------------------------------------

  await supabase
    .from("social_accounts")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  await supabase
    .from("social_clients")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const clientRows = db.clients.map((item) => ({
    name: item.name,
    industry: item.industry,
    package_id: packageMap.get(item.packageSlug) || null,
    platforms: item.platforms || [],
    since: item.since
      ? `${item.since}-01`
      : null,
    status: item.status,
  }));

  const clients = await insert("social_clients", clientRows);

  const clientMap = new Map();

  for (let i = 0; i < db.clients.length; i++) {
    clientMap.set(
      db.clients[i].name,
      clients[i].id
    );
  }

  // ---------------------------------------------------------
  // 12. Social accounts
  // ---------------------------------------------------------

  const accountRows = db.accounts.map((item) => ({
    platform: item.platform,
    handle: item.handle,
    client_id: clientMap.get(item.client) || null,
    connected: item.connected,
    note: item.note || null,
  }));

  await insert("social_accounts", accountRows);

  // ---------------------------------------------------------
  // 13. Social posts
  // ---------------------------------------------------------

  await supabase
    .from("social_posts")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const postRows = db.posts.map((item) => ({
    client_id: clientMap.get(item.client) || null,
    platform: item.platform,
    caption: item.caption || null,
    media_url: item.media || null,
    content_type: item.contentType || null,
    campaign: item.campaign || null,
    status: item.status,
    schedule_date: item.scheduleDate || null,
  }));

  await insert("social_posts", postRows);

  // ---------------------------------------------------------
  // 14. Social inbox
  // ---------------------------------------------------------

  await supabase
    .from("social_inbox")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  const inboxRows = db.inbox.map((item) => ({
    client_id: null,
    platform: item.platform,
    author: item.author || null,
    handle: item.handle || null,
    body: item.body,
    category: item.category,
    unread: item.unread,
    suggested_reply: item.suggestedReply || null,
    created_at: item.createdAt,
  }));

  await insert("social_inbox", inboxRows);

  console.log("");
  console.log("======================================");
  console.log(" MIGRATION COMPLETE");
  console.log("======================================");
  console.log("");
}

migrate().catch((error) => {
  console.error("");
  console.error("❌ MIGRATION FAILED");
  console.error("");
  console.error(error);
  process.exit(1);
});