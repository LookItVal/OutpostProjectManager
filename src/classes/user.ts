import { properties, regexJobName, regexProposalName } from '../constants';
import { Booking } from './booking';
import { ValidationError } from './errors';
import { Project } from './initiatives';
import { Reconciliation } from './reconciliation';


declare const exports: {
  properties: typeof properties;
  regexJobName: typeof regexJobName;
  regexProposalName: typeof regexProposalName;
  Booking: typeof Booking;
  Reconciliation: typeof Reconciliation;
  Project: typeof Project;
};

export class User {
  constructor() {
  }

  static get email(): string {
    return Session.getActiveUser().getEmail();
  }

  static get fullName(): string {
    const user = People.People?.get('people/me', {personFields: 'names'});
    if (!user) {
      throw new Error('User not found');
    }
    const names = user.names as GoogleAppsScript.People.Schema.Name[];
    if (!names || !names[0]) {
      throw new Error('User name not found');
    }
    let name = `${names[0].givenName} ${names[0].familyName}`;
    if (name == 'Outpost Worldwide') {
      name = 'Robert Cecil';
    }
    return name;
  }

  static get calendar(): GoogleAppsScript.Calendar.Calendar {
    return CalendarApp.getCalendarsByName(`*${User.fullName} - Outpost`)[0];
  }

  static get isAdmin(): boolean {
    const email = User.email;
    let isAdmin = false;
    exports.properties.getProperty('administrators')?.split(',').forEach((adminEmail: string) => {
      if (email == adminEmail) {
        isAdmin = true;
      }
    });
    return isAdmin;
  }

  static isAdminEmail(email: string): boolean {
    let isAdmin = false;
    exports.properties.getProperty('administrators')?.split(',').forEach((adminEmail: string) => {
      if (email == adminEmail) {
        isAdmin = true;
      }
    });
    return isAdmin;
  }

  static get isDeveloper(): boolean {
    const email = User.email;
    let isDeveloper = false;
    exports.properties.getProperty('developers')?.split(',').forEach((developerEmail: string) => {
      if (email === developerEmail) {
        isDeveloper = true;
      }
    });
    return isDeveloper;
  }

  static getReconciliations(project: Project): Reconciliation[] {
    const sheet = SpreadsheetApp.open(project.reconciliationSheet as GoogleAppsScript.Drive.File) as GoogleAppsScript.Spreadsheet.Spreadsheet;
    if (!sheet) {
      throw new ValidationError('Reconciliation sheet not found');
    }
    const bookingsSheet = sheet.getSheetByName('bookings');
    if (!bookingsSheet) {
      throw new ValidationError('Bookings sheet not found in reconciliation sheet');
    }
    const mainSheet = sheet.getSheets()[0];
    const rows = bookingsSheet.getDataRange().getValues();
    const mainRows = mainSheet.getDataRange().getValues();
    const reconciliations: Reconciliation[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] === '' || row[0] === undefined) {
        continue; // Skip empty rows
      }
      if (mainRows[i][2] !== User.fullName) {
        continue; // Skip rows not assigned to the current user
      }
      const reconciliation = new Reconciliation({ row: i, eventId: row[0], calId: row[1] });
      reconciliations.push(reconciliation);
    }
    return reconciliations;
  }
  
  static getUnreconciledEvents(start: Date): GoogleAppsScript.Calendar.CalendarEvent[] {
    let events = User.calendar.getEvents(start, new Date());
    const projectNames: string[] = [];
    const files = exports.Project.reconciliationFolder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (exports.regexJobName.test(file.getName())) {
        projectNames.push(file.getName().match(exports.regexJobName)![0]);
      }
    }
    events = events.filter(event => {
      const title = event.getTitle().trim();
      return projectNames.includes(title);
    });
    const projects: Project[] = [];
    for (const event of events) {

      const title = event.getTitle().trim();
      if (projectNames.indexOf(title) === -1) {
        continue;
      }
      if (!projects.some(p => p.title === title)) {
        projects.push(new exports.Project({ name: title }));
      }
    }
    for (const project of projects) {
      const reconciliations = User.getReconciliations(project);
      for (const reconciliation of reconciliations) {
        const eventIds = events.map(event => event.getId());
        const bookingId = reconciliation.bookingId?.split('@')[0] + '@google.com';
        const index = eventIds.indexOf(bookingId);
        if (index === -1) {
          console.log(`Reconciliation for event ${bookingId} not found in the list of events.`);
          console.log(bookingId, eventIds);
          continue;
        }
        if (index !== -1) {
          events.splice(index, 1);
        }
      }
    }
    return events;  
  }
}
