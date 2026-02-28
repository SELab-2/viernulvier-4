import fs from 'fs';
import csvParser from 'csv-parser';


export class CSVParser {
  /**
   * Parse a CSV file and return the data as an array of objects
   * @param filePath - Path to the CSV file
   * @returns Promise with parsed data or error
   */
  static async parseCSV(filePath: string) {
      const data: any[] = [];
      const errors: string[] = [];
      // standard seperator is comma so no need to specify it
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row: any) => {
          data.push(row);
        })
        .on('error', (error) => {
          errors.push(error.message);
        })
        .on('end', () => {
            console.log(data);
            console.log(errors);
        });
    };
    

}