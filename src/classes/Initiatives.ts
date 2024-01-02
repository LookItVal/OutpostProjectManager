import { ValidationError } from "../errors";
import { projectDataSheetId, regex4Digits } from "../constants";

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
  protected _dataSpreadsheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;


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

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////

  public get dataSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    if (this._dataSpreadsheet) {
      return this._dataSpreadsheet;
    }
    this._dataSpreadsheet = SpreadsheetApp.openById(projectDataSheetId);
    return this._dataSpreadsheet;
  }

  public get clientName() {
    if (this._clientName) {
      return this._clientName;
    }
    var clientProject: string = this.title.split(" ").slice(2).join(" ");
    // TODO: this next line requires both the definition for the client class and also a getClients() function
    // would i define the client to be the Client class?
    // var allClients: string[] = getClients().map(client => client.name);
    var allClients: string[] = [];
    for (const client of allClients) {
      if (clientProject.includes(client)) {
        this._clientName = client;
        return client;
      }
    }
    // Do something here if there is no client in the list with this name
    // actually this is kinda weird casue if there is no client in the list than there is no way to prove what the client name is
    //if you try to do something with the client name and you cant get it something is very wrong already.
    throw new ReferenceError("Client Name not found in list of clients");
  }

  // Validation for the constructor
  protected static validateConstructorData({ name = "", nameArray = [], folder = null }: InitiativeParams): void {
    if (name && nameArray.length && folder) {
      throw new ValidationError("Initiative must be initialized with a name, nameArray, or folder");
    }
    // make sure only one of the three is not null
    const countNonNull: number = [name, nameArray, folder].filter(value => value !== null).length;
    if (countNonNull !== 1) {
      throw new ValidationError("Too Much Data: Initiative must be constructed with either a Name, Name Array, or Folder");
    }
    // nameArray Validation
    if (nameArray) {
      for (const item of nameArray) {
        if (item === "") {
          throw new ValidationError("One or more elements in the nameArray are missing.");
        }
      }
      if (nameArray.length != 4) {
        throw new ValidationError("Name array does not fit the expected format");
      }
      if (!regex4Digits.test(nameArray[1])) {
        throw new ValidationError("the second element in the nameArray must be 4 digits with nothing else.")
      }
      for (const item of nameArray) {
        if (item === "") {
          throw new ValidationError("One or more elements in the nameArray are missing.");
        }
      }
    }
  }
}