import { ValidationError } from "../errors/errors";

interface InitiativeParams {
  name?: string;
  nameArray?: string[];
  folder?: GoogleAppsScript.Drive.Folder | null;
}

export class Initiative {
  public title: string;

  protected _clientName?: string;
  protected _projectName?: string;
  protected _folder?: GoogleAppsScript.Drive.Folder;
  protected _folderId?: string;


  constructor({ name = "", nameArray = [], folder = null }: InitiativeParams) {
    if (new.target === Initiative) {
      throw new TypeError("Cannot construct Abstract instances directly");
    }
    if (name) {
      this.title = name;
      return;
    }
    if (nameArray.length) {
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
    throw new ValidationError("Initiative must be initialized with a name, nameArray, or folder");
  }
}