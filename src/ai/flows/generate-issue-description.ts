'use server';

/**
 * @fileOverview A flow to generate a suggested issue description based on the user's input and location.
 *
 * - generateIssueDescription - A function that handles the issue description generation process.
 * - GenerateIssueDescriptionInput - The input type for the generateIssueDescription function.
 * - GenerateIssueDescriptionOutput - The return type for the generateIssueDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIssueDescriptionInputSchema = z.object({
  location: z.string().describe('The location of the road surface issue.'),
  briefInput: z.string().describe('A brief description of the road surface issue provided by the user.'),
});
export type GenerateIssueDescriptionInput = z.infer<typeof GenerateIssueDescriptionInputSchema>;

const GenerateIssueDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('A suggested description of the road surface issue.'),
});
export type GenerateIssueDescriptionOutput = z.infer<typeof GenerateIssueDescriptionOutputSchema>;

export async function generateIssueDescription(input: GenerateIssueDescriptionInput): Promise<GenerateIssueDescriptionOutput> {
  return generateIssueDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIssueDescriptionPrompt',
  input: {schema: GenerateIssueDescriptionInputSchema},
  output: {schema: GenerateIssueDescriptionOutputSchema},
  prompt: `You are an AI assistant helping users to report road surface issues to the Gomel Public Utilities.

  Based on the user's location and a brief input, generate a more detailed and accurate description of the issue.

  Location: {{{location}}}
  Brief Input: {{{briefInput}}}

  Suggested Description:`, // Ensure the prompt ends with the desired output field.
});

const generateIssueDescriptionFlow = ai.defineFlow(
  {
    name: 'generateIssueDescriptionFlow',
    inputSchema: GenerateIssueDescriptionInputSchema,
    outputSchema: GenerateIssueDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
