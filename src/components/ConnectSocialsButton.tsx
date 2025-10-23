import React from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { useUserContext } from '../contexts/UserContext';
import { getConnectSocialsURL } from '../utils/jwt';

const ConnectSocialsButton: React.FC = () => {
  const { profileKey } = useUserContext();

  const handleConnectSocials = async () => {
    if (!profileKey) {
      alert('Profile key not available. Please try refreshing the page.');
      return;
    }

    try {
      const url = await getConnectSocialsURL(profileKey);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Unable to generate connection URL. Error: ${errorMessage}`);
    }
  };

  return (
    <button
      onClick={handleConnectSocials}
      disabled={!profileKey}
      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-purple-900 transition-all duration-200 shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/60 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <Plus className="h-5 w-5" />
      <span>Connect Socials</span>
      <ExternalLink className="h-4 w-4" />
    </button>
  );
};

export default ConnectSocialsButton;