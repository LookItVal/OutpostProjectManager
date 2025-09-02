import { ValidationError } from './errors';
import { ClientParams, Initiative } from '../interfaces';
import { properties, regexJobName, regexProposalName, spreadsheet } from '../constants';
import { Project, Proposal } from './initiatives';

interface ClientExports {
    ValidationError: typeof ValidationError;
    properties: typeof properties;
    regexJobName: typeof regexJobName;
    regexProposalName: typeof regexProposalName;
    spreadsheet: typeof spreadsheet;
    Project: typeof Project;
    Proposal: typeof Proposal;
}
declare const exports: ClientExports;

export class Client {
    
  protected _name?: string;
  protected _folder?: GoogleAppsScript.Drive.Folder | undefined;
  protected _initiatives?: Initiative[];
  protected _projects?: Project[];
  protected _proposals?: Proposal[];

  constructor({name = '', folder = undefined}: ClientParams) {
    const params: ClientParams = {name, folder};
    this.validateParams(params);
    // why is this here?
    if (!name && !folder) {
      throw new exports.ValidationError('Client must have a name or a folder');
    }
    if (folder) {
      this._folder = folder;
    }
    if (name) {
      this._name = name;
    }
  }

  /////////////////////////////////////////////
  //            Static Properties            //
  /////////////////////////////////////////////

  public static get clientFolder(): GoogleAppsScript.Drive.Folder {
    const folderId: string = exports.properties.getProperty('clientFolderId') ?? '';
    const folder: GoogleAppsScript.Drive.Folder = DriveApp.getFolderById(folderId);
    return folder;
  }

  public static get clientNames(): string[] {
    if (!exports.spreadsheet) {
      throw new ReferenceError('Spreadsheet is not defined');
    }
    const sheet = exports.spreadsheet.getSheetByName('Clients');
    if (!sheet) {
      throw new ReferenceError('Clients sheet is not defined');
    }
    const data = sheet.getDataRange().getValues();
    const names: string[] = [];
    for (let i = 1; i < data.length; i++) {
      const name = data[i][0];
      if (name) {
        names.push(name.toString());
      }
    }
    return names;
  }

  /////////////////////////////////////////////
  //          Immutable Properties           //
  /////////////////////////////////////////////
    

  public get name(): string {
    if (this._name) {
      return this._name;
    }
    if (this._folder) {
      this._name = this._folder.getName();
    }
    return this._name ?? '';
  }

  public get folder(): GoogleAppsScript.Drive.Folder | undefined {
    if (this._folder) {
      return this._folder;
    }
    if (this._name) {
      const folders = Client.clientFolder.getFoldersByName(this._name);
      if (folders.hasNext()) {
        this._folder = folders.next();
        return this._folder;
      }
    }
    return undefined;
  }

  public get initiatives(): Initiative[] {
    if (this._initiatives) {
      return this._initiatives;
    }
    this._initiatives = [];
    const folders = this.folder?.getFolders();
    while (folders?.hasNext()) {
      const folder = folders.next();
      if (folder.getName() === '2024 ARCHIVE') {
        continue;
      }
      const initiative = exports.Project.getInitiative({folder});
      this._initiatives.push(initiative);
    }
    return this._initiatives;
  }

  public get projects() : Project[] {
    if (this._projects) {
      return this._projects;
    }
    this._projects = [];
    for (const initiative of this.initiatives ?? []) {
      if (initiative.type === 'PROJECT') {
        this._projects.push(initiative as Project);
      }
    }
    return this._projects;
  }

  public get proposals() : Proposal[] {
    if (this._proposals) {
      return this._proposals;
    }
    this._proposals = [];
    for (const initiative of this.initiatives ?? []) {
      if (initiative.type === 'PROPOSAL') {
        this._proposals.push(initiative as Proposal);
      }
    }
    return this._proposals;
  }

  /////////////////////////////////////////////
  //              Public Methods             //
  /////////////////////////////////////////////
  public isNew(): boolean {
    if (!this.folder) {
      return true;
    }
    return false;
  }

  public makeFolder(): GoogleAppsScript.Drive.Folder {
    if (this.folder) {
      throw new exports.ValidationError('Client already has a folder');
    }
    this._folder = Client.clientFolder.createFolder(this.name);
    const sheet = exports.Project.dataSpreadsheet.getSheetByName('Clients') as GoogleAppsScript.Spreadsheet.Sheet;
    sheet.appendRow([this.name, this._folder?.getId() ?? '']);
    return this._folder;
  }

  public deleteClient(): void {
    if (this.folder?.getFiles().hasNext()) {
      throw new exports.ValidationError('Client folder is not empty');
    }
    if (this.folder?.getFolders().hasNext()) {
      throw new exports.ValidationError('Client folder is not empty');
    }
    if (!exports.spreadsheet) {
      throw new ReferenceError('Spreadsheet is not defined');
    }
    this.folder?.setTrashed(true);
    const clientSheet = exports.spreadsheet.getSheetByName('Clients');
    if (!clientSheet) {
      throw new ReferenceError('Clients sheet is not defined');
    }
    const data = clientSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === this.name) {
        clientSheet.deleteRow(i + 1);
        break;
      }
    }
  }

  /////////////////////////////////////////////
  //             Static Methods              //
  /////////////////////////////////////////////

  public static getClients(): Client[] {
    const clientFolders = Client.clientFolder.getFolders();
    const clients: Client[] = [];
    while (clientFolders.hasNext()) {
      const client = clientFolders.next();
      clients.push(new Client({folder: client}));
    }
    return clients;
  }

  public static cleanClientFiles(): void {
    const clients = Client.getClients();
    console.warn('BEGINING CLEANING PROCESS');
    for (const client of clients) {
      console.count(`Working on Client: ${client.name}\n Number of Clients Found:`);
      let initArchive: GoogleAppsScript.Drive.Folder | undefined = undefined;
      const search = client.folder?.getFoldersByName('JAN 2024 ARCHIVE');
      if (!search?.hasNext()) {
        console.info('the archive folder has generated for this client', client.name);
        initArchive = client.folder?.createFolder('JAN 2024 ARCHIVE');
      } else {
        console.info('the archive folder has been found for this client', client.name);
        initArchive = search?.next() as GoogleAppsScript.Drive.Folder;
      }
      if (!initArchive) {
        console.error('Could not create or find JAN 2024 ARCHIVE folder');
      }
      const archiveFolder = initArchive as GoogleAppsScript.Drive.Folder;
      const folders = client.folder?.getFolders() as GoogleAppsScript.Drive.FolderIterator;
      while (folders.hasNext()) {
        const folder = folders.next();
        console.count(`Working on Client: ${client.name} \nFolder: ${folder.getName()} \nNumber of Folders Found in ${client.name}:`);
        if (folder.getName() === 'JAN 2024 ARCHIVE') {
          console.info('skipping archive folder');
          continue;
        }
        if (exports.regexJobName.test(folder.getName()) || exports.regexProposalName.test(folder.getName())) {
          console.info('Skipping initiative folder');
          continue;
        }
        console.info('Moving folder to archive');
        folder.moveTo(archiveFolder);
      }
      const files = client.folder?.getFiles() as GoogleAppsScript.Drive.FileIterator;
      console.info('Moving files to archive');
      while(files.hasNext()) {
        const file = files.next();
        console.count(`Working on Client: ${client.name} \nFile: ${file.getName()} \nNumber of Files Found in ${client.name}:`);
        if (exports.regexJobName.test(file.getName()) || exports.regexProposalName.test(file.getName())) {
          console.info('looking for folder to move file to');
          const initiativeId = file.getName().split(' ').slice(0, 2).join(' ');
          const checkFolders = client.folder?.getFolders();
          let breakLoop = false;
          while (checkFolders?.hasNext()) {
            const folder = checkFolders.next();
            if (folder.getName().startsWith(initiativeId)) {
              console.info('Found folder to move file to');
              file.moveTo(folder);
              breakLoop = true;
              break;
            }
          }
          if (breakLoop) {
            continue;
          }
          console.info('Did not find folder to move file to');
        }
        console.info('Moving file to archive');
        file.moveTo(archiveFolder);
      }
    }
    logFileStructure();
  }

  // this function will update the client list in the data spreadsheet
  // this function currently does not check for duplicate client names
  // it should before it is ever run again.
  public static updateOPDClientList(): void {
    const clients = Client.getClients();
    const spreadsheet = exports.Project.dataSpreadsheet;
    const sheet = spreadsheet.getSheetByName('Clients') as GoogleAppsScript.Spreadsheet.Sheet;
    // get data from sheet
    for (const client of clients) {
      console.log('WORKING ON CLIENT:', client.name);
      const clientNames = sheet.getRange('A:A').getValues().map(row => row[0]);
      console.log('    LOOKING FOR CLIENT IN SHEET:', clientNames);
      const clientRow = clientNames.indexOf(client.name) + 1;
      if (clientRow === 0) {
        console.log('    CLIENT NOT FOUND IN SHEET');
        console.log('    ADDING CLIENT TO SHEET');
        sheet.appendRow([client.name, client.folder?.getId() ?? '']);
        continue;
      }
      if (clientRow === 1) {
        throw new Error('Client row is 1');
      }
      console.log('    CLIENT FOUND IN SHEET');
      console.log('    CHECKING CLIENT FOLDER ID');
      const clientFolderId = sheet.getRange(clientRow, 2).getValue() as string;
      if (clientFolderId === client.folder?.getId()) {
        console.log('    CLIENT FOLDER ID MATCHES');
        continue;
      }
      console.log('    CLIENT FOLDER ID DOES NOT MATCH');
      console.log('    UPDATING CLIENT FOLDER ID');
      sheet.getRange(clientRow, 2).setValue(client.folder?.getId() ?? '');
    }
    console.log('CLIENT LIST UPDATE COMPLETE');
    console.log('CHECKING THROUGH SHEET');
    const data = sheet.getDataRange().getValues();
    for (const row of data) {
      console.log('WORKING ON ROW:', row, row[0]);
      if (row[0] === 'Client Name') {
        console.log('    ROW IS HEADER');
        continue;
      }
      if (row[0] === '') {
        console.log('    ROW IS EMPTY');
        continue;
      }
      console.log('    CHECKING NAME OF FOLDER');
      if (row[1] === '') {
        console.warn('    ROW HAS NO FOLDER ID');
        continue;
      }
      try {
        if (DriveApp.getFolderById(row[1]).getName() === row[0]) {
          console.log('    NAME OF FOLDER MATCHES');
          continue;
        }
      }
      catch (e: unknown) {
        console.warn('    FOLDER ID IS INVALID', e);
        continue;
      }
      console.error('    NAME OF FOLDER DOES NOT MATCH');
    }
  }

  /////////////////////////////////////////////
  //             Private Methods             //
  /////////////////////////////////////////////

  private validateParams({name, folder}: ClientParams): void {
    if (!name && !folder) {
      throw new exports.ValidationError('Client must have a name or a folder');
    }
    if (name && folder) {
      throw new exports.ValidationError('Client cannot have both a name and a folder');
    }
    if (name && typeof name !== 'string') {
      throw new exports.ValidationError('Client name must be a string');
    }
  }
}

export function cleanClientFiles(): void {
  Client.cleanClientFiles();
}

export function updateOPDClientList(): void {
  Client.updateOPDClientList();
}

//take the array of clients and recursively go through every fild and folder in the client folder
function logFileStructure(): void {
  const clients = Client.getClients();
  console.warn('LOGGING FILE STRUCTURE');
  for (const client of clients) {
    console.info('CLIENT:', client.name);
    const folders = client.folder?.getFolders();
    while (folders?.hasNext()) {
      const folder = folders.next();
      console.info('FOLDER:', folder.getName());
      const subFolders = folder.getFolders();
      while (subFolders?.hasNext()) {
        const subFolder = subFolders.next();
        console.info('SUBFOLDER:', subFolder.getName());
      }
      const files = folder.getFiles();
      while (files?.hasNext()) {
        const file = files.next();
        console.info('FILE:', file.getName());
      }
    }
    const files = client.folder?.getFiles();
    while (files?.hasNext()) {
      const file = files.next();
      console.info('FILE:', file.getName());
    }
  }
}