const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const callOpenAI = async (
  messages: OpenAIMessage[],
  model: string = 'gpt-4',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<{ response: string; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data: OpenAIResponse = await response.json();

    return {
      response: data.choices[0]?.message?.content || '',
      usage: data.usage,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
};

export interface BrandGuidelineContext {
  brand_colors?: string[];
  brand_tone?: string;
  target_audience?: string;
  brand_values?: string;
  style_preferences?: string;
}

export const enhanceImagePrompt = async (
  originalPrompt: string,
  brandGuideline?: BrandGuidelineContext
): Promise<{ enhancedPrompt: string; usage: any }> => {
  let brandContext = '';
  if (brandGuideline) {
    const parts: string[] = [];
    if (brandGuideline.brand_colors && brandGuideline.brand_colors.length > 0) {
      parts.push(`Brand colors: ${brandGuideline.brand_colors.join(', ')}`);
    }
    if (brandGuideline.brand_tone) {
      parts.push(`Brand tone: ${brandGuideline.brand_tone}`);
    }
    if (brandGuideline.target_audience) {
      parts.push(`Target audience: ${brandGuideline.target_audience}`);
    }
    if (brandGuideline.brand_values) {
      parts.push(`Brand values: ${brandGuideline.brand_values}`);
    }
    if (brandGuideline.style_preferences) {
      parts.push(`Style preferences: ${brandGuideline.style_preferences}`);
    }
    if (parts.length > 0) {
      brandContext = `\n\nBrand Guidelines to consider:\n${parts.join('\n')}`;
    }
  }

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You are an expert AI image generation prompt engineer. Your task is to take simple or basic prompts and enhance them with rich details, artistic style, lighting, composition, and technical specifications that will produce stunning images.

Key enhancement areas:
- Add specific artistic styles (e.g., digital art, oil painting, photorealistic, cinematic)
- Include lighting details (e.g., golden hour, dramatic lighting, soft diffused light)
- Specify composition (e.g., rule of thirds, close-up, wide angle)
- Add color palette suggestions (e.g., vibrant, muted, warm tones)
- Include technical details (e.g., 8K, highly detailed, professional photography)
- Add mood and atmosphere descriptions
- Specify camera angles or perspectives when relevant

${brandContext ? 'IMPORTANT: Incorporate the brand guidelines provided into your enhancement, ensuring the result aligns with the brand colors, tone, audience, values, and style preferences.' : ''}

Keep the enhanced prompt concise but vivid (under 200 words). Return only the enhanced prompt without explanations.`
    },
    {
      role: 'user',
      content: `Enhance this image generation prompt: "${originalPrompt}"${brandContext}`
    }
  ];

  const result = await callOpenAI(messages, 'gpt-4', 0.8, 300);

  return {
    enhancedPrompt: result.response.trim(),
    usage: result.usage,
  };
};

export const generateSocialMediaInsights = async (
  platformData: any,
  platformName: string
): Promise<{ insights: string; recommendations: string[]; usage: any }> => {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You are a social media analytics expert. Analyze the provided social media metrics and generate actionable insights and recommendations. Focus on:
- Performance trends and patterns
- Engagement rate analysis
- Content performance comparisons
- Growth opportunities
- Best practices for the platform

Provide your response in JSON format with two fields:
1. "insights": A concise paragraph (2-3 sentences) summarizing key findings
2. "recommendations": An array of 3-5 specific actionable recommendations

Keep insights data-driven and recommendations practical.`
    },
    {
      role: 'user',
      content: `Analyze this ${platformName} performance data and provide insights and recommendations:\n\n${JSON.stringify(platformData, null, 2)}`
    }
  ];

  const result = await callOpenAI(messages, 'gpt-4', 0.7, 500);

  try {
    const parsed = JSON.parse(result.response);
    return {
      insights: parsed.insights || '',
      recommendations: parsed.recommendations || [],
      usage: result.usage,
    };
  } catch (error) {
    return {
      insights: result.response,
      recommendations: [],
      usage: result.usage,
    };
  }
};

export const generatePerformanceReport = async (
  allPlatformsData: any,
  timeframe: string
): Promise<{ report: string; usage: any }> => {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You are a social media performance analyst. Generate a comprehensive performance report analyzing multiple social media platforms. Include:
- Executive summary of overall performance
- Platform-by-platform breakdown
- Best performing content types
- Engagement trends
- Growth metrics
- Comparative analysis between platforms
- Strategic recommendations

Format the report in markdown with clear sections and bullet points. Keep it professional and data-driven.`
    },
    {
      role: 'user',
      content: `Generate a ${timeframe} performance report for these social media accounts:\n\n${JSON.stringify(allPlatformsData, null, 2)}`
    }
  ];

  const result = await callOpenAI(messages, 'gpt-4', 0.7, 2000);

  return {
    report: result.response,
    usage: result.usage,
  };
};

export const suggestPostCaption = async (
  context: string,
  platform: string,
  previousHighPerformingPosts?: string[]
): Promise<{ suggestions: string[]; usage: any }> => {
  const previousPostsContext = previousHighPerformingPosts && previousHighPerformingPosts.length > 0
    ? `\n\nHere are some previous high-performing posts for reference:\n${previousHighPerformingPosts.join('\n- ')}`
    : '';

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You are a social media content writer specializing in ${platform}. Generate engaging post captions that are optimized for the platform's audience and best practices.

Platform-specific guidelines:
- Instagram: Use emojis, hashtags, storytelling
- Twitter: Concise, engaging, may include hashtags
- Facebook: Conversational, longer form acceptable
- LinkedIn: Professional, value-driven, thought leadership
- TikTok: Casual, trendy, call-to-action

Provide 3 different caption variations in different tones (e.g., professional, casual, creative).
Return as a JSON array of strings.`
    },
    {
      role: 'user',
      content: `Generate 3 caption variations for ${platform} about: ${context}${previousPostsContext}`
    }
  ];

  const result = await callOpenAI(messages, 'gpt-4', 0.9, 500);

  try {
    const parsed = JSON.parse(result.response);
    return {
      suggestions: Array.isArray(parsed) ? parsed : [result.response],
      usage: result.usage,
    };
  } catch (error) {
    const lines = result.response.split('\n').filter(line => line.trim().length > 0);
    return {
      suggestions: lines.slice(0, 3),
      usage: result.usage,
    };
  }
};

export const analyzeSentiment = async (comments: string[]): Promise<{ sentiment: string; score: number; usage: any }> => {
  if (comments.length === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    };
  }

  const sampleComments = comments.slice(0, 50);

  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: `You are a sentiment analysis expert. Analyze the overall sentiment of the provided comments and return a JSON response with:
- "sentiment": one of "positive", "negative", "neutral", or "mixed"
- "score": a number from -1 (very negative) to 1 (very positive)

Consider the tone, language, and context of all comments collectively.`
    },
    {
      role: 'user',
      content: `Analyze the sentiment of these comments:\n\n${sampleComments.join('\n\n')}`
    }
  ];

  const result = await callOpenAI(messages, 'gpt-4', 0.3, 200);

  try {
    const parsed = JSON.parse(result.response);
    return {
      sentiment: parsed.sentiment || 'neutral',
      score: parsed.score || 0,
      usage: result.usage,
    };
  } catch (error) {
    return {
      sentiment: 'neutral',
      score: 0,
      usage: result.usage,
    };
  }
};
