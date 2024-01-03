import { ValidationError } from '../errors';
import { ClientParams, Initiative } from '../interfaces';
import { properties } from '../constants';
import { Project } from './initiatives';

// TODO: this.
export class Client {
    
    protected _name?: string;
    protected _folder?: GoogleAppsScript.Drive.Folder | null;
    protected _initiatives?: Initiative[];

    constructor({name = '', folder = null}: ClientParams) {
        const params: ClientParams = {name, folder};
        this.validateParams(params);
        if (!name && !folder) {
            throw new ValidationError('Client must have a name or a folder');
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
        const folderId: string = properties.getProperty('clientFolderId') ?? '';
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

    public get initiatives(): Initiative[] | undefined {
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
            const initiative = Project.getInitiative({folder});
            this._initiatives.push(initiative);
        }
        return this._initiatives;
        
    }
}