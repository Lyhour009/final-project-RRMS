import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local", override: false });

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const url = required("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = required("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceKey = required("SUPABASE_SERVICE_ROLE_KEY");
const tenantEmail = required("DEPLOYMENT_TEST_TENANT_EMAIL");
const tenantPassword = required("DEPLOYMENT_TEST_TENANT_PASSWORD");

const tenantClient = createClient(url, anonKey, { auth: { persistSession: false } });
const adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });

async function verify() {
  const { data: signedIn, error: signInError } = await tenantClient.auth.signInWithPassword({
    email: tenantEmail,
    password: tenantPassword,
  });
  if (signInError || !signedIn.user) throw new Error(`Test tenant login failed: ${signInError?.message}`);

  const tenantId = signedIn.user.id;
  const { data: ownProfile, error: ownError } = await tenantClient
    .from("profiles")
    .select("id, role")
    .eq("id", tenantId)
    .single();
  if (ownError || ownProfile?.role !== "tenant") throw new Error("Test account is not a valid tenant");

  const { data: anotherTenant, error: lookupError } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "tenant")
    .neq("id", tenantId)
    .limit(1)
    .maybeSingle();
  if (lookupError) throw new Error(`Could not inspect tenant isolation: ${lookupError.message}`);

  if (anotherTenant) {
    const { data: forbiddenProfile, error: isolationError } = await tenantClient
      .from("profiles")
      .select("id")
      .eq("id", anotherTenant.id);
    if (isolationError) throw new Error(`Isolation query failed unexpectedly: ${isolationError.message}`);
    if (forbiddenProfile?.length) throw new Error("RLS FAILURE: tenant can read another tenant profile");
  }

  const { error: promotionError } = await tenantClient
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", tenantId);
  if (!promotionError) throw new Error("RLS FAILURE: tenant role promotion was accepted");

  const { data: verifiedRole } = await adminClient.from("profiles").select("role").eq("id", tenantId).single();
  if (verifiedRole?.role !== "tenant") throw new Error("RLS FAILURE: tenant role changed");

  const expectedBuckets = new Map([
    ["room-images", true],
    ["tenants", false],
    ["payment-proofs", false],
  ]);
  for (const [bucketId, expectedPublic] of expectedBuckets) {
    const { data: bucket, error } = await adminClient.storage.getBucket(bucketId);
    if (error || !bucket) throw new Error(`Missing storage bucket ${bucketId}`);
    if (bucket.public !== expectedPublic) throw new Error(`${bucketId} public setting is incorrect`);
    if (bucket.file_size_limit !== 5_242_880) throw new Error(`${bucketId} must have a 5MB file limit`);
  }

  const { data: auditRows, error: auditError } = await tenantClient.from("audit_logs").select("id").limit(1);
  if (!auditError && auditRows?.length) throw new Error("RLS FAILURE: tenant can read audit logs");

  await tenantClient.auth.signOut();
  console.log("Production verification passed: auth, tenant isolation, role protection, storage, and audit RLS.");
}

verify().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
