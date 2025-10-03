'use server';
/**
 * @fileOverview AI-powered participant name validation and correction flow.
 *
 * - validateAndCorrectParticipantNames - Validates and corrects participant names.
 * - ValidateAndCorrectParticipantNamesInput - The input type for the validateAndCorrectParticipantNames function.
 * - ValidateAndCorrectParticipantNamesOutput - The return type for the validateAndCorrectParticipantNames function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateAndCorrectParticipantNamesInputSchema = z.array(
  z.object({
    name: z.string().describe('The participant name to validate and correct.'),
  })
).describe('An array of participant names.');

export type ValidateAndCorrectParticipantNamesInput = z.infer<typeof ValidateAndCorrectParticipantNamesInputSchema>;

const ValidateAndCorrectParticipantNamesOutputSchema = z.array(
  z.object({
    originalName: z.string().describe('The original participant name.'),
    correctedName: z.string().describe('The corrected participant name, if any correction was needed. Otherwise, the original name.'),
    isValid: z.boolean().describe('Whether the name is valid or not.'),
    reason: z.string().optional().describe('Reasoning behind the decision. If there was a correction or invalidation, explain why.'),
  })
).describe('An array of validation and correction results for each participant name.');

export type ValidateAndCorrectParticipantNamesOutput = z.infer<typeof ValidateAndCorrectParticipantNamesOutputSchema>;

export async function validateAndCorrectParticipantNames(
  input: ValidateAndCorrectParticipantNamesInput
): Promise<ValidateAndCorrectParticipantNamesOutput> {
  return validateAndCorrectParticipantNamesFlow(input);
}

const participantNameValidationPrompt = ai.definePrompt({
  name: 'participantNameValidationPrompt',
  input: {schema: ValidateAndCorrectParticipantNamesInputSchema},
  output: {schema: ValidateAndCorrectParticipantNamesOutputSchema},
  prompt: `You are an AI assistant specialized in validating and correcting participant names for certificates.

You will receive a list of participant names. For each name, you will determine if it is valid and correct any minor spelling errors.

Output an array of JSON objects, each containing the original name, the corrected name (if any correction was needed, otherwise the original name), a boolean indicating whether the name is valid, and a reasoning behind the decision.

Consider the following:
- Correct minor spelling errors (e.g., "Jonh" to "John").
- If the name is clearly not a valid name (e.g., contains gibberish, is too short, or contains profanity), mark it as invalid and provide a reason.
- Do not make changes that alter the name significantly.

Input Names:
{{#each this}}
- Name: {{this.name}}
{{/each}}`,
});

const validateAndCorrectParticipantNamesFlow = ai.defineFlow(
  {
    name: 'validateAndCorrectParticipantNamesFlow',
    inputSchema: ValidateAndCorrectParticipantNamesInputSchema,
    outputSchema: ValidateAndCorrectParticipantNamesOutputSchema,
  },
  async input => {
    const {output} = await participantNameValidationPrompt(input);
    return output!;
  }
);
