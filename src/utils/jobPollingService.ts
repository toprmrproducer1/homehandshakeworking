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
      console.log(`Checking status for job ${job.id} (Project: ${job.vizard_project_id})...`);
      const result = await queryVizardProject(job.vizard_project_id);

      console.log(`Vizard response for job ${job.id}: code ${result.code}`);

      if (result.code === 1000) {
        console.log(`Job ${job.id} still processing in Vizard...`);
        return;
      }

      if (result.code === 2000 && result.videos && result.videos.length > 0) {
        console.log(`✅ Job ${job.id} completed with ${result.videos.length} clips!`);

        const clips = result.videos.map((video, index) => {
          console.log(`Clip ${index + 1}: ${video.title}`);
          console.log(`  - Video URL: ${video.videoUrl}`);
          console.log(`  - Editor URL: ${video.clipEditorUrl || 'N/A'}`);
          console.log(`  - Duration: ${video.videoMsDuration}ms`);
          console.log(`  - Viral Score: ${video.viralScore}/10`);

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

        console.log(`Saving ${clips.length} clips to database...`);
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

          console.log(`✅ Saved ${savedClips.length} clips to database successfully!`);
          await markJobCompleted(job.id, savedClips.length);
          console.log(`✅ Marked job ${job.id} as completed`);

          if (onUpdate) {
            console.log(`Triggering UI update...`);
            onUpdate();
          }
        } catch (saveError) {
          console.error(`❌ Failed to save clips for job ${job.id}:`, saveError);
          throw saveError;
        }
      } else if (result.code === 2000 && (!result.videos || result.videos.length === 0)) {
        console.log(`⚠️ Job ${job.id} completed but no videos were generated`);
        await markJobCompleted(job.id, 0);
      } else if (result.code === 4002) {
        console.log(`❌ Job ${job.id} failed with code 4002`);
        await markJobFailed(job.id, result.msg || 'Video clipping failed');

        if (onUpdate) {
          onUpdate();
        }
      } else {
        console.log(`⚠️ Unexpected Vizard response code: ${result.code}, msg: ${result.msg}`);
      }
    } catch (error) {
      console.error(`❌ Error checking job ${job.id}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error details: ${errorMessage}`);
    }
  }

  isRunning() {
    return this.isPolling;
  }
}

export const jobPollingService = new JobPollingService();
