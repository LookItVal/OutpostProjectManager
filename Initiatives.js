function getInitiative({name = null, nameArray = null, folder = null} = {}) {
  const constructorData = {name, nameArray, folder};
  if (name) {
    if (regexProposalName.test(name)) return new Proposal(constructorData);
    if (regexJobName.test(name)) return new Project(constructorData);
  }
  if (nameArray) {
    if (regexProposalOpen.test(nameArray[0])) return new Proposal(constructorData);
    if (regex4Digits.test(nameArray[0])) return new Project(constructorData);
  }
  if (folder) {
    const folderName = folder.getName();
    if (regexProposalName.test(folderName)) return new Proposal(constructorData);
    if (regexJobName.test(folderName)) return new Project(constructorData);
  }
}

// Parent Class to proposal and project classes
class Initiatives {
  constructor({name = null, nameArray = null, folder = null} = {}) {
    if (name) {
      this.title = name;
    }
    if (nameArray) {
      this.title = `${nameArray[0]} ${nameArray[1]} ${nameArray[2]} ${nameArray[3]}`;
      this._clientName = nameArray[2];
      this._projectName = nameArray[3];
    }
    if (folder) {
      this._folder = folder;
      this._folderId = folder.getId();
      this.title = folder.getName();
    }
  }

  /////////////////////////////////////////////
  //             Data Validators             //
  /////////////////////////////////////////////
  validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    if (!name && !nameArray && !folder) {
      throw new ValidationError("Not Enough Data: Initiative must be constructed with either a Name, Name Array, or Folder");
    }
    const countNonNull = [name, nameArray, folder].filter(value => value !== null).length;
    if (countNonNull !== 1) {
      throw new ValidationError("Too Much Data: Initiative must be constructed with either a Name, Name Array, or Folder");
    }
    if (!this.type) {
      throw new ValidationError("Iniative class function called without child class: this.type not found");
    }
    if (nameArray) {
      if (!nameArray.length === 4) {
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
    if (folder) {
      if (!(folder instanceof DriveApp.Folder)) {
        throw new ValidationError("Folder is not of type DriveApp.Folder");
      }
    }
  }

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////
  get clientName() {
    if (this._clientName) {
      return this._clientName;
    }
    var clientProject = this.title.split(" ").slice(2).join(" ");
    var allClients = getClients().map(client => client.name);
    for (const client of allClients) {
      if (clientProject.startsWith(client)) {
        this._clientName = client;
        return this._clientName;
      }
    }
    // Do something here if there is no client in the list with this name
    // actually this is kinda weird casue if there is no client in the list than there is no way to prove what the client name is
    return null; //if you try to do something with the client name and you cant get it something is very wrong already.
  }

  get projectName() {
    if (this._projectName) {
      return this._projectName;
    }
    var clientProject = this.title.split(" ").slice(2).join(" ");
    if (!this.clientName) {
      throw new ValidationError("Cannot get project name without client name: try initializing with a nameArray or folder");
    }
    this._projectName = clientProject.replace(this.clientName, "").trim();
    return this._projectName;
  }

  get folder() {
    if (this._folder) {
      return this._folder;
    }
    if (this._folderId) {
      this._folder = DriveApp.getFolderById(this._folderId);
    }
    // get the client object from the client name. if null throw an error because there is no project folder without a client folder
    if (!this.clientName) {
      throw new ValidationError("Cannot get folder without client name: this is likely because the client doesnt yet have a folder");
    }
    const client = new Client({name: this.clientName});
    const projectFolder = client.folder.getFoldersByName(this.title);
    if (!projectFolder.hasNext()) {
      return null;
    }
    this._folder = projectFolder.next();
    return this._folder;
  }

  /////////////////////////////////////////////
  //              Static Methods             //
  /////////////////////////////////////////////
  static get costingSheetTemplate() {
    return DriveApp.getFileById(costingSheetTemplate);
  }

  static get proposalTemplate() {
    return DriveApp.getFileById(proposalTemplate);
  }

  static get reconciliationSheetTemplate() {
    return DriveApp.getFileById(reconciliationSheetTemplate);
  }
}


// Project class that inherits the properties of the Initiatives class
class Project extends Initiatives {
  constructor({name = null, nameArray = null, folder = null} = {}) {
    this.type = 'PROJECT';
    const constructorData = {name, nameArray, folder};
    this.validateConstructorData(constructorData);
    super(constructorData);
    if (nameArray) {
      this._yrmo = nameArray[0];
      this._jobNumber = nameArray[1];
    }
    this.sheetId = findSheet(name);
  }

  /////////////////////////////////////////////
  //             Data Validators             //
  /////////////////////////////////////////////
  validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    const constructorData = {name, nameArray, folder};
    super.validateConstructorData(constructorData);
    if (name) {
      if (!regexJobName.test(name)) {
        throw new ValidationError("Project name does not pass the regexJobName test.");
      }
    }
    if (nameArray) {
      if(!regex4Digits.test(nameArray[0])) {
        throw new ValidationError("Project nameArray does not start with a 4 digit number.");
      }
    }
  }

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////
  get yrmo() {
    if (this._yrmo) {
      return this._yrmo;
    }
    this._yrmo = this.title.split(" ")[0];
    return this._yrmo;
  }

  get jobNumber() {
    if (this._jobNumber) {
      return this._jobNumber;
    }
    this._jobNumber = this.title.split(" ")[1];
    return this._jobNumber;
  }

  isActive() {
    if (this.sheetId === null) {
      return false;
    }
    return true;
  }
}


// Proposal class that inherits the properties of the Initiatives class
class Proposal extends Initiatives {
  constructor({name = null, nameArray = null, folder = null } = {}) {
    this.type = 'PROPOSAL';
    const constructorData = {name, nameArray, folder};
    this.validateConstructorData(constructorData);
    super(constructorData);
    if (nameArray) {
      this._yrmo = nameArray[1];
    }
    this.status = this.initStatus();
  }

  /////////////////////////////////////////////
  //             Data Validators             //
  /////////////////////////////////////////////
  validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    const constructorData = {name, nameArray, folder};
    super.validateConstructorData(constructorData);
    if (name) {
      if (!regexProposalName.test(name)) {
        throw new ValidationError("Proposal name does not pass the regexJobName test.");
      }
    }
    if (nameArray) {
      if(!regexProposalOpen.test(nameArray[0])) {
        throw new ValidationError('Proposal nameArray does not start with "PROPOSAL:"');
      }
    }
  }

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////

  get yrmo() {
    if (this._yrmo) {
      return this._yrmo;
    }
    this._yrmo = this.title.split(" ")[1];
    return this._yrmo;
  }

  /////////////////////////////////////////////
  //              Init Functions             //
  /////////////////////////////////////////////
  initStatus() {
    if (this.folder) {
      return "ACTIVE";
    }
    return "NEW";
  }

  /////////////////////////////////////////////
  //             Public Methods             //
  /////////////////////////////////////////////
  makeFolder() {
    if (this.folder) {
      throw new ValidationError("Proposal already has a folder");
    }
    const client = new Client({name: this.clientName});
    client.makeFolder();
    this._folder = client.folder.createFolder(this.title);
    return this._folder;
  }
}