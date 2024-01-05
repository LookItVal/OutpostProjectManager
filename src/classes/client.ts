import { ValidationError } from './errors';
import { ClientParams, Initiative } from '../interfaces';
import { properties } from '../constants';
import { Project, Proposal } from './initiatives';

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
            const initiative = Project.getInitiative({folder});
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
    public isNew() {
        if (!this.folder) {
            return true;
        }
        return false;
    }

    public makeFolder() {
        if (this.folder) {
            throw new ValidationError('Client already has a folder');
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

    /////////////////////////////////////////////
    //             Private Methods             //
    /////////////////////////////////////////////

    private validateParams({name, folder}: ClientParams): void {
        if (!name && !folder) {
            throw new ValidationError('Client must have a name or a folder');
        }
        if (name && folder) {
            throw new ValidationError('Client cannot have both a name and a folder');
        }
        if (name && typeof name !== 'string') {
            throw new ValidationError('Client name must be a string');
        }
    }
}