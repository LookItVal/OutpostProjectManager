import { ValidationError } from './errors';
import { spreadsheet, properties, regex4Digits, regexJobName, regexProposalName, regexProposalOpen, regexPullDigits, regexGetIdFromProjectName } from '../constants';
import { Client } from './client';
import { InitiativeParams, ProjectNameArray, ProposalNameArray, SerializedData } from '../interfaces';
import { User } from './user';

interface InitiativesExport {
    ValidationError: typeof ValidationError;
    spreadsheet: typeof spreadsheet;
    properties: typeof properties;
    regex4Digits: typeof regex4Digits;
    regexJobName: typeof regexJobName;
    regexProposalName: typeof regexProposalName;
    regexProposalOpen: typeof regexProposalOpen;
    regexPullDigits: typeof regexPullDigits;
    regexGetIdFromProjectName: typeof regexGetIdFromProjectName;
    Client: typeof Client;
    User: typeof User;
}
declare const exports: InitiativesExport;

export abstract class Initiative {
    [key: string]: string | number | object | undefined;

    public title: string;
    public abstract type: 'PROJECT' | 'PROPOSAL';

    protected abstract _id?: string;
    protected _yrmo?: string;
    protected _clientName?: string;
    protected _client?: Client;
    protected _projectName?: string;
    protected _creationDate?: Date;
    protected _producer?: string;
    protected _folder?: GoogleAppsScript.Drive.Folder;
    protected _folderId?: string;
    protected _dataSheet?: GoogleAppsScript.Spreadsheet.Sheet;
    protected _rowNumber?: number;
    protected _proposalDocumentId?: string;
    protected _proposalDocument?: GoogleAppsScript.Drive.File;
    protected _costingSheetId?: string;
    protected _costingSheet?: GoogleAppsScript.Drive.File;

    constructor ({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams) {
      if (new.target === Initiative) {
        throw new TypeError('Cannot construct Abstract instances directly');
      }
      if (serializedData) {
        throw new exports.ValidationError('Serialized Data is currently not supported');
      }
      if (serializedData) {
        // TODO perform validation at each step
        if (serializedData['title']) {
          this.title = serializedData['title'] as string;
        } else {
          throw new exports.ValidationError('Serialized Data must contain a title');
        }
        if (serializedData['yrmo']) {
          this._yrmo = serializedData['yrmo'] as string;
        }
        if (serializedData['clientName']) {
          this._clientName = serializedData['clientName'] as string;
        }
        if (serializedData['projectName']) {
          this._projectName = serializedData['projectName'] as string;
        }
        if (serializedData['creationDate']) {
          this._creationDate = new Date(serializedData['creationDate'] as string);
        }
        if (serializedData['producer']) {
          this._producer = serializedData['producer'] as string;
        }
        if (serializedData['folderId']) {
          this._folderId = serializedData['folderId'] as string;
        }
        if (serializedData['proposalDocumentId']) {
          this._proposalDocumentId = serializedData['proposalDocumentId'] as string;
        }
        if (serializedData['costingSheetId']) {
          this._costingSheetId = serializedData['costingSheetId'] as string;
        }
        if (serializedData['rowNumber']) {
          this._rowNumber = Number(serializedData['rowNumber']) as number;
        }
        return;
      }
      if (name) {
        this.title = name;
        return;
      }
      if (nameArray) {
        this.title = `${nameArray[0]} ${nameArray[1]} ${nameArray[2]} ${nameArray[3]}`;
        this._clientName = nameArray[2];
        this._projectName = nameArray[3];
        return;
      }
      if (folder) {
        this._folder = folder;
        this._folderId = folder.getId();
        this.title = folder.getName();
        return;
      }
      throw new exports.ValidationError('Initiative must be initialized with a name, nameArray, folder, or serializedData');
    }

    /////////////////////////////////////////////
    //            Static Properties            //
    /////////////////////////////////////////////

    public static get dataSpreadsheet (): GoogleAppsScript.Spreadsheet.Spreadsheet {
      const dataSpreadsheetId = exports.properties.getProperty('projectDataSpreadsheetId') as string;
      if (exports.spreadsheet?.getId() === dataSpreadsheetId) {
        return exports.spreadsheet;
      }
      const projectDataSheetId = dataSpreadsheetId;
      return SpreadsheetApp.openById(projectDataSheetId);
    }

    /////////////////////////////////////////////
    //          Immutable Properties           //
    /////////////////////////////////////////////

    abstract get dataSheet (): GoogleAppsScript.Spreadsheet.Sheet;

    abstract get rowNumber (): number;

    abstract get yrmo (): string;

    public get clientName (): string {
      if (this._clientName) {
        return this._clientName;
      }
      const clientProject: string = this.title.split(' ').slice(2).join(' ');
      // would i define the client to be the Client class?
      const clientNames: string[] = exports.Client.getClients().map(client => client.name);
      for (const client of clientNames) {
        if (clientProject.includes(client)) {
          this._clientName = client;
          return client;
        }
      }
      // Do something here if there is no client in the list with this name
      // actually this is kinda weird casue if there is no client in the list than there is no way to prove what the client name is
      // if you try to do something with the client name and you cant get it something is very wrong already.
      throw new ReferenceError('Client Name not found in list of clients');
    }

    public get client(): Client {
      if (this._client && Object.keys(this._client).length !== 0) {
        return this._client;
      }
      console.info('Making client from name:', this.clientName);
      this._client = new exports.Client({ name: this.clientName });
      return this._client;
    }

    public get projectName (): string {
      if (this._projectName) {
        return this._projectName;
      }
      const clientProject: string = this.title.split(' ').slice(2).join(' ');
      if (!this.clientName) {
        throw new exports.ValidationError('Cannot get Project Name without Client Name');
      }
      this._projectName = clientProject.replace(this.clientName, '').trim();
      return this._projectName;
    }

    public get folder (): GoogleAppsScript.Drive.Folder | undefined {
      if (this._folder) {
        return this._folder;
      }
      if (this._folderId) {
        this._folder = DriveApp.getFolderById(this._folderId);
        return this._folder;
      }

      // find folder by name
      if (!this.client.folder) {
        console.warn('Trying to find Client Folder:', this.client.folder);
        console.info('Client info:', this.client);
        return undefined;
      }
      const folders = this.client.folder.getFoldersByName(this.title);
      
      if (!folders.hasNext()) {
        return undefined;
      }
      this._folder = this.client.folder.getFoldersByName(this.title).next();
      this._folderId = this._folder.getId();
      return this._folder;
    }

    public get proposalDocumentId (): string | undefined {
      if (this._proposalDocumentId) {
        return this._proposalDocumentId; 
      }
      if (!this.folder) {
        return undefined;
      }
      const search = this.folder.getFilesByName(`${this.yrmo} ${this.clientName} ${this.projectName} Proposal`);
      if (!search.hasNext()) {
        return undefined;
      }
      this._proposalDocumentId = search.next().getId();
      return this._proposalDocumentId;
    }

    public get costingSheetId (): string | undefined {
      if (this._costingSheetId) {
        return this._costingSheetId;
      }
      if (!this.folder) {
        console.warn('Trying to find folder:', this.folder);
        return undefined;
      }
      const search = this.folder.getFilesByName(`${this.yrmo} ${this.clientName} ${this.projectName} Costing Sheet`);
      if (!search.hasNext()) {
        return undefined;
      }
      this._costingSheetId = search.next().getId();
      return this._costingSheetId;
    }

    /////////////////////////////////////////////
    //           Mutable Properties            //
    /////////////////////////////////////////////

    public get creationDate (): Date | undefined {
      if (this._creationDate) {
        return this._creationDate;
      }
      const data = this.dataSheet.getDataRange().getValues()[0];
      const creationDateColumn = data.indexOf('CREATION DATE') + 1;
      this._creationDate = this.dataSheet.getRange(this.rowNumber, creationDateColumn).getValue();
      return this._creationDate;
    }

    public set creationDate (date: Date) {
      this._creationDate = date;
      const data = this.dataSheet.getDataRange().getValues()[0];
      const creationDateColumn = data.indexOf('CREATION DATE') + 1;
      this.dataSheet.getRange(this.rowNumber, creationDateColumn).setValue(date);
    }

    public get producer (): string | undefined {
      if (this._producer) {
        return this._producer;
      }
      const data = this.dataSheet.getDataRange().getValues()[0];
      const producerColumn = data.indexOf('PRODUCER') + 1;
      this._producer = this.dataSheet.getRange(this.rowNumber, producerColumn).getValue();
      return this._producer;
    }

    public set producer (producer: string) {
      this._producer = producer;
      const data = this.dataSheet.getDataRange().getValues()[0];
      const producerColumn = data.indexOf('PRODUCER') + 1;
      this.dataSheet.getRange(this.rowNumber, producerColumn).setValue(producer);
    }

    /////////////////////////////////////////////
    //              Static Methods             //
    /////////////////////////////////////////////

    public static getInitiative({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams = {}): Project | Proposal {
      if (!name && !nameArray && !folder && !serializedData) {
        if (exports.spreadsheet?.getId() === exports.properties.getProperty('projectDataSpreadsheetId')) {
          const sheet = exports.spreadsheet.getActiveSheet() as GoogleAppsScript.Spreadsheet.Sheet;
          const row = sheet.getActiveCell().getRow(); 
          const dataArray = [];
          if (sheet.getName() === 'Proposals') {
            if (row === 1) {
              throw new exports.ValidationError('Proposal Not Found: No Proposal Selected');
            }
            dataArray.push('PROPOSAL:');
            dataArray.push(sheet.getRange(`A${row}`).getDisplayValue());
            dataArray.push(sheet.getRange(`B${row}`).getDisplayValue());
            dataArray.push(sheet.getRange(`C${row}`).getDisplayValue());
          } else {
            if (row === 1) {
              throw new exports.ValidationError('Project Not Found: No Project Selected');
            }
            dataArray.push(sheet.getRange(`A${row}`).getDisplayValue());
            dataArray.push(sheet.getRange(`B${row}`).getDisplayValue());
            dataArray.push(sheet.getRange(`C${row}`).getDisplayValue()); 
            dataArray.push(sheet.getRange(`D${row}`).getDisplayValue());
            dataArray.push(sheet.getRange(`K${row}`).getDisplayValue());
          }
          if (dataArray.length < 4) {
            throw new exports.ValidationError('No Initiative Selected');
          }
          nameArray = dataArray as ProjectNameArray | ProposalNameArray;
        }
      }
      if (serializedData) {
        throw new exports.ValidationError('Serialized Data is currently not supported');
        /*
        if (serializedData['type'] === 'PROJECT') {
          return new Project({serializedData});
        }
        if (serializedData['type'] === 'PROPOSAL') {
          return new Proposal({serializedData});
        }
        throw new exports.ValidationError('Serialized Data must contain a type');
        */
      }
      if (name) {
        if (exports.regexProposalName.test(name)) {
          //if (exports.properties.getProperty(name)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(name) as string) });
          //}
          return new Proposal({name});
        }
        if (exports.regexJobName.test(name)) {
          //const id = name.match(exports.regexGetIdFromProjectName)?.[0].split(' ').join('') as string;
          //if (exports.properties.getProperty(id)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(id) as string) });
          //}
          return new Project({name});
        }
        throw new exports.ValidationError('Name does not match any known initiative types');
      }
      if (nameArray && nameArray.length > 1) {
        //let initiativeId = '';
        if (exports.regexProposalOpen.test(nameArray[0] as string)) {
          //initiativeId = `${nameArray[0]} ${nameArray[1]} ${nameArray[2]} ${nameArray[3]}`;
          //if (exports.properties.getProperty(initiativeId)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(initiativeId) as string) });
          //}
          return new Proposal({nameArray});
        }
        if (exports.regex4Digits.test(nameArray[1] as string)) {
          //initiativeId = nameArray[0]+nameArray[1];
          //if (exports.properties.getProperty(initiativeId)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(initiativeId) as string) });
          //}
          return new Project({nameArray});
        }
        throw new exports.ValidationError('Name Array does not match any known initiative types');
      }
      if (folder) {
        const folderName = folder.getName();
        if (exports.regexProposalName.test(folderName)) {
          //if (exports.properties.getProperty(folderName)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(folderName) as string) });
          //}
          return new Proposal({folder});
        }
        if (exports.regexJobName.test(folderName)) {
          //const id = folderName.match(exports.regexGetIdFromProjectName)?.[0].split(' ').join('') as string;
          //if (exports.properties.getProperty(id)) {
          //return Initiative.getInitiative({ serializedData: JSON.parse(exports.properties.getProperty(id) as string) });
          //}
          return new Project({folder});
        }
        throw new exports.ValidationError('Folder does not match any known initiative types');
      }
      throw new exports.ValidationError('Initiative must be initialized with a name, nameArray, folder, or serializedData');
    }

    /////////////////////////////////////////////
    //              Public Methods             //
    /////////////////////////////////////////////

    public serialize (): SerializedData {
      const initiative: SerializedData = {};
      !this.costingSheetId && console.warn('Trying to find the costing sheet:', this.costingSheetId);
      !this.proposalDocumentId && console.warn('Trying to find the proposal document:', this.proposalDocumentId);
      for (const key of Object.keys(this)) {
        if (this[key] === undefined) {
          continue;
        } else if (typeof this[key] == 'object') {
          continue;
        }
        if (key.startsWith('_')) {
          initiative[key.slice(1)] = this[key] as string;
        } else  if (typeof this[key] === 'string' || typeof this[key] === 'number') {
          initiative[key] = String(this[key]) as string;
        }
      }
      return initiative;
    }

    // this should fix itself when there is a client class
    public makeFolder (): GoogleAppsScript.Drive.Folder {
      if (this.folder) {
        throw new exports.ValidationError('Folder already exists');
      }
      if (this.client.isNew()) {
        this._folder =  this.client.makeFolder().createFolder(this.title);
      } else {
        this._folder = this.client.folder?.createFolder(this.title) as GoogleAppsScript.Drive.Folder;
      }
      return this._folder;
    }

    public deleteFiles(): void {
      if (!exports.User.isDeveloper) {
        throw new exports.ValidationError('You do not have permission to delete files');
      }
      if (this.folder) {
        const files = this.folder.getFiles();
        while (files.hasNext()) {
          const file = files.next();
          file.setTrashed(true);
        }
        this.folder.setTrashed(true);
        this._folder = undefined;
      }
      if (this._folderId) {
        this._folderId = undefined;
      }
      if (this.proposalDocument) {
        this._proposalDocument?.setTrashed(true);
      }
      if (this._proposalDocumentId) {
        this._proposalDocumentId = undefined;
      }
      if (this.costingSheet) {
        this._costingSheet?.setTrashed(true);
      }
      if (this._costingSheetId) {
        this._costingSheetId = undefined;
      }
      if (this._id) {
        exports.properties.deleteProperty(this._id);
      }
    }

    /////////////////////////////////////////////
    //             Private Methods             //
    /////////////////////////////////////////////

    // Validation for the constructor
    protected static validateParams ({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams): SerializedData | void {
      if (!name && !nameArray && !folder && !serializedData) {
        throw new exports.ValidationError('Initiative must be initialized with a name, nameArray, folder, or serializedData');
      }
      // make sure only one of the three is not null
      const countNonNull: number = [name, nameArray, folder, serializedData].filter(value => !!value).length;
      if (countNonNull !== 1) {
        console.warn('countNonNull', countNonNull);
        console.warn('name', name, 'Truthy?', !!name);
        console.warn('nameArray', nameArray, 'Truthy?', !!nameArray);
        console.warn('folder', folder, 'Truthy?', !!folder);
        console.warn('serializedData', serializedData, 'Truthy?', !!serializedData);
        throw new exports.ValidationError('Too Much Data: Initiative must be constructed with either a Name, Name Array, or Folder');
      }
      // serializedData Validation
      if (serializedData) {
        if (!serializedData['type']) {
          throw new exports.ValidationError('Serialized Data must contain a type');
        }
        const extraData: SerializedData = {};
        for (const key of Object.keys(serializedData)) {
          if (key.startsWith('_')) {
            throw new exports.ValidationError('Serialized Data cannot contain keys that start with an underscore');
          }
          if (key === 'type') {
            if (serializedData[key] !== 'PROJECT' && serializedData[key] !== 'PROPOSAL') {
              throw new ValidationError('Invalid value for type');
            }
            continue;
          }
          if (key === 'yrmo') {
            if (!exports.regex4Digits.test(serializedData[key] as string)) {
              throw new ValidationError('yrmo is not 4 digits');
            }
            continue;
          }
          if (key === 'title') {continue;}
          if (key === 'clientName') {continue;}
          if (key === 'projectName') {continue;}
          if (key === 'producer') {continue;}
          if (key === 'folderId') {continue;}
          if (key === 'proposalDocumentId') {continue;}
          if (key === 'costingSheetId') {continue;}
          if (key === 'creationDate') {
            if (isNaN(Date.parse(serializedData[key] as string))) {
              throw new ValidationError('creationDate is not a valid date');
            }
            continue;
          }
          if (key === 'rowNumber') {
            if (isNaN(Number(serializedData[key]))) {
              throw new ValidationError('rowNumber is not a valid number');
            }
            continue;
          }
          extraData[key] = serializedData[key];
        }
        return extraData;
      }
      // nameArray Validation
      if (nameArray) {
        for (const item of nameArray) {
          if (item === '') {
            throw new exports.ValidationError('One or more elements in the nameArray are missing.');
          }
        }
        if (!exports.regex4Digits.test(nameArray[1] as string)) {
          throw new exports.ValidationError('the second element in the nameArray must be 4 digits with nothing else.');
        }
        for (const item of nameArray) {
          if (item === '') {
            throw new exports.ValidationError('One or more elements in the nameArray are missing.');
          }
        }
      }
    }
}

export class Project extends Initiative {
  public type: 'PROJECT' | 'PROPOSAL' = 'PROJECT';
  protected _id?: string;
  private _jobNumber?: string;
  private _closed?: string;
  private _reconciliationSheetId?: string;
  private _reconciliationSheet?: GoogleAppsScript.Drive.File;

  constructor ({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams) {
    const params = { name, nameArray, folder, serializedData };
    try {
      Project.validateParams(params);
    } catch (error) {
      if (error instanceof exports.ValidationError) {
        throw new exports.ValidationError(`Project Not Found: ${error.message}`);
      }
      throw error;
    }
    super(params);
    if (serializedData) {
      if (serializedData['jobNumber']) {
        this._jobNumber = serializedData['jobNumber'] as string;
      }
      if (serializedData['closed']) {
        this._closed = serializedData['closed'] as string;
      }
      if (serializedData['reconciliationSheetId']) {
        this._reconciliationSheetId = serializedData['reconciliationSheetId'] as string;
      }
    }
    if (nameArray) {
      this._yrmo = nameArray[0];
      this._jobNumber = nameArray[1];
      this._closed = nameArray[4];
    }
    this.save();
  }
    
  /////////////////////////////////////////////
  //            Static Properties            //
  /////////////////////////////////////////////

  public static get orderedSheets(): GoogleAppsScript.Spreadsheet.Sheet[] {
    const dataSpreadsheet = Project.dataSpreadsheet;
    const orderedSheets: GoogleAppsScript.Spreadsheet.Sheet[] = [];
    let low = 1001;
    let high = 1050;
    while (low < 10000) {
      const sheet = dataSpreadsheet.getSheetByName(`${low}-${high}`);
      if (sheet) {
        orderedSheets.push(sheet);
        low += 50;
        high += 50;
        continue;
      }
      break;
    }
    return orderedSheets.reverse();
  }

  //gets the sheet with the last project in it
  public static get recentSheet (): GoogleAppsScript.Spreadsheet.Sheet {
    const orderedSheets = Project.orderedSheets;
    for (const sheet of orderedSheets) {
      if (!sheet.getRange('A2').isBlank()) {
        return sheet;
      }
    }
    throw new ReferenceError('No Recent Sheet Found');
  }
    
  //gets the sheet where the next project would go. thit will be the same as the reccent sheet unless the recent sheet is full.
  public static get nextSheet (): GoogleAppsScript.Spreadsheet.Sheet {
    const recentSheet = Project.recentSheet;
    if (recentSheet.getRange('A51').isBlank()) {
      return recentSheet;
    }
    let digits = recentSheet.getName().match(exports.regexPullDigits) ?? [];
    if (digits.length !== 2) {
      throw new ReferenceError('No Digits Found');
    }
    digits = [digits[0] + 50, digits[1] + 50];
    const nextSheet = Project.dataSpreadsheet.getSheetByName(`${digits[0]}-${digits[1]}`);
    if (nextSheet) {
      return nextSheet;
    }
    throw new ReferenceError('No Next Sheet Found');
  }

  public static get recentRow (): number {
    const columnA = Project.recentSheet.getRange('A:A').getValues().map(value => value[0]);
    let lastRowWithContent = 0;
    for (let i = 0; i < columnA.length; i++) {
      if (columnA[i]) {
        lastRowWithContent = i + 1;
        continue;
      }
      break;
    }
    return lastRowWithContent;
  }

  public static get nextRow (): number {
    const data = Project.nextSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === '') {
        return i + 1;
      }
    }
    throw new ReferenceError('No Next Row Found');
  }

  public static get reconciliationFolder (): GoogleAppsScript.Drive.Folder {
    const reconciliationFolderId = exports.properties.getProperty('reconciliationFolderId') ?? '';
    return DriveApp.getFolderById(reconciliationFolderId);
  }

  public static get reconciliationSheetTemplate (): GoogleAppsScript.Drive.File {
    const reconciliationSheetTemplateId = exports.properties.getProperty('reconciliationSheetTemplateId') ?? '';
    return DriveApp.getFileById(reconciliationSheetTemplateId);
  }

  /////////////////////////////////////////////
  //          Immutable Properties           //
  /////////////////////////////////////////////

  public get id(): string | undefined {
    if (this._id) {
      return this._id;
    }
    if (this.jobNumber && this.yrmo) {
      this._id = this.yrmo + this.jobNumber;
      return this._id;
    }
    return undefined;
  }

  public get dataSheet (): GoogleAppsScript.Spreadsheet.Sheet {
    if (this._dataSheet) {
      return this._dataSheet;
    }
    let low = 1001;
    let high = 1050;
    const jobNumber = parseInt(this.jobNumber, 10); // Convert jobNumber to a number
    while (!this._dataSheet) {
      if (jobNumber >= low && jobNumber <= high) {
        this._dataSheet = Project.dataSpreadsheet.getSheetByName(`${low}-${high}`) ?? undefined;
      }
      low += 50;
      high += 50;
      if (low > 10000) {
        throw new ReferenceError('Data Sheet Not Found');
      }
    }
    return this._dataSheet;
  }

  public get reconciliationSheet(): GoogleAppsScript.Drive.File | undefined {
    if (this._reconciliationSheet) {
      return this._reconciliationSheet;
    }
    if (this._reconciliationSheetId) {
      this._reconciliationSheet = DriveApp.getFileById(this._reconciliationSheetId);
      return this._reconciliationSheet;
    }
    const files = Project.reconciliationFolder.getFilesByName(this.title);
    if (!files.hasNext()) {
      return undefined;
    }
    // if file is in the trash dont use it
    if (files.next().isTrashed()) {
      return undefined;
    }
    this._reconciliationSheet = files.next();
    return this._reconciliationSheet;
  }

  public get reconciliationSheetId (): string | undefined {
    if (this._reconciliationSheetId) {
      return this._reconciliationSheetId;
    }
    this._reconciliationSheetId = this.reconciliationSheet?.getId();
    return this._reconciliationSheetId;
  }

  public get rowNumber (): number {
    if (this._rowNumber) {
      return this._rowNumber;
    }
    const data = this.dataSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      console.log('data[i][1]', data[i][1], 'this.jobNumber', this.jobNumber);
      if (data[i][1] == this.jobNumber) {
        this._rowNumber = i + 1;
        return this._rowNumber;
      }
    }
    throw new ReferenceError('Project Not Found');
  }

  //yrmo should always be a string of 4 digits
  public get yrmo (): string {
    if (this._yrmo) {
      return this._yrmo;
    }
    this._yrmo = this.title.split(' ')[0];
    if (!exports.regex4Digits.test(this._yrmo)) {
      throw new exports.ValidationError('yrmo is not 4 digits');
    }
    return this._yrmo;
  }

  //jobNumber should always be a string of 4 digits
  public get jobNumber (): string {
    if (this._jobNumber) {
      return this._jobNumber;
    }
    this._jobNumber = this.title.split(' ')[1];
    if (!exports.regex4Digits.test(this._jobNumber)) {
      throw new exports.ValidationError('jobNumber is not 4 digits');
    }
    return this._jobNumber;
  }

  public get closed (): string {
    if (this._closed) {
      return this._closed;
    }
    const data = this.dataSheet.getDataRange().getValues();
    this._closed = data[this.rowNumber - 1][10] as string;
    return this._closed;
  }

  /////////////////////////////////////////////
  //              Public Methods             //
  /////////////////////////////////////////////

  public serialize(): SerializedData {
    !this.reconciliationSheetId && console.warn('trying to find the reconciliation sheet:', this.reconciliationSheetId);
    return super.serialize();
  }

  public generateProject(): void {
    if (!this.folder) {
      this.makeFolder();
    }
    if (this.reconciliationSheet) {
      throw new exports.ValidationError('Reconciliation Sheet already exists');
    }
    Project.reconciliationSheetTemplate.makeCopy(this.title, Project.reconciliationFolder);
    this.creationDate = new Date();
    if (!this.producer) {
      this.producer = exports.User.fullName;
    }
  }

  // THIS IS A DESTRUCTIVE FUNCTION
  public deleteFiles(): void {
    if (!exports.User.isDeveloper) {
      throw new exports.ValidationError('User is not a developer');
    }
    if (this.reconciliationSheet) {
      this.reconciliationSheet.setTrashed(true);
      this._reconciliationSheet = undefined;
    }
    if (this._reconciliationSheetId) {
      this._reconciliationSheetId = undefined;
    }
    super.deleteFiles();
  }

  public save(): void {
    exports.properties.setProperty(this.yrmo+this.jobNumber, JSON.stringify(this.serialize()));
  }

  /////////////////////////////////////////////
  //              Static Methods             //
  /////////////////////////////////////////////

  public static getProject({ name = '', nameArray = undefined, folder = undefined }: InitiativeParams = {}): Project {
    const project = Initiative.getInitiative({ name, nameArray, folder });
    if (project.type == 'PROJECT') return project as Project;
    throw new exports.ValidationError('Initiative is not a Project');
  }

  /////////////////////////////////////////////
  //             Private Methods             //
  /////////////////////////////////////////////

  // VInitiative
  protected static validateParams({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams): void {
    const constructorData = { name, nameArray, folder, serializedData };
    const extraData = Initiative.validateParams(constructorData);
    if (extraData && !serializedData) {
      throw new exports.ValidationError(`Project Not Found: Extra Keys: ${Object.keys(extraData)}`);
    }
    if (serializedData && !extraData) {
      throw new exports.ValidationError('Project Not Found: Missing Keys');
    }
    if (serializedData && extraData) {
      for (const key of Object.keys(extraData)) {
        if (key === 'jobNumber') {
          if (!exports.regex4Digits.test(extraData[key] as string)) {
            throw new exports.ValidationError('jobNumber is not 4 digits');
          }
          continue;
        }
        if (key === 'closed') {
          if (extraData[key] !== 'TRUE' && extraData[key] !== 'FALSE') {
            throw new exports.ValidationError('closed is not TRUE or FALSE');
          }
          continue;
        }
        if (key === 'reconciliationSheetId') {continue;}
        throw new exports.ValidationError(`Project Not Found: Extra Keys: ${Object.keys(extraData)}`);
      }
    }
    if (name) {
      if (!exports.regexJobName.test(name)) {
        throw new exports.ValidationError('Project Name does not match expected pattern');
      }
    }
    if (nameArray) {
      if (nameArray.length != 5) {
        throw new exports.ValidationError('nameArray is not the expected length ');
      }
      if (!exports.regex4Digits.test(nameArray[0])) {
        throw new exports.ValidationError('nameArray does not start with the yrmo pattern');
      }
      if (!exports.regex4Digits.test(nameArray[1])) {
        throw new exports.ValidationError('nameArray does not start with the job number pattern');
      }
      if (!nameArray[4].match(/TRUE|FALSE/)) {
        throw new exports.ValidationError('nameArray does not end with the closed pattern');
      }
    }
  }
}

export class Proposal extends Initiative {
  public type: 'PROJECT' | 'PROPOSAL' = 'PROPOSAL';
  protected _id?: string;
  private _status?: string;

  constructor ({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined}: InitiativeParams) {
    const params = { name, nameArray, folder, serializedData };
    try {
      Proposal.validateParams(params);
    } catch (error) {
      if (error instanceof exports.ValidationError) {
        throw new exports.ValidationError(`Proposal Not Found: ${error.message}`);
      }
      throw error;
    }
    super(params);
    if (serializedData) {
      if (serializedData['status']) {
        this._status = serializedData['status'] as string;
      }
    }
    if (nameArray) {
      this._yrmo = nameArray[1];
    }
    this.save();
  }

  /////////////////////////////////////////////
  //            Static Properties            //
  /////////////////////////////////////////////

  public static get costingSheetTemplate (): GoogleAppsScript.Drive.File {
    const costingSheetTemplateId = exports.properties.getProperty('costingSheetTemplateId') ?? '';
    return DriveApp.getFileById(costingSheetTemplateId);
  }

  public static get proposalTemplate (): GoogleAppsScript.Drive.File {
    const proposalTemplateId = exports.properties.getProperty('proposalTemplateId') ?? '';
    return DriveApp.getFileById(proposalTemplateId);
  }

  public static get proposalSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    return Initiative.dataSpreadsheet.getSheetByName('Proposals') as GoogleAppsScript.Spreadsheet.Sheet;
  }

  /////////////////////////////////////////////
  //          Immutable Properties           //
  /////////////////////////////////////////////

  public get id(): string | undefined {
    if (this._id) {
      return this._id;
    }
    if (this.title) {
      this._id = this.title;
      return this._id;
    }
    return undefined;
  }

  public get dataSheet (): GoogleAppsScript.Spreadsheet.Sheet {
    if (this._dataSheet) {
      return this._dataSheet;
    }
    this._dataSheet = Project.dataSpreadsheet.getSheetByName('Proposals') as GoogleAppsScript.Spreadsheet.Sheet;
    return this._dataSheet;
  }

  public get rowNumber (): number {
    if (this._rowNumber) {
      return this._rowNumber;
    }
    const data = this.dataSheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] == this.yrmo && data[i][1] == this.clientName && data[i][2] == this.projectName) {
        this._rowNumber = i + 1;
        return this._rowNumber;
      }
    }
    throw new ReferenceError('Proposal Not Found');
  }

  public get yrmo (): string {
    if (this._yrmo) {
      return this._yrmo;
    }
    this._yrmo = this.title.split(' ')[1];
    if (!exports.regex4Digits.test(this._yrmo)) {
      throw new exports.ValidationError('yrmo is not 4 digits');
    }
    return this._yrmo;
  }

  public get status (): string {
    if (this._status) {
      return this._status;
    }
    this._status = 'NEW';
    if (this.folder) {
      this._status = 'ACTIVE';
    }
    return this._status;           
  }

  public get shortTitle (): string {
    return `${this.yrmo} ${this.clientName} ${this.projectName}`;
  }

  /////////////////////////////////////////////
  //              Public Methods             //
  /////////////////////////////////////////////

  public serialize(): SerializedData {
    this.status;
    return super.serialize();
  }

  public generateProposal(): void {
    if (this.folder) {
      throw new exports.ValidationError('Proposal Folder already exists');
    }
    const folder = this.makeFolder();
    Proposal.proposalTemplate.makeCopy(`${this.shortTitle} Proposal`, folder);
    Proposal.costingSheetTemplate.makeCopy(`${this.shortTitle} Costing Sheet`, folder);
    this.creationDate = new Date();
    this.producer = exports.User.fullName;
  }

  public acceptProposal(): void {
    if (!this.folder) {
      throw new exports.ValidationError('Proposal Folder does not exist');
    }
    if (this.status !== 'ACTIVE') {
      throw new exports.ValidationError('Proposal is not active');
    }
    const projectSheet = Project.nextSheet;
    const row = Project.nextRow;
    projectSheet.getRange(row, 1).setValue(this.yrmo);
    projectSheet.getRange(row, 3).setValue(this.clientName);
    projectSheet.getRange(row, 4).setValue(this.projectName);
    projectSheet.getRange(row, 6).setValue(this.producer);

    const jobNumber = projectSheet.getRange(row, 2).getValue();
    this.folder.setName(`${this.yrmo} ${jobNumber} ${this.clientName} ${this.projectName}`);
    new Project({ nameArray: [this.yrmo, jobNumber, this.clientName, this.projectName, 'FALSE']}).generateProject();
    this.dataSheet.deleteRow(this.rowNumber);
  }

  public save(): void {
    exports.properties.setProperty(this.title, JSON.stringify(this.serialize()));
  }

  /////////////////////////////////////////////
  //              Static Methods             //
  /////////////////////////////////////////////

  public static getProposal({ name = '', nameArray = undefined, folder = undefined }: InitiativeParams = {}): Proposal {
    const proposal = Initiative.getInitiative({ name, nameArray, folder });
    if (proposal.type == 'PROPOSAL') return proposal as Proposal;
    throw new exports.ValidationError('Initiative is not a Proposal');
  }

  /////////////////////////////////////////////
  //             Private Methods             //
  /////////////////////////////////////////////

  protected static validateParams({ name = '', nameArray = undefined, folder = undefined, serializedData = undefined }: InitiativeParams): void {
    const constructorData = { name, nameArray, folder, serializedData };
    const extraData = Initiative.validateParams(constructorData);
    if (extraData && !serializedData) {
      throw new exports.ValidationError(`Proposal Not Found: Extra Keys: ${Object.keys(extraData)}`);
    }
    if (serializedData && !extraData) {
      throw new exports.ValidationError('Proposal Not Found: Missing Keys');
    }
    if (serializedData && extraData) {
      for (const key of Object.keys(extraData)) {
        if (key === 'jobNumber') {
          if (!exports.regex4Digits.test(extraData[key] as string)) {
            throw new exports.ValidationError('jobNumber is not 4 digits');
          }
          continue;
        }
        if (key === 'status') {
          if (extraData[key] !== 'NEW' && extraData[key] !== 'ACTIVE') {
            throw new exports.ValidationError('status is not NEW or ACTIVE');
          }
          continue;
        }
        throw new exports.ValidationError(`Proposal Not Found: Extra Keys: ${Object.keys(extraData)}`);
      }
    }
    if (name) {
      if (!exports.regexProposalName.test(name)) {
        throw new exports.ValidationError('Proposal Name does not match expected pattern');
      }
    }
    if (nameArray) {
      if (nameArray.length != 4) {
        throw new exports.ValidationError('nameArray is not the expected length');
      }
      if (!exports.regex4Digits.test(nameArray[1])) {
        throw new exports.ValidationError('nameArray does not start with the yrmo pattern');
      }
      if (!exports.regexProposalOpen.test(nameArray[0])) {
        throw new exports.ValidationError('nameArray does not start with the proposal pattern');
      }
    }
  }
}