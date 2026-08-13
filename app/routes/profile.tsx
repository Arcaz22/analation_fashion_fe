import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiEye,
  FiSave,
  FiX,
} from "react-icons/fi";
import { Link } from "react-router";

import { AppShell } from "~/components/layouts/AppShell";
import { ProfileCard } from "~/components/shared/ProfileCard";
import { useOutfitHistory } from "~/hooks/useOutfit";
import {
  useUpdateUserProfile,
  useUserProfile,
  useUserProfileStats,
} from "~/hooks/useProfile";

export default function ProfilePage() {
  const profileQuery = useUserProfile();
  const statsQuery = useUserProfileStats();
  const historyQuery = useOutfitHistory(20);
  const updateProfile = useUpdateUserProfile();
  const profile = profileQuery.data?.data;
  const stats = statsQuery.data?.data;
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile?.name]);

  async function handleProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = name.trim();
    if (!nextName) return;

    await updateProfile.mutateAsync({ name: nextName });
    setEditing(false);
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 py-7 md:px-10 md:py-10">
        <section className="mb-6 border-b border-[#E8E8E4] pb-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#747878]">
            User Profile
          </p>
          {editing && profile ? (
            <form
              className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row"
              onSubmit={handleProfileUpdate}
            >
              <input
                className="h-12 flex-1 border border-[#E8E8E4] bg-white px-4 text-sm text-[#1c1b1b] outline-none focus:border-[#1c1b1b]"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <button
                className="h-12 bg-[#1c1b1b] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={updateProfile.isPending}
                type="submit"
              >
                {!updateProfile.isPending ? (
                  <FiSave className="mr-2 inline size-4" aria-hidden="true" />
                ) : null}
                {updateProfile.isPending ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                className="h-12 border border-[#E8E8E4] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]"
                type="button"
                onClick={() => {
                  setName(profile.name);
                  setEditing(false);
                }}
              >
                <FiX className="mr-2 inline size-4" aria-hidden="true" />
                Batal
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-3xl font-semibold leading-tight text-[#1c1b1b]">
                {profile?.name ?? "MATCH User"}
              </h1>
              {profile ? (
                <button
                  className="h-9 border border-[#E8E8E4] px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                  type="button"
                  onClick={() => setEditing(true)}
                >
                  <FiEdit2 className="mr-2 inline size-4" aria-hidden="true" />
                  Edit
                </button>
              ) : null}
            </div>
          )}
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
          <div className="space-y-6">
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <ProfileStat
                label="Total Item"
                value={
                  statsQuery.isLoading ? "..." : String(stats?.total_items ?? 0)
                }
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
                  statsQuery.isLoading
                    ? "..."
                    : String(stats?.total_favorites ?? 0)
                }
              />
              <ProfileStat
                label="Hari Aktif"
                value={
                  statsQuery.isLoading ? "..." : String(stats?.active_days ?? 0)
                }
              />
              <ProfileStat
                label="Status Profile"
                value={profile.profile_completed ? "Lengkap" : "Belum lengkap"}
              />
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="space-y-6">
                <ProfileCard profile={profile} />
                <AppearanceDetails profile={profile} />
              </section>

              <aside className="lg:sticky lg:top-28 lg:self-start">
                <RecommendationHistory
                  isError={historyQuery.isError}
                  isLoading={historyQuery.isLoading}
                  items={historyQuery.data?.data ?? []}
                />
              </aside>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}

type HistoryItem = NonNullable<
  ReturnType<typeof useOutfitHistory>["data"]
>["data"][number];

function RecommendationHistory({
  isError,
  isLoading,
  items,
}: {
  isError: boolean;
  isLoading: boolean;
  items: HistoryItem[];
}) {
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const visibleItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page]
  );

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  return (
    <section className="border border-[#E8E8E4] bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          Riwayat Rekomendasi
        </p>
        <span className="text-xs text-[#747878]">
          {items.length} item
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-16 animate-pulse bg-[#FAFAF8]" />
          <div className="h-16 animate-pulse bg-[#FAFAF8]" />
        </div>
      ) : isError ? (
        <p className="text-sm text-[#747878]">
          Riwayat rekomendasi belum bisa dimuat.
        </p>
      ) : items.length ? (
        <>
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <article className="border border-[#E8E8E4] p-3" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1c1b1b]">
                      {formatOccasion(item.occasion)}
                    </p>
                    <p className="mt-1 text-xs text-[#747878]">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                    {item.wardrobe_item_ids.length} item
                  </span>
                </div>
                <Link
                  className="mt-3 inline-flex h-8 items-center border border-[#E8E8E4] px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                  to={`/recommendations/history/${item.id}`}
                >
                  <FiEye className="mr-1.5 size-3" aria-hidden="true" />
                  Detail
                </Link>
              </article>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#E8E8E4] pt-4">
              <button
                aria-label="Halaman sebelumnya"
                className="grid size-9 place-items-center border border-[#E8E8E4] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === 1}
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <FiChevronLeft aria-hidden="true" />
              </button>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#747878]">
                {page} / {totalPages}
              </span>
              <button
                aria-label="Halaman berikutnya"
                className="grid size-9 place-items-center border border-[#E8E8E4] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={page === totalPages}
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <FiChevronRight aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-[#747878]">
          Belum ada riwayat rekomendasi.
        </p>
      )}
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <section className="min-h-20 border border-[#E8E8E4] bg-white p-4">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
        {label}
      </p>
      <p className="text-xl font-semibold text-[#1c1b1b]">{value}</p>
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
            Detail Skin Tone
          </p>
          <Link
            className="inline-flex h-8 items-center border border-[#E8E8E4] px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
            to="/profile/skin-tone"
          >
            <FiEdit2 className="mr-1.5 size-3" aria-hidden="true" />
            Edit
          </Link>
        </div>
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
            Detail Body Shape
          </p>
          <Link
            className="inline-flex h-8 items-center border border-[#E8E8E4] px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
            to="/profile/body-shape"
          >
            <FiEdit2 className="mr-1.5 size-3" aria-hidden="true" />
            Edit
          </Link>
        </div>
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
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="h-20 animate-pulse bg-white" />
        <div className="h-20 animate-pulse bg-white" />
        <div className="h-20 animate-pulse bg-white" />
        <div className="h-20 animate-pulse bg-white" />
        <div className="h-20 animate-pulse bg-white" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-56 animate-pulse bg-white" />
          <div className="h-64 animate-pulse bg-white" />
        </div>
        <div className="h-56 animate-pulse bg-white" />
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

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatOccasion(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
