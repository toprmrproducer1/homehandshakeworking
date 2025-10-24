import React from 'react';
import { Terminal } from 'lucide-react';

const VizardDebugPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/50 dark:to-black rounded-2xl border border-gray-200 dark:border-gray-800 p-12 backdrop-blur-xl">
        <div className="text-center">
          <Terminal className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Debug Tools</h3>
          <p className="text-gray-500 dark:text-gray-500">Advanced debugging features are currently disabled</p>
        </div>
      </div>
    </div>
  );
};

export default VizardDebugPanel;
