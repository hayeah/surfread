import type { NextApiRequest, NextApiResponse } from 'next';
import { getExplanation } from '@/services/chatgpt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, context } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const result = await getExplanation(text, context || '');

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }

    return res.status(200).json({ explanation: result.explanation });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to get explanation'
    });
  }
}
