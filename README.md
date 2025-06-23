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

### [1.3.0] - Shiny Colors Update - 2024-01-24
  - Added link between calendar bookings and project reconciliations
  - Added Means of viewing and editing project reconciliations from the calendar
  - Added heartbeat to the sheets sidebar to prevent it from closing
  - Outpost Project Database now occasionally auto-refreshes the sidebar in the background
### [1.2.7]
  - Added new button to close project that is only visible to administrators
 - Added new button to make a more basic proposal
### [1.2.6]
  - Made new logo to make app more visible on white
  - Made new style guide for sheets
  - Added injection into the style guide
  - Added button to open the OPM from the calendar
  - Added button to make new job costing from the project stage

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
 - New reconciliation system that adds to the homepage of the calendar any unreconciled bookings
 - New system for warning about closing a project with unreconciled bookings