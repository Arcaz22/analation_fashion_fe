import { useNavigate } from "react-router";

import { BodyShapeForm } from "~/components/forms/BodyShapeForm";

export default function ProfileBodyShapePage() {
  const navigate = useNavigate();

  return (
    <BodyShapeForm
      onBack={() => navigate("/profile")}
      onComplete={() => navigate("/profile")}
    />
  );
}
