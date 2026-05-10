import type { SupabaseClient } from "@supabase/supabase-js";

type OwnedBullet = {
  id: string;
  experience_id: string;
  content?: string;
  experiences?: {
    title?: string | null;
    company?: string | null;
  };
};

type OwnedBulletResult = Omit<OwnedBullet, "experiences"> & {
  experiences?: OwnedBullet["experiences"] | OwnedBullet["experiences"][];
};

export async function getOwnedProfileId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function getOwnedExperienceId(
  supabase: SupabaseClient,
  userId: string,
  experienceId: string
): Promise<string | null> {
  const profileId = await getOwnedProfileId(supabase, userId);

  if (!profileId) {
    return null;
  }

  const { data, error } = await supabase
    .from("experiences")
    .select("id")
    .eq("id", experienceId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id ?? null;
}

export async function getOwnedBullet(
  supabase: SupabaseClient,
  userId: string,
  bulletId: string
): Promise<OwnedBullet | null> {
  const profileId = await getOwnedProfileId(supabase, userId);

  if (!profileId) {
    return null;
  }

  const { data: experiences, error: experiencesError } = await supabase
    .from("experiences")
    .select("id")
    .eq("profile_id", profileId);

  if (experiencesError) {
    throw experiencesError;
  }

  const experienceIds = (experiences || []).map((experience: { id: string }) => experience.id);

  if (experienceIds.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("bullets")
    .select("id, experience_id, content, experiences!inner(title, company)")
    .eq("id", bulletId)
    .in("experience_id", experienceIds)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as OwnedBulletResult;
  const experience = Array.isArray(row.experiences) ? row.experiences[0] : row.experiences;

  return {
    id: row.id,
    experience_id: row.experience_id,
    content: row.content,
    experiences: experience,
  };
}
