

import * as fs from 'fs'; 
import readline from 'readline';
import { BenchmarkJSON, unknownFunction } from '../src/interfaces';
import { validateHeaderName } from 'http';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getInput(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

export class Benchmarks {
  // accepts key of string that returns a BenchmarkJSON or a method
  [key: string]: BenchmarkJSON | unknownFunction;

  constructor() {
    const data = fs.readFileSync('benchmarking.json', 'utf-8');
    const parsedData = JSON.parse(data) as Benchmarks;
    this.validate(parsedData);
    Object.assign(this, parsedData);
  }

  private validate(data: unknown): void {
    if (typeof data !== 'object') {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const key in data) {
      if (key === 'OPD Sheet' || key === 'Calendar') {

        if (data[key]) {
          this.validateA(data[key]);
        }
      } else {
        throw new Error('Invalid key in benchmarking.json');
      }
    }
  }

  private validateA(data: unknown): void {
    if (typeof data !== 'object') {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const key in data) {
      if (key === 'Frontend' || key === 'Backend') {
        if (data[key]) {
          this.validateB(data[key]);
        }
      } 
    }
  }

  private validateB(data: unknown): void {
    if (typeof data !== 'object') {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const key in data) {
      if (data[key]) {
        this.validateC(data[key]);
      }
    }
  }

  private validateC(data: unknown): void {
    if (typeof data !== 'object') {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const key in data) {
      if (key === 'Raw') {
        if (data[key]) {
          this.validateD(data[key]);
        }
      } else if (key === 'Statistics') {
        if (data[key]) {
          this.validateE(data[key]);
        }
      } else {
        throw new Error('Invalid key in benchmarking.json');
      }
    }
  }

  private validateD(data: unknown): void {
    if (!Array.isArray(data)) {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const element of data) {
      if (typeof element !== 'object') {
        throw new Error('Invalid value in benchmarking.json');
      }
      for (const key in element) {
        if (typeof element[key] !== 'number') {
          throw new Error('Invalid value in benchmarking.json');
        }
      }
    }
  }

  private validateE(data: unknown): void {
    if (typeof data !== 'object') {
      throw new Error('Invalid value in benchmarking.json');
    }
    for (const key in data) {
      if (key === 'Mean Total' || key === 'Range Total') {
        if (typeof data[key] !== 'number') {
          throw new Error('Invalid value in benchmarking.json');
        }
        continue;
      }
      if (key === 'Mean Per Process' || key === 'Range Per Process') {
        if (typeof data[key] !== 'object') {
          throw new Error('Invalid value in benchmarking.json');
        }
        for (const innerKey in data[key]) {
          if (typeof data[key][innerKey] !== 'number') {
            throw new Error('Invalid value in benchmarking.json');
          }
        }
        continue;
      }
      throw new Error('Invalid key in benchmarking.json');
    }
  }    
}

function main(...args: string[]): void {
  console.log('Hello, world!');
  if (args[0] === 'record') {
    if (args.length === 2 && !isNaN(parseInt(args[1]))) {
      return record(parseInt(args[1]));
    }
    return record();
  }
  if (args.length > 1) {
    throw new Error('Too many arguments');
  }
  else {
    return stats();
  }
}

async function record(iterations = 5): void {
  console.log('Begging Benchmarking Log...');
  const benchmark = new Benchmarks();
  // ask for version number
  const version = await getInput('Enter the version number of the app: ');
  // if version already is recorded, as if you want to add or overwrite
  let overwrite = undefined;
  if (benchmark[version]) {
    const overwriteFunction = async () => {
      const overwritePropmt = await getInput('Version already exists. Overwrite? (y/n/exit): ');
      if (overwritePropmt === 'exit') {
        return 'exit';
      } else if (overwritePropmt === 'y') {
        overwrite = true;
        return 'y';
      } else if (overwritePropmt === 'n') {
        overwrite = false;
        return 'n';
      } else {
        console.log('Invalid input. Please enter y, n, or exit.');
        return '';
      }
    };
    let overwriteResult = await overwriteFunction();
    while (overwriteResult === '') {
      overwriteResult = await overwriteFunction();
    }
    if (overwriteResult === 'exit') {
      return;
    }
  }
  // start with opd sheet tests
  cosnt opdSheet = 
  // jump to proposals, log data for frontend and then backend

  // jump to projects, log data for frontend and then backend
  // repeat the number of iterations given
  // getInitiative from empty project, log data for frontend and then backend
  // getInitiative from empty Proposal, log data for frontend and then backend
  // getInitiative from project with all docs, log data for frontend and then backend
  // getInitiative from proposal with all docs, log data for frontend and then backend
  // getInitiative from project with no docs, log data for frontend and then backend
  // getInitiative from proposal with no docs, log data for frontend and then backend
  // generate Project from existing client, log data for frontend and then backend
  // delete the client and project reconciliation sheet
  // generate Project from new client, log data for frontend and then backend
  // delete the project reconciliation sheet
  // generate Proposal from existing client, log data for frontend and then backend
  // delete the client and proposal data
  // generate Proposal from new client, log data for frontend and then backend 
  // accept Proposal, log data for frontend and then backend
  // delete the proposal data and reconciliation sheet
  // repeat the number of iterations given
  // open changelog, log data for frontend and then backend
  // repeat the number of iterations given
  // start calendar tests
  // open changelog, log data for frontend and then backend
  // repeat the number of iterations given
  // getEvent from new event, log data for frontend and then backend
  // delete the event
  // getEvent from never loaded event with reconciliation sheet, log data for frontend and then backend
  // getEvent from never loaded event without reconciliation sheet, log data for frontend and then backend
  // getEvent from loaded event with reconciliation sheet, log data for frontend and then backend
  // getEvent from loaded event without reconciliation sheet, log data for frontend and then backend
  // refresh the calendar
  // repeat the number of iterations given
  // save the benchmarks
  // do stats on the data
  // pretty print the data
}

function stats(): void {
  console.log('Stats...');
}

function prettyPrint(): void {
  console.log('Pretty printing...');
}

// This is the main entry point for the program.
try {
  main(...process.argv.slice(2));
  rl.close();
} catch (error: unknown) {
  rl.close();
  console.error(error);
  process.exit(1);
}