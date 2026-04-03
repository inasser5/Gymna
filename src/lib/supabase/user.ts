import { cache } from "react";
import { createClient } from "./server";

// Deduplicates getUser() calls within the same request —
// layout + page both call this but Supabase is only hit once.
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});
