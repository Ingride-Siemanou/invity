type InvitationPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitationPage({
  params,
}: InvitationPageProps) {
  const { token } = await params;

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-3xl font-bold text-pink-600">
            Invity
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Votre invitation
          </h1>

          <p className="mt-3 text-gray-600">
            Token de l’invitation :
          </p>

          <p className="mt-2 break-all rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            {token}
          </p>
        </div>
      </div>
    </main>
  );
}