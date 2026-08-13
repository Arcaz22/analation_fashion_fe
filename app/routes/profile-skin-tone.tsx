import { useNavigate } from "react-router";

import { SkinToneForm } from "~/components/forms/SkinToneForm";

export default function ProfileSkinTonePage() {
  const navigate = useNavigate();

  return <SkinToneForm onSaved={() => navigate("/profile")} />;
}
