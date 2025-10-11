import { queryVizardProject } from './vizardApi';
import { saveVizardClips, getClippedVideos, ClippedVideo } from './clippedVideosDb';
import { getClippingJobByProjectId, markJobCompleted, markJobFailed } from './clippingJobs';

export interface TaskQueryResult {
  success: boolean;
  taskId: string;
  status: 'processing' | 'completed' | 'failed' | 'not_found';
  clips?: ClippedVideo[];
  clipsCount: number;
  message: string;
  vizardShareLink?: string;
}

export const queryTaskById = async (
  taskId: string,
  profileKey: string,
  userId: string
): Promise<TaskQueryResult> => {
  try {
    const job = await getClippingJobByProjectId(profileKey, taskId);

    if (!job) {
      const vizardResult = await queryVizardProject(taskId);

      if (vizardResult.code === 1000) {
        return {
          success: true,
          taskId,
          status: 'processing',
          clipsCount: 0,
          message: 'Task is still processing in Vizard. Check back in a few minutes.',
        };
      } else if (vizardResult.code === 2000 && vizardResult.videos && vizardResult.videos.length > 0) {
        return {
          success: true,
          taskId,
          status: 'completed',
          clipsCount: vizardResult.videos.length,
          message: `Task completed! Found ${vizardResult.videos.length} clips. Note: This task was not in your history, so clips were not saved.`,
        };
      } else {
        return {
          success: false,
          taskId,
          status: 'not_found',
          clipsCount: 0,
          message: 'Task ID not found in your history or Vizard.',
        };
      }
    }

    if (job.status === 'completed') {
      const existingClips = await getClippedVideos(profileKey, taskId);

      return {
        success: true,
        taskId,
        status: 'completed',
        clips: existingClips,
        clipsCount: existingClips.length,
        message: `Task completed! Found ${existingClips.length} saved clips.`,
        vizardShareLink: job.vizard_share_link,
      };
    }

    if (job.status === 'failed') {
      return {
        success: false,
        taskId,
        status: 'failed',
        clipsCount: 0,
        message: `Task failed: ${job.error_message || 'Unknown error'}`,
        vizardShareLink: job.vizard_share_link,
      };
    }

    const vizardResult = await queryVizardProject(taskId);

    if (vizardResult.code === 2000 && vizardResult.videos && vizardResult.videos.length > 0) {
      const clips = vizardResult.videos.map((video, index) => ({
        clipEditorUrl: video.clipEditorUrl || '',
        relatedTopic: video.relatedTopic?.join(', ') || null,
        title: video.title,
        transcript: video.transcript || null,
        videoId: video.videoId || index,
        videoMsDuration: video.videoMsDuration,
        videoUrl: video.videoUrl,
        viralReason: video.viralReason,
        viralScore: String(video.viralScore),
      }));

      const savedClips = await saveVizardClips(
        userId,
        profileKey,
        taskId,
        job.original_video_url,
        clips,
        job.config,
        undefined,
        job.vizard_share_link
      );

      await markJobCompleted(job.id, savedClips.length);

      return {
        success: true,
        taskId,
        status: 'completed',
        clips: savedClips,
        clipsCount: savedClips.length,
        message: `Task completed! Generated and saved ${savedClips.length} clips.`,
        vizardShareLink: job.vizard_share_link,
      };
    } else if (vizardResult.code === 1000) {
      return {
        success: true,
        taskId,
        status: 'processing',
        clipsCount: 0,
        message: 'Task is still processing. Check back in a few minutes.',
        vizardShareLink: job.vizard_share_link,
      };
    } else if (vizardResult.code === 4002) {
      await markJobFailed(job.id, vizardResult.msg || 'Video clipping failed');

      return {
        success: false,
        taskId,
        status: 'failed',
        clipsCount: 0,
        message: `Task failed: ${vizardResult.msg || 'Video clipping failed'}`,
        vizardShareLink: job.vizard_share_link,
      };
    } else {
      return {
        success: false,
        taskId,
        status: 'processing',
        clipsCount: 0,
        message: `Unexpected status from Vizard (code: ${vizardResult.code}). ${vizardResult.msg || ''}`,
        vizardShareLink: job.vizard_share_link,
      };
    }
  } catch (error) {
    console.error('Error querying task:', error);
    return {
      success: false,
      taskId,
      status: 'not_found',
      clipsCount: 0,
      message: error instanceof Error ? error.message : 'Failed to query task',
    };
  }
};

export const queryMultipleTasks = async (
  taskIds: string[],
  profileKey: string,
  userId: string
): Promise<TaskQueryResult[]> => {
  const results: TaskQueryResult[] = [];

  for (const taskId of taskIds) {
    try {
      const result = await queryTaskById(taskId.trim(), profileKey, userId);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        taskId: taskId.trim(),
        status: 'not_found',
        clipsCount: 0,
        message: error instanceof Error ? error.message : 'Failed to query task',
      });
    }
  }

  return results;
};
