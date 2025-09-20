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

export async function identifyPill(input: PillIdentificationInput): Promise<PillIdentificationOutput> {
  return identifyPillFlow(input);
}

const pillIdentificationPrompt = ai.definePrompt({
  name: 'pillIdentificationPrompt',
  input: {schema: PillIdentificationInputSchema},
  output: {schema: PillIdentificationOutputSchema},
  prompt: `You are a helpful assistant specialized in identifying medicine packages from images.

  Analyze the image and extract the medicine name and a brief, one-sentence description of its primary use. If you cannot identify the medicine, return an empty string for medicineName and usage.

  Also determine if the medicine is new to the inventory based on the existingMedicines list.

  Image: {{media url=photoDataUri}}
  Existing Medicines: {{existingMedicines}}`,
});

const identifyPillFlow = ai.defineFlow(
  {
    name: 'identifyPillFlow',
    inputSchema: PillIdentificationInputSchema,
    outputSchema: PillIdentificationOutputSchema,
  },
  async input => {
    const {output} = await pillIdentificationPrompt(input);

    const isNew = !input.existingMedicines?.includes(output!.medicineName);
    return {
      medicineName: output!.medicineName,
      usage: output!.usage,
      isNewMedicine: isNew,
    };
  }
);
