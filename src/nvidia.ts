import chalk from "chalk";
import { Config } from "./config.ts";

// NVIDIA NIM API configuration
const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";

interface NIMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function generateWithNVIDIA(
  prompt: string,
  model: string = "meta/llama-3.1-8b-instruct",
  apiKey?: string
): Promise<string | null> {
  const key = apiKey || process.env.NVIDIA_API_KEY;
  
  if (!key) {
    console.log(chalk.yellow("[NVIDIA] No API key configured. Set NVIDIA_API_KEY env var."));
    return null;
  }
  
  try {
    console.log(chalk.cyan("[NVIDIA] Generating response with Llama 3.1 8b..."));
    
    const response = await fetch(`${NIM_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an API mock generator. Generate realistic, valid JSON responses for API endpoints. Output ONLY valid JSON, no explanations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log(chalk.red(`[NVIDIA] API error: ${response.status} - ${error}`));
      return null;
    }
    
    const data = (await response.json()) as NIMResponse;
    const content = data.choices[0]?.message?.content || null;
    
    if (content) {
      console.log(chalk.green(`[NVIDIA] Generated ${data.usage?.completion_tokens || 0} tokens`));
    }
    
    return content;
  } catch (error) {
    console.log(chalk.red(`[NVIDIA] Error: ${error}`));
    return null;
  }
}

export function buildMockPrompt(method: string, path: string, requestBody?: string): string {
  const parts = [`Generate a realistic JSON response for a ${method} request to: ${path}`];
  
  if (requestBody) {
    try {
      const body = JSON.parse(requestBody);
      parts.push(`Request body: ${JSON.stringify(body, null, 2)}`);
    } catch {
      parts.push(`Request body: ${requestBody}`);
    }
  }
  
  // Add context hints based on path
  if (path.includes("/users")) {
    parts.push("Include user fields: id, name, email, created_at");
  } else if (path.includes("/products")) {
    parts.push("Include product fields: id, name, price, description, in_stock");
  } else if (path.includes("/posts")) {
    parts.push("Include post fields: id, title, content, author_id, created_at");
  } else if (path.includes("/messages") || path.includes("/chat")) {
    parts.push("Include message fields: id, role, content, created_at");
  }
  
  parts.push("Output ONLY valid JSON, no markdown formatting.");
  
  return parts.join("\n\n");
}