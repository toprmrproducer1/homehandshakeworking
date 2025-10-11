import React from 'react';
import { Sparkles, Film, Scissors, Wand2 } from 'lucide-react';

interface VideoProcessingLoaderProps {
  progress?: number;
  projectId?: string;
  estimatedTime?: string;
  videoUrl?: string;
}

const VideoProcessingLoader: React.FC<VideoProcessingLoaderProps> = ({
  progress = 0,
  projectId,
  estimatedTime = '5-10 minutes',
  videoUrl,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-blue-500/30 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-full animate-bounce">
              <div className="relative">
                <Wand2 className="h-12 w-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI is Clipping Your Video
            </h3>
            <p className="text-blue-200/80 text-sm">
              Our AI is analyzing your content and creating viral-ready clips
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 bg-blue-900/20 rounded-xl border border-blue-500/20">
            <div className="bg-blue-600/20 p-3 rounded-full">
              <Film className="h-6 w-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-300 text-center">Analyzing Content</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-purple-900/20 rounded-xl border border-purple-500/20">
            <div className="bg-purple-600/20 p-3 rounded-full">
              <Scissors className="h-6 w-6 text-purple-400" />
            </div>
            <span className="text-xs text-purple-300 text-center">Creating Clips</span>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-pink-900/20 rounded-xl border border-pink-500/20">
            <div className="bg-pink-600/20 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-pink-400" />
            </div>
            <span className="text-xs text-pink-300 text-center">Adding Magic</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-200">Processing Progress</span>
            <span className="text-blue-300 font-semibold">{progress}%</span>
          </div>

          <div className="relative h-3 bg-blue-900/30 rounded-full overflow-hidden border border-blue-500/30">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>

            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
              style={{ width: '30%', animation: 'shimmer 2s infinite' }}
            />
          </div>
        </div>

        <div className="flex flex-col space-y-2 p-4 bg-blue-900/10 rounded-xl border border-blue-500/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-300">Estimated Time:</span>
            <span className="text-blue-100 font-medium">{estimatedTime}</span>
          </div>

          {projectId && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-400/70">Project ID:</span>
              <span className="text-blue-300/70 font-mono">{projectId}</span>
            </div>
          )}

          {videoUrl && (
            <div className="flex flex-col space-y-1 text-xs">
              <span className="text-blue-400/70">Video URL:</span>
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300/70 font-mono break-all hover:text-blue-200 transition-colors underline"
              >
                {videoUrl}
              </a>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-blue-300/70">
            You can close this page - we'll save your clips automatically
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { left: -30%; }
          100% { left: 100%; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default VideoProcessingLoader;
