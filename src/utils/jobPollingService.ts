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
  private pollIntervalMs = 30000;

  start(profileKey: string, userId: string, onUpdate?: () => void) {
    if (this.isPolling) {
      console.log('Job polling already running');
      return;
    }

    this.isPolling = true;
    console.log('Starting job polling service');

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
    console.log('Stopped job polling service');
  }

  private async pollJobs(profileKey: string, userId: string, onUpdate?: () => void) {
    try {
      const processingJobs = await getProcessingJobs(profileKey);

      if (processingJobs.length === 0) {
        return;
      }

      console.log(`Polling ${processingJobs.length} processing jobs...`);

      for (const job of processingJobs) {
        await this.checkJobStatus(job, userId, profileKey, onUpdate);
      }
    } catch (error) {
      console.error('Error polling jobs:', error);
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
        console.log(`Job ${job.id} still processing...`);
        return;
      }

      if (result.code === 2000 && result.videos) {
        console.log(`Job ${job.id} completed!`);

        const clips = result.videos.map((video, index) => ({
          clipEditorUrl: '',
          relatedTopic: video.relatedTopic?.join(', ') || null,
          title: video.title,
          transcript: video.transcript || null,
          videoId: index,
          videoMsDuration: video.videoMsDuration,
          videoUrl: video.videoUrl,
          viralReason: video.viralReason,
          viralScore: String(video.viralScore),
        }));

        const savedClips = await saveVizardClips(
          userId,
          profileKey,
          job.vizard_project_id,
          job.original_video_url,
          clips,
          job.config
        );

        await markJobCompleted(job.id, savedClips.length);

        if (onUpdate) {
          onUpdate();
        }
      } else if (result.code === 4002) {
        console.log(`Job ${job.id} failed`);
        await markJobFailed(job.id, result.msg || 'Video clipping failed');

        if (onUpdate) {
          onUpdate();
        }
      }
    } catch (error) {
      console.error(`Error checking job ${job.id}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('timeout') || errorMessage.includes('failed')) {
      }
    }
  }

  isRunning() {
    return this.isPolling;
  }
}

export const jobPollingService = new JobPollingService();
