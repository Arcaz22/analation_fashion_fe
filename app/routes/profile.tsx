import { AppShell } from "~/components/layouts/AppShell";
import { ProfileCard } from "~/components/shared/ProfileCard";
import { useUserProfile, useUserProfileStats } from "~/hooks/useProfile";

export default function ProfilePage() {
  const profileQuery = useUserProfile();
  const statsQuery = useUserProfileStats();
  const profile = profileQuery.data?.data;
  const stats = statsQuery.data?.data;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">
        <section className="mb-8 border-b border-[#E8E8E4] pb-8">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#747878]">
            User Profile
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-[#1c1b1b]">
            {profile?.name ?? "WARDROBE User"}
          </h1>
          <p className="mt-2 text-sm text-[#747878]">
            {profile?.email ?? "Mengambil data profile..."}
          </p>
          {profile?.member_since ? (
            <p className="mt-1 text-xs text-[#747878]">
              Member sejak {formatMemberSince(profile.member_since)}
            </p>
          ) : null}
        </section>

        {profileQuery.isLoading ? (
          <ProfileSkeleton />
        ) : profileQuery.error || !profile ? (
          <ProfileError />
        ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-8">
            <ProfileCard profile={profile} />

            <AppearanceDetails profile={profile} />
          </section>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <ProfileStat
              label="Total Item"
              value={statsQuery.isLoading ? "..." : String(stats?.total_items ?? 0)}
            />
            <ProfileStat
              label="Rekomendasi"
              value={
                statsQuery.isLoading
                  ? "..."
                  : String(stats?.total_recommendations ?? 0)
              }
            />
            <ProfileStat
              label="Favorites"
              value={
                statsQuery.isLoading ? "..." : String(stats?.total_favorites ?? 0)
              }
            />
            <ProfileStat
              label="Hari Aktif"
              value={statsQuery.isLoading ? "..." : String(stats?.active_days ?? 0)}
            />
            <ProfileStat
              label="Status Profile"
              value={profile.profile_completed ? "Lengkap" : "Belum lengkap"}
            />
          </aside>
        </div>
        )}
      </main>
    </AppShell>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <section className="border border-[#E8E8E4] bg-white p-5">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
        {label}
      </p>
      <p className="text-2xl font-semibold text-[#1c1b1b]">{value}</p>
    </section>
  );
}

function AppearanceDetails({
  profile,
}: {
  profile: NonNullable<ReturnType<typeof useUserProfile>["data"]>["data"];
}) {
  const skinTone = profile.skin_tone;
  const bodyShape = profile.body_shape;

  return (
    <section className="grid gap-5 md:grid-cols-2">
      <article className="border border-[#E8E8E4] bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          Detail Skin Tone
        </p>
        {skinTone ? (
          <div>
            <div className="mb-5 flex items-center gap-4">
              <div
                className="size-16 border border-[#C4C7C7]"
                style={{ backgroundColor: skinTone.skin_hex }}
              />
              <div>
                <p className="text-lg font-semibold text-[#1c1b1b]">
                  {skinTone.tone_label} / {skinTone.undertone}
                </p>
                <p className="text-sm text-[#747878]">
                  Area sampel: {skinTone.sample_area}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ProfileMetric label="LAB L" value={skinTone.lab_l.toFixed(1)} />
              <ProfileMetric label="LAB A" value={skinTone.lab_a.toFixed(1)} />
              <ProfileMetric label="LAB B" value={skinTone.lab_b.toFixed(1)} />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[#747878]">
            Skin tone belum tersedia. Lengkapi onboarding untuk mendapatkan rekomendasi warna.
          </p>
        )}
      </article>

      <article className="border border-[#E8E8E4] bg-white p-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          Detail Body Shape
        </p>
        {bodyShape ? (
          <div>
            <p className="mb-2 text-lg font-semibold text-[#1c1b1b]">
              {bodyShape.shape_label}
            </p>
            <p className="mb-5 text-sm leading-relaxed text-[#747878]">
              {bodyShape.description}
            </p>
            <div className="grid gap-3">
              <ProfileMetric
                label="Shoulder / Hip"
                value={bodyShape.shoulder_to_hip_ratio.toFixed(2)}
              />
              <ProfileMetric
                label="Waist / Shoulder"
                value={bodyShape.waist_to_shoulder_ratio.toFixed(2)}
              />
              <ProfileMetric
                label="Waist / Hip"
                value={bodyShape.waist_to_hip_ratio.toFixed(2)}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-[#747878]">
            Body shape belum tersedia. Lengkapi onboarding untuk mendapatkan rekomendasi siluet.
          </p>
        )}
      </article>
    </section>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FAFAF8] p-3">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
        {label}
      </p>
      <p className="text-sm font-semibold text-[#1c1b1b]">{value}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="space-y-5">
        <div className="h-56 animate-pulse bg-white" />
        <div className="h-64 animate-pulse bg-white" />
      </div>
      <div className="space-y-4">
        <div className="h-24 animate-pulse bg-white" />
        <div className="h-24 animate-pulse bg-white" />
        <div className="h-24 animate-pulse bg-white" />
      </div>
    </div>
  );
}

function ProfileError() {
  return (
    <section className="border border-[#E8E8E4] bg-white p-6">
      <p className="mb-2 text-lg font-semibold text-[#1c1b1b]">
        Profile tidak bisa dimuat.
      </p>
      <p className="text-sm leading-relaxed text-[#747878]">
        Pastikan sesi login masih aktif lalu coba buka halaman ini lagi.
      </p>
    </section>
  );
}

function formatMemberSince(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
