import {
  createParser,
  type EventSourceMessage,
  type ParseError,
} from 'eventsource-parser';

export interface OpenAIStreamPayload {
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload): Promise<ReadableStream> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
    cache: 'no-store',
    signal: AbortSignal.timeout(30000), // 30 second timeout
  });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const parser = createParser({
          onEvent(event: EventSourceMessage) {
            const { data } = event;
            console.log(event.data);

            if (data === '[DONE]') {
              console.log('Stream completed');
              controller.close();
              return;
            }

            const json = JSON.parse(data);
            console.log('Parsed JSON:', json);
            const text = json.choices[0].delta.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          },
          onError(error: ParseError) {
            console.error('Parser error:', error);
            controller.error(error);
          },
        });

        try {
          let chunkCount = 0;
          for await (const chunk of res.body as any) {
            const decodedChunk = decoder.decode(chunk);
            console.log(`Received chunk ${++chunkCount}:`, decodedChunk);
            parser.feed(decodedChunk);
          }
        } catch (error) {
          controller.error(error);
        }
      } catch (error) {
        console.error('Stream error:', error);
        controller.error(error);
      }
    },
  });

  return stream;
}
