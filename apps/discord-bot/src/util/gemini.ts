import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Video } from '@ikihaji-tube/core/model';

const genAI = new GoogleGenerativeAI(process.env['GEMINI_API_KEY'] ?? '');

const defaultPrompt = `You are a content filter bot for a Discord server where friends share YouTube viewing history.
Your task is to determine if a video is appropriate to share with friends.
The video should NOT be shared if it contains any of the following:
- R-18/R-15 content
- Political content
- Hate speech
- Graphic content
- Any other sensitive content that might be inappropriate for a general audience.

If no specific prompt is given, please only allow videos that are about music, cooking, gaming, or other safe and general topics.
`;

const jsonInstruction = `
You will be given a JSON array of video objects.
For each video, you must determine if it is "shareable" based on the rules.
You MUST respond with only a JSON array of the same length as the input, with each object containing the "id" of the video and a "shareable" boolean.
Example response format:
[
  { "id": "videoId1", "shareable": true },
  { "id": "videoId2", "shareable": false }
]
`;

export async function filterVideosWithGemini(videos: Video[], prompt?: string | null): Promise<Video[]> {
  if (!process.env['GEMINI_API_KEY']) {
    console.warn('GEMINI_API_KEY is not set. Skipping video filtering.');
    return videos;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let fullPrompt = defaultPrompt;
  if (prompt) {
    fullPrompt += `
In addition to the above, the server administrator has provided the following rule:
"${prompt}"
`;
  }
  fullPrompt += jsonInstruction;

  const videoData = videos.map(v => ({ id: v.id, title: v.title }));
  const geminiPrompt = `${fullPrompt}\n\nHere are the videos to evaluate:\n${JSON.stringify(videoData, null, 2)}`;

  try {
    const result = await model.generateContent(geminiPrompt);
    const response = await result.response;
    const text = response.text().trim();

    // Clean the response to ensure it is valid JSON
    const jsonString = text.startsWith('```json') ? text.substring(7, text.length - 3).trim() : text;

    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log(jsonString);

    const shareableFlags = JSON.parse(jsonString) as { id: string; shareable: boolean }[];

    const shareableVideoIds = new Set(shareableFlags.filter(f => f.shareable).map(f => f.id));

    return videos.filter(v => shareableVideoIds.has(v.id));
  } catch (error) {
    console.error('Error filtering videos with Gemini:', error);
    // In case of an error, return all videos to not block the feature entirely.
    return videos;
  }
}
