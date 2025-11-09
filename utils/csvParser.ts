
import type { Transaction } from '../types';

export const parseCSV = (csvText: string): Transaction[] => {
  const transactions: Transaction[] = [];
  const lines = csvText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    throw new Error("CSV file must have a header row and at least one data row.");
  }

  // Assume first line is the header
  const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const rows = lines.slice(1);

  const dateIndex = header.findIndex(h => h.includes('date'));
  const descriptionIndex = header.findIndex(h => h.includes('description') || h.includes('details') || h.includes('narrative'));
  const amountIndex = header.findIndex(h => h.includes('amount') || h.includes('value'));
  const debitIndex = header.findIndex(h => h.includes('debit') || h.includes('out'));
  const creditIndex = header.findIndex(h => h.includes('credit') || h.includes('in'));

  if (dateIndex === -1 || descriptionIndex === -1 || (amountIndex === -1 && (debitIndex === -1 || creditIndex === -1))) {
    throw new Error("Could not find required columns. Please ensure your CSV has headers like 'Date', 'Description', and 'Amount' (or 'Debit'/'Credit').");
  }

  rows.forEach(row => {
    // Basic CSV parsing, may not handle all edge cases like commas in quotes
    const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
    
    if (values.length >= header.length) {
      let amount = 0;
      if (amountIndex !== -1) {
          amount = parseFloat(values[amountIndex]);
      } else {
          const debit = parseFloat(values[debitIndex]) || 0;
          const credit = parseFloat(values[creditIndex]) || 0;
          // Outflows are often positive in debit columns or negative in a single amount column
          amount = -debit || credit;
      }
      
      // We only care about spending (outflows), which are negative values.
      if (!isNaN(amount) && amount < 0) {
        transactions.push({
          date: values[dateIndex],
          description: values[descriptionIndex],
          amount: Math.abs(amount), // Store spending as a positive number
        });
      }
    }
  });

  if (transactions.length === 0) {
    throw new Error("No spending transactions could be found in the uploaded file.");
  }

  return transactions;
};
