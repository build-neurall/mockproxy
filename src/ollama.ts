import chalk from "chalk";

const OLLAMA_BASE_URL = "http://localhost:11434";

interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export async function generateWithOllama(
  prompt: string,
  model: string = "llama3.1:8b"
): Promise<string | null> {
  try {
    // First check if Ollama is running
    const healthCheck = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    }).catch(() => null);
    
    if (!healthCheck || !healthCheck.ok) {
      console.log(chalk.yellow("[OLLAMA] Not running. Start with: ollama serve"));
      return null;
    }
    
    console.log(chalk.cyan(`[OLLAMA] Generating response with ${model}...`));
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
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
        stream: false,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log(chalk.red(`[OLLAMA] API error: ${response.status} - ${error}`));
      return null;
    }
    
    const data = (await response.json()) as OllamaResponse;
    const content = data.message?.content || null;
    
    if (content) {
      console.log(chalk.green(`[OLLAMA] Generated response successfully`));
    }
    
    return content;
  } catch (error) {
    console.log(chalk.red(`[OLLAMA] Error: ${error}`));
    return null;
  }
}

export async function checkOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];
    
    const data = await response.json() as { models: Array<{ name: string }> };
    return data.models?.map((m) => m.name) || [];
  } catch {
    return [];
  }
}