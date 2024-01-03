import { ValidationError } from '../errors';
import { properties, regex4Digits } from '../constants';
import { Client } from './client';
import { InitiativeParams, SerializedInitiative } from '../interfaces';


abstract class Initiative {
    [key: string]: string | number | object | undefined;

    public title: string;

    protected _yrmo?: string;
    protected _clientName?: string;
    protected _client?: Client;
    protected _projectName?: string;
    protected _creationDate?: Date;
    protected _producer?: string;
    protected _folder?: GoogleAppsScript.Drive.Folder;
    protected _folderId?: string;
    protected _dataSheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
    protected _proposalDocumentId?: string;
    protected _costingSheetId?: string;

    constructor ({ name = '', nameArray = [], folder = null }: InitiativeParams) {
        if (new.target === Initiative) {
            throw new TypeError('Cannot construct Abstract instances directly');
        }
        if (name) {
            this.title = name;
            return;
        }
        if (nameArray.length > 0) {
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
        throw new ValidationError('Initiative must be initialized with a name, nameArray, or folder');
    }

    /////////////////////////////////////////////
    //            Static Properties            //
    /////////////////////////////////////////////

    public static get dataSpreadsheet (): GoogleAppsScript.Spreadsheet.Spreadsheet {
        const projectDataSheetId = properties.getProperty('projectDataSheetId') ?? '';
        return SpreadsheetApp.openById(projectDataSheetId);
    }

    public static get costingSheetTemplate (): GoogleAppsScript.Drive.File {
        const costingSheetTemplateId = properties.getProperty('costingSheetTemplateId') ?? '';
        return DriveApp.getFileById(costingSheetTemplateId);
    }

    public static get proposalTemplate (): GoogleAppsScript.Drive.File {
        const proposalTemplateId = properties.getProperty('proposalTemplateId') ?? '';
        return DriveApp.getFileById(proposalTemplateId);
    }

    public static get reconciliationSheetTemplate (): GoogleAppsScript.Drive.File {
        const reconciliationSheetTemplateId = properties.getProperty('reconciliationSheetTemplateId') ?? '';
        return DriveApp.getFileById(reconciliationSheetTemplateId);
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
        // TODO: this next line requires both the definition for the client class and also a getClients() function
        // would i define the client to be the Client class?
        // var allClients: string[] = getClients().map(client => client.name);
        const allClients: string[] = [];
        for (const client of allClients) {
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
    // TODO: this needs the client object
        if (this._client) {
            return this._client;
        }
        this._client = new Client({ name: this.clientName });
        return this._client;
    }

    public get projectName (): string {
        if (this._projectName) {
            return this._projectName;
        }
        const clientProject: string = this.title.split(' ').slice(2).join(' ');
        if (!this.clientName) {
            throw new ValidationError('Cannot get Project Name without Client Name');
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
            return undefined;
        }
        const folders = this.client.folder.getFoldersByName(this.title);
        if (!folders.hasNext()) {
            return undefined;
        }
        this._folder = this.client.folder.getFoldersByName(this.title).next();
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
    public static getInitiative({ name = '', nameArray = [], folder = null }: InitiativeParams): Initiative {
        // TODO this
    }

    /////////////////////////////////////////////
    //                 Methods                 //
    /////////////////////////////////////////////

    public serialize (): SerializedInitiative {
        const initiative: SerializedInitiative = {};
        this.costingSheetId;
        this.proposalDocumentId;
        for (const key of Object.keys(this)) {
            if (typeof this[key] !== 'object' && typeof this[key] !== 'undefined') {
                continue;
            }
            if (key.startsWith('_')) {
                initiative[key.slice(1)] = this[key] as string | number;
            } else {
                initiative[key] = this[key] as string | number;
            }
        }
        return initiative;
    }

    // this should fix itself when there is a client class
    public makeFolder (): GoogleAppsScript.Drive.Folder {
        if (this.folder) {
            throw new ValidationError('Folder already exists');
        }
        if (this.client.isNew()) {
            this._folder =  this.client.makeFolder().createFolder(this.title);
        } else {
            this._folder = this.client.folder.createFolder(this.title);
        }
        return this._folder;
    }

    /////////////////////////////////////////////
    //             Private Methods             //
    /////////////////////////////////////////////

    // Validation for the constructor
    protected static validateConstructorData ({ name = '', nameArray = [], folder = null }: InitiativeParams): void {
        if (name && (nameArray.length > 0) && folder) {
            throw new ValidationError('Initiative must be initialized with a name, nameArray, or folder');
        }
        // make sure only one of the three is not null
        const countNonNull: number = [name, nameArray, folder].filter(value => value !== null).length;
        if (countNonNull !== 1) {
            throw new ValidationError('Too Much Data: Initiative must be constructed with either a Name, Name Array, or Folder');
        }
        // nameArray Validation
        if (nameArray) {
            for (const item of nameArray) {
                if (item === '') {
                    throw new ValidationError('One or more elements in the nameArray are missing.');
                }
            }
            if (nameArray.length != 4) {
                throw new ValidationError('Name array does not fit the expected format');
            }
            if (!regex4Digits.test(nameArray[1])) {
                throw new ValidationError('the second element in the nameArray must be 4 digits with nothing else.');
            }
            for (const item of nameArray) {
                if (item === '') {
                    throw new ValidationError('One or more elements in the nameArray are missing.');
                }
            }
        }
    }
}

export class Project extends Initiative {}

export class Proposal extends Initiative {}