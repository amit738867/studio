'use server';

import {
  validateAndCorrectParticipantNames,
  type ValidateAndCorrectParticipantNamesInput,
} from '@/ai/flows/validate-and-correct-participant-names';
import { z } from 'zod';

const FormSchema = z.object({
  csvFile: z.instanceof(File),
  nameColumn: z.string(),
});

function parseCsvAndExtractColumn(csvContent: string, columnName: string): string[] | { error: string } {
    const lines = csvContent.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 1) {
        return { error: 'The CSV file appears to be empty.' };
    }
    const headers = lines[0].split(',').map(h => h.trim());
    const columnIndex = headers.indexOf(columnName);

    if (columnIndex === -1) {
        return { error: `Column '${columnName}' not found. Available columns: ${headers.join(', ')}` };
    }

    return lines.slice(1).map(line => {
        // This is a naive parser and will not handle commas inside quoted strings correctly.
        const cells = line.split(',');
        return cells[columnIndex]?.trim() || '';
    }).filter(Boolean);
}


export async function validateNamesAction(
  prevState: any,
  formData: FormData
) {
  const validatedFields = FormSchema.safeParse({
    csvFile: formData.get('csvFile'),
    nameColumn: formData.get('nameColumn'),
  });

  if (!validatedFields.success) {
    return {
      ...prevState,
      error: 'Invalid form data. Please provide a file and select a column.',
    };
  }

  const { csvFile, nameColumn } = validatedFields.data;

  if (csvFile.size === 0) {
    return { ...prevState, error: 'The uploaded file is empty.' };
  }

  try {
    const csvContent = await csvFile.text();
    const namesOrError = parseCsvAndExtractColumn(csvContent, nameColumn);

    if (typeof namesOrError === 'object' && 'error' in namesOrError) {
      return { ...prevState, error: namesOrError.error };
    }
    const names = namesOrError;

    if (names.length === 0) {
      return { ...prevState, error: 'No names found in the selected column.' };
    }

    const input: ValidateAndCorrectParticipantNamesInput = names.map((name) => ({ name }));
    const results = await validateAndCorrectParticipantNames(input);

    return { results, error: null };
  } catch (e) {
    console.error(e);
    return { ...prevState, error: 'An unexpected error occurred during validation.' };
  }
}
