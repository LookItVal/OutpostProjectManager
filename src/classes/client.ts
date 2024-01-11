import { ValidationError } from './errors';
import { ClientParams, Initiative } from '../interfaces';
import { properties, regexJobName, regexProposalName } from '../constants';
import { Project, Proposal } from './initiatives';

interface ClientExports {
    ValidationError: typeof ValidationError;
    properties: typeof properties;
    regexJobName: typeof regexJobName;
    regexProposalName: typeof regexProposalName;
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
    if (!name && !folder) {
      throw new exports.ValidationError('Client must have a name or a folder');
    }
    if (folder) {
      this._folder;
    }
    if (name) {
      this._name;
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
    return this._folder;
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
    for (const client of clients) {
      let initArchive: GoogleAppsScript.Drive.Folder | undefined = undefined;
      const search = client.folder?.getFoldersByName('JAN 2024 ARCHIVE');
      if (!search?.hasNext()) {
        initArchive = client.folder?.createFolder('JAN 2024 ARCHIVE');
      } else {
        initArchive = search?.next() as GoogleAppsScript.Drive.Folder;
      }
      if (!initArchive) {
        throw new Error('Could not create or find JAN 2024 ARCHIVE folder');
      }
      const archiveFolder = initArchive as GoogleAppsScript.Drive.Folder;
      const folders = client.folder?.getFolders() as GoogleAppsScript.Drive.FolderIterator;
      while (folders.hasNext()) {
        const folder = folders.next();
        if (folder.getName() === 'JAN 2024 ARCHIVE') {
          continue;
        }
        if (exports.regexJobName.test(folder.getName()) || exports.regexProposalName.test(folder.getName())) {
          continue;
        }
        folder.moveTo(archiveFolder);
      }
      const files = client.folder?.getFiles() as GoogleAppsScript.Drive.FileIterator;
      while(files.hasNext()) {
        const file = files.next();
        if (exports.regexJobName.test(file.getName()) || exports.regexProposalName.test(file.getName())) {
          const initiativeId = file.getName().split(' ').slice(0, 2).join(' ');
          const checkFolders = client.folder?.getFolders();
          let breakLoop = false;
          while (checkFolders?.hasNext()) {
            const folder = folders.next();
            if (folder.getName().startsWith(initiativeId)) {
              file.moveTo(folder);
              breakLoop = true;
              break;
            }
          }
          if (breakLoop) {
            continue;
          }
        }
        file.moveTo(archiveFolder);
      }
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