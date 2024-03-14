# Outpost Project Manager

## Description
[Provide a brief description of your project. Explain what it does and why it is useful.]

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation [![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

[Provide instructions on how to install and set up your project. Include any dependencies or prerequisites.]

## Usage
[Explain how to use your project. Provide examples and code snippets if necessary.]

## Changelog
### [1.2.5]
  - Added autofill to reconciliations
  - Fixed bug with copying elements in job costing sheet
  - Added autofill to job costing
  - Changed initialization script to track subscript directories

### [1.2.4]
  - Added buttons to proposal that autofill
  - Added autofill prompts to opening of new proposal
  - Added new build system for bound scripts
  - Added new initialization script for bound scripts

### [1.2.3]
  - Added folder button to the calendar sidebar
  - Added proposal and costing sheet buttons to the sidebar
  - Made buttons in the calendar only show up if their data is found
  - Changed wording on some buttons

### [1.2.2]
  - Cleaned up log statements
  - Managed Git Repo
  - Added Auto-filling for Client Names in the Outpost Project Database
  - Added Animation to Projects and Proposals Buttons
  - Cleaned Up Client Folder Structure
  - Added Cursor Pointing to buttons in the HTML stylesheet

### [1.2.1]
  - Stopped text from flashing on project generation
  - Disabled Load Button when loading new content
  - Reorganized folder structure

### [1.2.0] - Shiny Colors Update - 2024-01-24
- Added Changelog
- Fully Converted Codebase Into Typescript.
- Began Readme and some documentation.
- Added Better organization to frontend, with bigger text and icons with subtle animations.
- Prepared the code base for more rapid changes.

## Todo
## 1.3 The Optimization Update
- [ ] Have initiatives and other object be able to be initiated by serialized data.
  - 1.3.0
- [ ] The Changelog html is really just the base for any html file, change its name accordingly
  - 1.3.0
- [ ] OPD should jump to projects on open
  - 1.3
- [ ] Add Benchmarking
  - By 1.3
- [ ] Have every initiative initialize from serialized data and back them up to properties
  - The key of each property is the YR/MO + job number
  - add function to check the object to make sure everything is up to date
  - BY 1.3
- [ ] Add Caching not just properties. Cache should mirror the properties
  - By 1.3
- [ ] Change text to say generating and not making
  -BY 1.3
- [ ] Make frontend sends always come with a version number, to check to see if you need to update. This prevents the problem of the app breaking when updates are pushed until everyone refreshes their client.
  - BY 1.3
- [ ] Make sure calendar only adds a reconciliation sheet button if it actually found a real sheet
  - BY 1.3
- [ ] Make generative functions do things based on what has been selected previously, not what is currently selected if they have changed. This fixes the problem where if someone clicks away while files are being generated it may cause errors.
  - BY 1.3
## 1.4 The Utilities Update
- [ ] Add requirement so you can do red button actions
  - BY 1.4
- [ ] Link up items in the costing sheet with the proposal document.
  - By 1.4
- [ ] Update basic project name variables in documents that get generated
  - By 1.4
- [ ] Build this readme out to make sure anyone else who needs to edit this codebase can easily understand how this app works.
  -BY 1.4
- [ ] Add some kind of bug reporter for the client.
  - BY 1.4
- [ ] Add some kind of Feature Request for the client.
  - By 1.4
- [ ] Give instructions from the Google Drive file on how to get here. Probably a another readme file that is a .gs file and not a .md file. Will be far smaller than the readme.md, it will just link to the git so people can read the real readme.
  -BY 1.4
- [ ] Add function to add new page in the OPD. This function should be run automatically as the sheet runs out of room.
  - By 1.4
- [ ] If admin, be able to close reconciliation sheets. This function will just move the reconciliation sheet into the project folder, and lock the sheet. It could also mark the projects as closed in the Outpost Project Database.
  - BY 1.4
## 1.5 The UX Update
- [ ] Split app into multiple sub bound apps so they can make use of onSelectionChange(e). This will allow the app to update faster and without the user having to click a button first, but it will require splitting up the codebase and accessing data via HTTP requests.
  - By 1.5
- [ ] Turn the rest of the app into a web app and send http requests to each other to run functions. This speeds up updating on editors with advanced functions, and also will allow a hub for users to see everything in once place.
  - By 1.5
## 1.6 The Calendar Update
- [ ] Link calendar bookings and specific lines of the reconciliation sheet.
  - BY 1.6
- [ ] Fill calendar booking sidebar with info from the reconciliation sheet.
  - BY 1.6
- [ ] Add something to the reconciliation sheet to show when something has been confirmed.
  - BY 1.6
- [ ] In reconciliation sheet, be able to get information about calendar bookings through rows.
  - BY 1.6
## OPM V2.0
- [ ] Add Chat Integration
  - By 2.0
- [ ] Reskin Web-App with Kyle?
  - By 2.0
- [ ] New Space for each active project
  - By 2.0
- [ ] Mark who is involved in the project based on calendar bookings and the listed producer
  - By 2.0
- [ ] Add Chat to each section of the app (where possible, bound apps may be harder)
  - By 2.0
- [ ] Integrate Zoho Database, and database search method
  - By 2.0
- [ ] Add Admin console
  - By 2.0
- [ ] Launch as android and IOS application.
  - By 2.0
- [ ] Integrate Making new Bookings and requesting time off to web-app.
  - By 2.0