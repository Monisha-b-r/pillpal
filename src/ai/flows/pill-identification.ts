'use server';

/**
 * @fileOverview Pill identification flow.
 *
 * - identifyPill - A function that handles the pill identification process.
 * - PillIdentificationInput - The input type for the identifyPill function.
 * - PillIdentificationOutput - The return type for the identifyPill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PillIdentificationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the medicine package, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
  existingMedicines: z.array(z.string()).optional().describe('A list of existing medicine names in the inventory.'),
});
export type PillIdentificationInput = z.infer<typeof PillIdentificationInputSchema>;

const PillIdentificationOutputSchema = z.object({
  medicineName: z.string().describe('The identified name of the medicine.'),
  usage: z.string().describe('A brief description of what the medicine is used for.'),
  isNewMedicine: z.boolean().describe('Whether this medicine is new to the inventory or not.'),
});
export type PillIdentificationOutput = z.infer<typeof PillIdentificationOutputSchema>;

const identifyPillPrompt = ai.definePrompt({
  name: 'pillIdentificationPrompt',
  input: {schema: PillIdentificationInputSchema},
  output: {schema: PillIdentificationOutputSchema},
  prompt: `You are a helpful assistant specialized in identifying medicine packages from images.

Analyze the image to extract the medicine's brand name and a brief, one-sentence description of its primary use. If you cannot identify the medicine, return an empty string for both medicineName and usage.

Based on the user's list of existing medicines, determine if the scanned medicine is new. A medicine is considered new if its name is not in the 'existingMedicines' list. Set the 'isNewMedicine' field to true if it is new, and false otherwise.

Image: {{media url=photoDataUri}}
Existing Medicines: {{#if existingMedicines}}{{#each existingMedicines}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}`,
});

const identifyPillFlow = ai.defineFlow(
  {
    name: 'identifyPillFlow',
    inputSchema: PillIdentificationInputSchema,
    outputSchema: PillIdentificationOutputSchema,
  },
  async input => {
    const {output} = await identifyPillPrompt(input);
    return output!;
  }
);

export async function identifyPill(input: PillIdentificationInput): Promise<PillIdentificationOutput> {
  return identifyPillFlow(input);
}
