import { FiEdit2 } from "react-icons/fi";
import { Link } from "react-router";

import type { UserProfile } from "~/types/profile";

export function ProfileCard({
  compact = false,
  profile,
}: {
  compact?: boolean;
  profile: UserProfile;
}) {
  const initials =
    profile.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "WD";
  const skinTone = profile.skin_tone;
  const bodyShape = profile.body_shape;
  const palette = skinTone?.palette_hex_list?.length
    ? skinTone.palette_hex_list
    : [];

  return (
    <section className="border border-[#E8E8E4] bg-white p-5">
      <div className="mb-5 flex items-center gap-4">
        <div className="grid size-14 shrink-0 place-items-center bg-[#1c1b1b] text-sm font-semibold uppercase tracking-[0.08em] text-white md:size-16">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-[#1c1b1b]">
            {profile.name}
          </p>
          <p className="truncate text-sm text-[#747878]">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ProfileMetric
          label="Warna kulit"
          editTo={compact ? undefined : "/profile/skin-tone"}
          value={
            skinTone
              ? `${skinTone.tone_label} / ${skinTone.undertone}`
              : "Belum diisi"
          }
        />
        <ProfileMetric
          label="Bentuk tubuh"
          editTo={compact ? undefined : "/profile/body-shape"}
          value={bodyShape?.shape_label ?? "Belum diisi"}
        />
      </div>

      <div className="mt-5">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          Palet utama
        </p>
        {palette.length ? (
          <div className="grid grid-cols-5 gap-2">
            {palette.map((color) => (
              <div
                className="h-10 border border-black/5"
                key={color}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#747878]">
            Palet akan muncul setelah skin tone disimpan.
          </p>
        )}
      </div>

      {bodyShape ? (
        <div className="mt-5 border-t border-[#E8E8E4] pt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
            Rekomendasi bentuk tubuh
          </p>
          <div className="flex flex-wrap gap-2">
            {bodyShape.recommended_styles.map((style) => (
              <span
                className="bg-[#FAFAF8] px-3 py-1.5 text-xs font-medium text-[#1c1b1b]"
                key={style}
              >
                {style}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {compact ? (
        <Link
          className="mt-5 block h-11 border border-[#1c1b1b] bg-white px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1c1b1b] transition-colors hover:bg-[#1c1b1b] hover:text-white"
          to="/profile"
        >
          Lihat Profile
        </Link>
      ) : null}
    </section>
  );
}

function ProfileMetric({
  editTo,
  label,
  value,
}: {
  editTo?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#FAFAF8] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
          {label}
        </p>
        {editTo ? (
          <Link
            aria-label={`Edit ${label}`}
            className="inline-flex size-7 items-center justify-center border border-[#E8E8E4] bg-white text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
            to={editTo}
          >
            <FiEdit2 className="size-3.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <p className="text-sm font-semibold text-[#1c1b1b]">{value}</p>
    </div>
  );
}
