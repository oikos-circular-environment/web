import { ProfileForm } from "./_components/profile-form";
import { getProfileAction } from "./actions";

export default async function ProfilePage() {
  const initialData = await getProfileAction();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Edite seus dados pessoais. Suas alterações são refletidas
          imediatamente na plataforma.
        </p>
      </div>
      <ProfileForm initialData={initialData} />
    </div>
  );
}
