'use server';

/**
 * @fileOverview Merangkum brief desain untuk desainer, mengekstrak persyaratan dan preferensi utama.
 *
 * - summarizeDesignBrief - Fungsi yang mengambil brief desain dan mengembalikan ringkasan.
 * - SummarizeDesignBriefInput - Tipe input untuk fungsi summarizeDesignBrief.
 * - SummarizeDesignBriefOutput - Tipe return untuk fungsi summarizeDesignBrief.
 */

import {ai} from '@/ai/genkit';
import {
  type SummarizeDesignBriefInput,
  SummarizeDesignBriefInputSchema,
  type SummarizeDesignBriefOutput,
  SummarizeDesignBriefOutputSchema,
} from '@/lib/types';


export async function summarizeDesignBrief(input: SummarizeDesignBriefInput): Promise<SummarizeDesignBriefOutput> {
  return summarizeDesignBriefFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDesignBriefPrompt',
  input: {schema: SummarizeDesignBriefInputSchema},
  output: {schema: SummarizeDesignBriefOutputSchema},
  prompt: `Anda adalah seorang ahli perangkum brief desain. Tujuan Anda adalah untuk memberikan ringkasan yang singkat dan jelas dari brief desain yang diberikan oleh pelanggan.

  Brief Desain: {{{designBrief}}}

  Ringkasan:`,
});

const summarizeDesignBriefFlow = ai.defineFlow(
  {
    name: 'summarizeDesignBriefFlow',
    inputSchema: SummarizeDesignBriefInputSchema,
    outputSchema: SummarizeDesignBriefOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
