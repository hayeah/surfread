interface ExplanationRequest {
  text: string;
  context: string;
}

interface ExplanationResponse {
  explanation: string;
  error?: string;
}

export async function getExplanation(
  text: string,
  context: string
): Promise<ExplanationResponse> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return {
      explanation: "",
      error: "OpenAI API key not found"
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an assistant that eplain text to help with reading."
          },
          {
            role: "user",
            content: `Explain this text in a rich, detailed, erudite way: "${text}"\n\nHere's the surrounding context: "${context}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get explanation");
    }

    return {
      explanation: data.choices[0].message.content.trim()
    };
  } catch (error) {
    return {
      explanation: "",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
