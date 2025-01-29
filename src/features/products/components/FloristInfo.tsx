interface FloristProfile {
  store_name?: string;
  address?: string;
  about_text?: string;
}

interface FloristInfoProps {
  floristProfile: FloristProfile;
}

export const FloristInfo = ({ floristProfile }: FloristInfoProps) => {
  if (!floristProfile) return null;

  return (
    <div className="space-y-2">
      <h2 className="font-semibold">Florist</h2>
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="font-medium">{floristProfile.store_name}</p>
        <p className="text-sm text-gray-600">{floristProfile.address}</p>
        {floristProfile.about_text && (
          <p className="text-sm text-gray-600 mt-2">{floristProfile.about_text}</p>
        )}
      </div>
    </div>
  );
};