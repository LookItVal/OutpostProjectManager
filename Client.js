class Client {
  constructor({name = null, folder = null} = {}) {
    const constructorData = {name, folder};
    this.validateConstructorData(constructorData)
    if (!name && !folder) {
      throw new TypeError("Client must be initialized with either a Name or a Folder Object");
    }
    if (folder) {
      this._folder = folder;
    }
    if (name) {
      this._name = name;
    }
  }

  /////////////////////////////////////////////
  //              Validators                 //
  /////////////////////////////////////////////
  validateConstructorData({name = null, folder = null} = {}) {
    if (!name && !folder) {
      throw new ValidationError("Client must be initialized with either a Name or a Folder Object");
    }
    if (name && typeof name != "string") {
      throw new ValidationError("Client name must be a string.");
    }
    if (folder && !(folder instanceof DriveApp.Folder)) {
      throw new ValidationError("Client folder must be a Folder object.");
    }
  }

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////

  get folder() {
    if (this._folder) {
      return this._folder;
    }
    if (this._folderId) {
      this._folder = DriveApp.getFolderById(this._folderId);
    }
    if (this._name) {
      const rootFolder = DriveApp.getFolderById(clientFolderId);
      const folders = rootFolder.getFoldersByName(this._name);
      if (!folders.hasNext()) {
        return null;
      }
      this._folder = folders.next();
    }
    return this._folder;
  }

  get name() {
    if (this._name) {
      return this._name;
    }
    if (this._folder) {
      this._name = this.folder.getName();
    }
    return this._name;
  }

  // This is only getting the name not the object
  get initiatives() {
    if (this._initiatives) {
      return this._initiatives;
    }
    // if no initatives get every folder in the client folder and make a list of each initiative by the folder name. do not include the DEC 2023 ARCHIVE folder
    this._initiatives = [];
    const folders = this.folder.getFolders();
    while (folders.hasNext()) {
      const folder = folders.next();
      if (folder.getName() == "DEC 2023 ARCHIVE") {
        continue;
      }
      this._initiatives.push(folder.getName());
    }
    return this._initiatives;
  }

  get projects() {
    if (this._projects) {
      return this._projects;
    }
    // if projects not cached then get all initiatives and run them throught the initiativeType function to determine if they are projects or proposals
    this._projects = [];
    for (const initiative of this.initiatives) {
      if (initiative.type === "PROJECT") {
        this._projects.push(initiative);
      }
    }
    return this._projects;
  }

  get proposals() {
    if (this._proposals) {
      return this._proposals;
    }
    // if proposal not cached then get all initiatives and run them throught the initiativeType function to determine if they are projects or proposals
    this._proposals = [];
    for (const initiative of this.initiatives) {
      if (initiative.type === "PROPOSAL") {
        this._proposals.push(initiative);
      }
    }
    return this._proposals;
  }

  isNew() {
    if (!this.folder) {
      return true;
    }
    return false;
  }

  /////////////////////////////////////////////
  //              Public Methods             //
  /////////////////////////////////////////////
  makeFolder() {
    if (this.folder) {
      throw new ValidationError("Client already has a folder");
    }
    const rootFolder = DriveApp.getFolderById(clientFolderId);
    this._folder = rootFolder.createFolder(this._name);
    return this._folder;
  }
}
