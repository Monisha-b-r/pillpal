'use server';

/**
 * @fileOverview Prescription analysis AI agent.
 *
 * - analyzePrescription - A function that handles the prescription analysis process.
 * - AnalyzePrescriptionInput - The input type for the analyzePrescription function.
 * - AnalyzePrescriptionOutput - The return type for the analyzePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePrescriptionInputSchema = z.object({
  prescriptionImage: z
    .string()
    .describe(
      "A photo of a prescription, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePrescriptionInput = z.infer<typeof AnalyzePrescriptionInputSchema>;

const AnalyzePrescriptionOutputSchema = z.object({
  medicines: z.array(
    z.object({
      name: z.string().describe('The name of the medicine.'),
      dosage: z.string().describe('The dosage of the medicine.'),
      timing: z.string().describe('The timing of the medicine intake.'),
    })
  ).describe('A list of medicines found in the prescription.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrescriptionPrompt',
  input: {schema: AnalyzePrescriptionInputSchema},
  output: {schema: AnalyzePrescriptionOutputSchema},
  prompt: `You are an expert pharmacist. You will analyze the prescription image and extract the medicines, dosages, and timing for each medicine.

Some prescriptions use a notation like "0-0-1" or "1-0-1" to indicate timing. This format corresponds to "Morning-Afternoon-Night".
For example:
- "0-0-1" means one dose at night.
- "1-0-0" means one dose in the morning.
- "1-0-1" means one dose in the morning and one dose at night.
- "1-1-1" means one dose in the morning, one in the afternoon, and one at night.

Convert this notation into a human-readable timing instruction (e.g., "Once at night", "Once in the morning", "Morning and night").

Analyze the following prescription image:

{{media url=prescriptionImage}}

Return the output in JSON format.`,
});

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
