//import the module
import { readFile, writeFile } from 'node:fs/promises';
import { EOL } from 'node:os';

//interface that can write menu content. = fs.writefile.
interface IWritable {
  write(menuStr: string): Promise<void>;
  menuContent(menuStr: string[]): string;
}

//Menu data parsing
class CsvMenuParser {
  private _csvData: string[] = [];
  
  private constructor(data: string[]) {
    this._csvData = data;
  }

  //static method : method belongs to class, can call method itself rather than creating an instance
  //instance : specific object created from class ex) const myMenu = new buildMenu('menu.csv'); 

  //static method that read menu.csv and split each line
  static async buildMenu(filename: string) {
    const data = await readFile(filename, "utf8");
    return new CsvMenuParser(data.split(EOL));
  }
  //async method takes writefile from IWritable  
  async writeMenu(writer: IWritable) {
    const content = writer.menuContent(this._csvData)
    writer.write(content)
  }
  //return the raw CSV data
  getMenuData() {
    return this._csvData;
  }
}

//rewrite the menu to html file format.
class HtmlWriter implements IWritable {
 //menu data type 
 menuContent(csvData: string[]) {
  const mealDataMap: { [key: string]: string[][] } = {};

  // Loop through each csvData
  for (let i = 0; i < csvData.length; i++) {
      const data = csvData[i].split(',');
      const mealType = data[0];

      // Create an array Key: mealType, value: data
      if (!mealDataMap[mealType]) {
          mealDataMap[mealType] = [];
      }

      mealDataMap[mealType].push(data);
  }

  let myMenu = '';

  // Loop through each meal type in the mealDataMap
  for (const mealType in mealDataMap) {
      if (mealDataMap.hasOwnProperty(mealType)) {

          // Create an HTML table for each meal type
          myMenu += `
              <table border='1'>
                  <tr>
                      <th scope='col'>${mealDataMap[mealType][0][0] + ' Items'}</th>
                  </tr>
          `;

          // Loop through each data entry for the current meal type and add rows to the table
          for (let i = 0; i < mealDataMap[mealType].length; i++) {
              myMenu += `
                  <tr>
                      <td>${mealDataMap[mealType][i][3]}, ${mealDataMap[mealType][i][1]}, ${mealDataMap[mealType][i][2]}</td>
                  </tr>
              `;
          }

          // Close the table tag
          myMenu += `
              </table>
          `;
      }
  }

  // Return the generated HTML
  return myMenu;
}

  async write(menuStr: string) {
    return await writeFile('menu.html', menuStr);
  }
}

//rewrite the menu to txt format.
class TextWriter implements IWritable {
  menuContent(csvData: string[]) {
      const mealDataMap: { [key: string]: string[][] } = {};

      // Loop through each csvData
      for (let i = 0; i < csvData.length; i++) {
          const data = csvData[i].split(',');
          const mealType = data[0];

          // Create an array Key: mealType, value: data
          if (!mealDataMap[mealType]) {
              mealDataMap[mealType] = [];
          }

          mealDataMap[mealType].push(data);
      }

      let myMenu = '';

      // Loop through each meal type in the mealDataMap
      for (const mealType in mealDataMap) {
          if (mealDataMap.hasOwnProperty(mealType)) {

              // Create a formatted text representation for each meal type
              myMenu += ` 
              * ${mealDataMap[mealType][0][0] + ' Items'} *\n
              `;

              // Loop through each data entry for the current meal type and add formatted text to the result
              for (let i = 0; i < mealDataMap[mealType].length; i++) {
                  myMenu += `
                  ${mealDataMap[mealType][i][3]}, ${mealDataMap[mealType][i][1]}, ${mealDataMap[mealType][i][2]}
                  `;
              }
          }
      }
      return myMenu;
  }

  async write(menuStr: string) {
      return await writeFile('menu.txt', menuStr);
  }
}


async function main() {
  const menu = await CsvMenuParser.buildMenu('menu.csv');
  menu.writeMenu(new HtmlWriter())
  menu.writeMenu(new TextWriter())
}
main();