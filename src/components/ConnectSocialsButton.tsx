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
      console.log('Attempting to generate connect URL with profileKey:', profileKey);
      const url = await getConnectSocialsURL(profileKey);
      console.log('Successfully generated URL:', url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error generating connect socials URL:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      alert(`Unable to generate connection URL. Error: ${errorMessage}`);
    }
  };

  return (
    <button
      onClick={handleConnectSocials}
      disabled={!profileKey}
      className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      <Plus className="h-5 w-5" />
      <span>Connect Socials</span>
      <ExternalLink className="h-4 w-4" />
    </button>
  );
};

export default ConnectSocialsButton;