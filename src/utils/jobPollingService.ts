import { queryVizardProject } from './vizardApi';
import { saveVizardClips } from './clippedVideosDb';
import {
  getProcessingJobs,
  updateClippingJobProgress,
  markJobCompleted,
  markJobFailed,
  ClippingJob,
} from './clippingJobs';

class JobPollingService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollIntervalMs = 60000;

  start(profileKey: string, userId: string, onUpdate?: () => void) {
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;

    this.pollJobs(profileKey, userId, onUpdate);

    this.pollingInterval = setInterval(() => {
      this.pollJobs(profileKey, userId, onUpdate);
    }, this.pollIntervalMs);
  }

  stop() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
  }

  private async pollJobs(profileKey: string, userId: string, onUpdate?: () => void) {
    try {
      const processingJobs = await getProcessingJobs(profileKey);

      if (processingJobs.length === 0) {
        return;
      }


      for (const job of processingJobs) {
        await this.checkJobStatus(job, userId, profileKey, onUpdate);
      }
    } catch (error) {
    }
  }

  private async checkJobStatus(
    job: ClippingJob,
    userId: string,
    profileKey: string,
    onUpdate?: () => void
  ) {
    try {
      const result = await queryVizardProject(job.vizard_project_id);


      if (result.code === 1000) {
        return;
      }

      if (result.code === 2000 && result.videos && result.videos.length > 0) {

        const clips = result.videos.map((video, index) => {

          return {
            clipEditorUrl: video.clipEditorUrl || '',
            relatedTopic: Array.isArray(video.relatedTopic) ? video.relatedTopic.join(', ') : (video.relatedTopic || null),
            title: video.title,
            transcript: video.transcript || null,
            videoId: video.videoId || index,
            videoMsDuration: video.videoMsDuration,
            videoUrl: video.videoUrl,
            viralReason: video.viralReason,
            viralScore: String(video.viralScore),
          };
        });

        try {
          const savedClips = await saveVizardClips(
            userId,
            profileKey,
            job.vizard_project_id,
            job.original_video_url,
            clips,
            job.config,
            undefined,
            job.vizard_share_link
          );

          await markJobCompleted(job.id, savedClips.length);

          if (onUpdate) {
            onUpdate();
          }
        } catch (saveError) {
          throw saveError;
        }
      } else if (result.code === 2000 && (!result.videos || result.videos.length === 0)) {
        await markJobCompleted(job.id, 0);
      } else if (result.code === 4002) {
        await markJobFailed(job.id, result.msg || 'Video clipping failed');

        if (onUpdate) {
          onUpdate();
        }
      } else {
      }
    } catch (error) {

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  isRunning() {
    return this.isPolling;
  }
}

export const jobPollingService = new JobPollingService();
