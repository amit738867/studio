'use server';

import {
  validateAndCorrectParticipantNames,
  type ValidateAndCorrectParticipantNamesInput,
} from '@/ai/flows/validate-and-correct-participant-names';
import { z } from 'zod';

const FormSchema = z.object({
  csvFile: z.instanceof(File),
  nameColumn: z.string(),
  emailColumn: z.string(),
});

type ParticipantData = { name: string; email: string };

function parseCsvAndExtractColumns(csvContent: string, nameColumn: string, emailColumn: string): ParticipantData[] | { error: string } {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 1) {
        return { error: 'The CSV file appears to be empty.' };
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const nameIndex = headers.indexOf(nameColumn);
    const emailIndex = headers.indexOf(emailColumn);

    if (nameIndex === -1) {
        return { error: `Column '${nameColumn}' not found. Available columns: ${headers.join(', ')}` };
    }
    if (emailIndex === -1) {
        return { error: `Column '${emailColumn}' not found. Available columns: ${headers.join(', ')}` };
    }
    if (nameIndex === emailIndex) {
        return { error: 'Name and Email columns cannot be the same.' };
    }


    return lines.slice(1).map(line => {
        // This is a naive parser and will not handle commas inside quoted strings correctly.
        const cells = line.split(',');
        return {
            name: cells[nameIndex]?.trim() || '',
            email: cells[emailIndex]?.trim() || '',
        }
    }).filter(p => p.name && p.email);
}


export async function validateParticipantsAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = FormSchema.safeParse({
    csvFile: formData.get('csvFile'),
    nameColumn: formData.get('nameColumn'),
    emailColumn: formData.get('emailColumn'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: 'Invalid form data. Please provide a file and select columns for name and email.',
    };
  }

  const { csvFile, nameColumn, emailColumn } = validatedFields.data;

  if (csvFile.size === 0) {
    return { ...prevState, error: 'The uploaded file is empty.' };
  }

  try {
    const csvContent = await csvFile.text();
    const participantsOrError = parseCsvAndExtractColumns(csvContent, nameColumn, emailColumn);

    if (typeof participantsOrError === 'object' && 'error' in participantsOrError) {
      return { ...prevState, error: participantsOrError.error };
    }
    const participants = participantsOrError;

    if (participants.length === 0) {
      return { ...prevState, error: 'No participants with both name and email found in the selected columns.' };
    }

    const validationInput: ValidateAndCorrectParticipantNamesInput = participants.map((p) => ({ name: p.name }));
    const validationResults = await validateAndCorrectParticipantNames(validationInput);

    const combinedResults = validationResults.map((result, index) => ({
      ...result,
      email: participants[index].email,
    }));


    return { results: combinedResults, error: null };
  } catch (e) {
    console.error(e);
    return { ...prevState, error: 'An unexpected error occurred during validation.' };
  }
}
