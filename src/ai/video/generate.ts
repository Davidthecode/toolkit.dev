import LumaAI from "lumaai";

export const generateVideo = async (prompt: string): Promise<string> => {
  const apiKey = process.env.LUMAAI_API_KEY;
  if (!apiKey) {
    throw new Error("LUMAAI_API_KEY environment variable is not set");
  }

  const client = new LumaAI({ authToken: apiKey });

  // Kick off the generation
  let generation = await client.generations.create({
    prompt: prompt,
    model: "ray-2",
    duration: "3s",
  });

  // Poll until complete or failed
  while (generation.state !== "completed") {
    if (generation.state === "failed") {
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    }
    console.log("Dreaming...");
    await new Promise((r) => setTimeout(r, 3000));
    if (generation.id != null) {
      generation = await client.generations.get(generation.id);
    }
  }

  // Download the resulting video
  const videoUrl = generation.assets?.video;

  if (!videoUrl) {
    throw new Error("No video URL found");
  }

  return videoUrl;
};
