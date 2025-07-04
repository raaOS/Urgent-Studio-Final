import {genkit} from 'genkit';
import type {GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const plugins: GenkitPlugin[] = [];
if (process.env.GOOGLE_API_KEY) {
  plugins.push(googleAI());
}

export const ai = genkit({
  plugins: plugins,
  model: 'googleai/gemini-2.5-pro',
});
