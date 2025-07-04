'use server';

/**
 * @fileOverview Extracts actionable creative elements from a design brief for designers.
 *
 * - extractDesignElements - A function that analyzes a brief and suggests creative assets.
 * - ExtractDesignElementsInput - The input type for the function.
 * - ExtractDesignElementsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
  type ExtractDesignElementsInput,
  ExtractDesignElementsInputSchema,
  type ExtractDesignElementsOutput,
  ExtractDesignElementsOutputSchema,
} from '@/lib/types';

export async function extractDesignElements(input: ExtractDesignElementsInput): Promise<ExtractDesignElementsOutput> {
  return extractDesignElementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractDesignElementsPrompt',
  input: {schema: ExtractDesignElementsInputSchema},
  output: {schema: ExtractDesignElementsOutputSchema},
  prompt: `You are a helpful and experienced Senior Art Director. Your task is to analyze a client's design brief and break it down into actionable, creative starting points for a junior designer.

  **Client's Design Brief:**
  """
  {{{designBrief}}}
  """

  **Your Task:**
  Based on the brief, generate the following creative assets. Be concise and practical.

  1.  **Summary:** Create a short, bulleted list of the most critical requirements from the brief.
  2.  **Color Palette:** Suggest a palette of 4-5 appropriate hex color codes. Think about the mood and industry.
  3.  **Image Keywords:** Provide 3-5 practical and concrete keywords that a designer can use to search for stock photos, icons, or illustrations. Avoid abstract concepts.
  4.  **Suggested Headline:** Write one short, catchy headline or tagline that fits the brief's objective.

  Provide the output in the specified JSON format.`,
});

const extractDesignElementsFlow = ai.defineFlow(
  {
    name: 'extractDesignElementsFlow',
    inputSchema: ExtractDesignElementsInputSchema,
    outputSchema: ExtractDesignElementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
