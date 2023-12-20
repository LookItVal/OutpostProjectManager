function getInitiative({name = null, nameArray = null, folder = null} = {}) {
  const constructorData = {name, nameArray, folder};
  if (name) {
    if (regexProposalName.test(name)) return new Proposal(constructorData);
    if (regexJobName.test(name)) return new Project(constructorData);
    throw new ValidationError("Initiative not found: name does not match regex");
  }
  if (nameArray) {
    if (regexProposalOpen.test(nameArray[0])) return new Proposal(constructorData);
    if (regex4Digits.test(nameArray[0])) return new Project(constructorData);
    throw new ValidationError("Initiative not found: nameArray does not match regex");
  }
  if (folder) {
    const folderName = folder.getName();
    if (regexProposalName.test(folderName)) return new Proposal(constructorData);
    if (regexJobName.test(folderName)) return new Project(constructorData);
    throw new ValidationError("Initiative not found: folder name does not match regex");
  }
}

// Parent Class to proposal and project classes
class Initiative {
  constructor({name = null, nameArray = null, folder = null} = {}) {
    if (new.target === Initiative) {
      throw new TypeError("Cannot construct Initiative instances directly");
    }
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
  static validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    if (!name && !nameArray && !folder) {
      throw new ValidationError("Not Enough Data: Initiative must be constructed with either a Name, Name Array, or Folder");
    }
    const countNonNull = [name, nameArray, folder].filter(value => value !== null).length;
    if (countNonNull !== 1) {
      throw new ValidationError("Too Much Data: Initiative must be constructed with either a Name, Name Array, or Folder");
    }
    if (nameArray) {
      for (const item of nameArray) {
        if (item === "") {
          throw new ValidationError("One or more elements in the nameArray are missing.");
        }
      }
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
    if (!client.folder) {
      return null;
    }
    const projectFolder = client.folder.getFoldersByName(this.title);
    if (!projectFolder.hasNext()) {
      return null;
    }
    this._folder = projectFolder.next();
    return this._folder;
  }

  get client() {
    if (this._client) {
      return this._client;
    }
    this._client = new Client({name: this.clientName});
    return this._client;
  }

  /////////////////////////////////////////////
  //              Static Methods             //
  /////////////////////////////////////////////
  static get costingSheetTemplate() {
    return DriveApp.getFileById(costingSheetTemplateId);
  }

  static get proposalTemplate() {
    return DriveApp.getFileById(proposalTemplateId);
  }

  static get reconciliationSheetTemplate() {
    return DriveApp.getFileById(reconciliationSheetTemplateId);
  }

  /////////////////////////////////////////////
  //             Public Methods              //
  /////////////////////////////////////////////
  // function to retun a new copy of an object with only data do pass to the frontend
  solidify() {
    const solidified = {};
    for (const key of Object.keys(this)) {
      if (key.startsWith("_") && (!this[key])) {
        continue;
      }
      // remnove the _ from the key name if it has one
      if (key.startsWith("_")) {
        solidified[key.slice(1)] = this[key];
        continue;
      }
      solidified[key] = this[key];
    }
    return solidified;
  }
}


// Project class that inherits the properties of the Initiative class
class Project extends Initiative {
  constructor({name = null, nameArray = null, folder = null} = {}) {
    const constructorData = {name, nameArray, folder};
    try {
      Project.validateConstructorData(constructorData);
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new ValidationError(`Project Not Found: ${e.message}`);
      }
      throw e;
    }
    super(constructorData);
    this.type = 'PROJECT';
    if (nameArray) {
      this._yrmo = nameArray[0];
      this._jobNumber = nameArray[1];
    }
    this.sheetId = findSheet(this.title);
  }

  /////////////////////////////////////////////
  //             Data Validators             //
  /////////////////////////////////////////////
  static validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    const constructorData = {name, nameArray, folder};
    Initiative.validateConstructorData(constructorData);
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


// Proposal class that inherits the properties of the Initiative class
class Proposal extends Initiative {
  constructor({name = null, nameArray = null, folder = null } = {}) {
    const constructorData = {name, nameArray, folder};
    try {
      Proposal.validateConstructorData(constructorData);
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new ValidationError(`Proposal Not Found: ${e.message}`);
      }
      throw e;
    }
    super(constructorData);
    this.type = 'PROPOSAL';
    if (nameArray) {
      this._yrmo = nameArray[1];
    }
    this.status = this.initStatus();
  }

  /////////////////////////////////////////////
  //             Data Validators             //
  /////////////////////////////////////////////
  static validateConstructorData({name = null, nameArray = null, folder = null} = {}) {
    const constructorData = {name, nameArray, folder};
    Initiative.validateConstructorData(constructorData);
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
    if (client.isNew()) {
      this._folder = this.client.makeFolder().createFolder(this.title);
    } else {
      this._folder = this.client.folder.createFolder(this.title);
    }
    return this._folder;
  }

  generateProposal() {
    if (this.folder) {
      throw new ValidationError("Proposal already has a folder");
    }
    this.makeFolder();
    const proposalTemplate = DriveApp.getFileById(proposalTemplateId);
    const costingSheetTemplate = DriveApp.getFileById(costingSheetTemplateId);
    proposalTemplate.makeCopy(`${this.yrmo} ${this.clientName} ${this.projectName} Proposal`, this.folder);
    costingSheetTemplate.makeCopy(`${this.yrmo} ${this.clientName} ${this.projectName}  Costing Sheet`, this.folder);
  }
}