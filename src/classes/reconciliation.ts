import { ValidationError } from './errors';
import { ReconciliationParams } from '../interfaces';
import { Booking } from './booking';
import { Project } from './initiatives';

interface ReconciliationExport {
  ValidationError: typeof ValidationError;
}
declare const exports: ReconciliationExport;

export class Reconciliation {
  [key: string]: string | number | object | undefined;

  private _date?: Date;
  private _hours?: number;
  private _technician?: string;
  private _workPerformed?: string;
  private _description?: string;
  private _billingAdditions?: string;
  private _spotNumbers?: string;
  private _status?: string;
  private _bookingCalId?: string;
  private _bookingCal?: GoogleAppsScript.Calendar.Calendar;
  private _bookingId?: string;
  private _booking?: Booking;
  private _projectTitle?: string;
  private _project?: Project;
  private _spreadsheetId?: string;
  private _spreadsheet?: GoogleAppsScript.Spreadsheet.Spreadsheet;
  private _sheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private _bookingSheet?: GoogleAppsScript.Spreadsheet.Sheet;
  private _row?: number;

  constructor({ sheetId = '', row = undefined, event = undefined, calId = undefined, eventId = undefined}: ReconciliationParams) {
    if (sheetId) {
      this._spreadsheetId = sheetId;
      if (row === -1) {
        this._row = this.sheet.getLastRow() + 1;
      } else {
        this._row = row;
      }
      return;
    }
    if (event) {
      this._bookingCalId = event.calendar.calendarId;
      this._bookingId = event.calendar.id;
      if (row === -1) {
        this._row = this.sheet.getLastRow() + 1;
      } else {
        this._row = row;
      }
      return;
    }
    if (calId && eventId) {
      this._bookingCalId = calId;
      this._bookingId = eventId;
      if (row !== undefined) {
        if (row === -1) {
          this._row = this.sheet.getLastRow() + 1;
        } else {
          this._row = row;
        }
      }
      return;
    }
    throw new exports.ValidationError('Reconciliation must be initialized with a booking or reconciliation row.');
  }

  /////////////////////////////////////////////
  //          Immutable Properties           //
  /////////////////////////////////////////////

  public get spreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
    if (this._spreadsheet) {
      return this._spreadsheet;
    }
    if (this._spreadsheetId) {
      const spreadsheet = SpreadsheetApp.openById(this._spreadsheetId);
      this._spreadsheet = spreadsheet;
      return this._spreadsheet;
    }
    if (this.booking && this.booking.project) {
      const spreadsheet = this.booking.project.reconciliationSheet as GoogleAppsScript.Drive.File;
      this._spreadsheet = SpreadsheetApp.open(spreadsheet);
      return this._spreadsheet;
    }
    throw new exports.ValidationError('Reconciliation sheet ID is not set.');
  }

  public get sheet(): GoogleAppsScript.Spreadsheet.Sheet {
    if (this._sheet) {
      return this._sheet;
    }
    const sheet = this.spreadsheet.getSheets()[0];
    if (sheet) {
      this._sheet = sheet;
      return this._sheet;
    }
    throw new exports.ValidationError('Reconciliation sheet is not available.');
  }

  public get bookingSheet(): GoogleAppsScript.Spreadsheet.Sheet {
    if (this._bookingSheet) {
      return this._bookingSheet;
    }
    let bookingsSheet = this.spreadsheet.getSheetByName('bookings');
    if (!bookingsSheet) {
      bookingsSheet = this.spreadsheet.insertSheet('bookings');
      bookingsSheet.hideSheet();
    }
    this._bookingSheet = bookingsSheet;
    return this._bookingSheet;
  }

  public get row(): number {
    if (this._row !== undefined) {
      return this._row;
    }
    return 0;
  }

  public get booking(): Booking | undefined {
    if (this._booking) {
      return this._booking;
    }
    if (this._bookingCalId && this._bookingId) {
      const booking = new Booking({ calendarId: this._bookingCalId, eventId: this._bookingId });
      this._booking = booking;
      return booking;
    }
    return undefined;
  }

  public get bookingId(): string | undefined {
    if (this._bookingId) {
      return this._bookingId;
    }
    if (this.booking) {
      this._bookingId = this.booking.eventId;
      return this._bookingId;
    }
    return undefined;
  }

  public get bookingCalId(): string | undefined {
    if (this._bookingCalId) {
      return this._bookingCalId;
    }
    if (this.booking) {
      this._bookingCalId = this.booking.calendarId;
      return this._bookingCalId;
    }
    return undefined;
  }

  /////////////////////////////////////////////
  //           Mutable Properties            //
  /////////////////////////////////////////////

  public get date(): Date | undefined {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._date) {
      return this._date;
    }
    const dateValue = this.sheet.getRange(this.row, 1).getValue();
    if (dateValue === '') {
      return undefined;
    }
    this._date = new Date(dateValue);
    return this._date;
  }

  public set date(value: Date) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._date = value;
    this.sheet.getRange(this.row, 1).setValue(value);
  }

  public get hours(): number {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._hours) {
      return this._hours;
    }
    const hoursValue = this.sheet.getRange(this.row, 2).getValue();
    this._hours = parseFloat(hoursValue);
    return this._hours;
  }

  public set hours(value: number) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._hours = value;
    this.sheet.getRange(this.row, 2).setValue(value);
  }

  public get technician(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._technician) {
      return this._technician;
    }
    const technicianValue = this.sheet.getRange(this.row, 3).getValue();
    this._technician = technicianValue.toString();
    return this._technician ?? '';
  }

  public set technician(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._technician = value;
    this.sheet.getRange(this.row, 3).setValue(value);
  }

  public get workPerformed(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._workPerformed) {
      return this._workPerformed;
    }
    const workValue = this.sheet.getRange(this.row, 4).getValue();
    this._workPerformed = workValue.toString();
    return this._workPerformed ?? '';
  }

  public set workPerformed(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._workPerformed = value;
    this.sheet.getRange(this.row, 4).setValue(value);
  }

  public get description(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._description) {
      return this._description;
    }
    const descriptionValue = this.sheet.getRange(this.row, 5).getValue();
    this._description = descriptionValue.toString();
    return this._description ?? '';
  }

  public set description(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._description = value;
    this.sheet.getRange(this.row, 5).setValue(value);
  }

  public get billingAdditions(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._billingAdditions) {
      return this._billingAdditions;
    }
    const billingValue = this.sheet.getRange(this.row, 6).getValue();
    this._billingAdditions = billingValue.toString();
    return this._billingAdditions ?? '';
  }

  public set billingAdditions(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._billingAdditions = value;
    this.sheet.getRange(this.row, 6).setValue(value);
  }

  public get spotNumbers(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._spotNumbers) {
      return this._spotNumbers;
    }
    const spotValue = this.sheet.getRange(this.row, 7).getValue();
    this._spotNumbers = spotValue.toString();
    return this._spotNumbers ?? '';
  }

  public set spotNumbers(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._spotNumbers = value;
    this.sheet.getRange(this.row, 7).setValue(value);
  }

  public get status(): string {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    if (this._status) {
      return this._status;
    }
    const statusValue = this.sheet.getRange(this.row, 8).getValue();
    this._status = statusValue.toString();
    return this._status ?? '';
  }

  public set status(value: string) {
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this._status = value;
    this.sheet.getRange(this.row, 8).setValue(value);
  }

  /////////////////////////////////////////////
  //              Static Methods             //
  /////////////////////////////////////////////

  public static findRow(booking: Booking | null = null, spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = null): number[] {
    if (!booking) {
      throw new exports.ValidationError('Booking is not provided.');
    }
    if (!spreadsheet) {
      const spreadsheetFile = booking.project?.reconciliationSheet;
      if (!spreadsheetFile) {
        throw new exports.ValidationError('Reconciliation sheet is not available.');
      }
      spreadsheet = SpreadsheetApp.open(spreadsheetFile as GoogleAppsScript.Drive.File);
    }
    let bookingsSheet = spreadsheet.getSheetByName('bookings');
    if (!bookingsSheet) {
      bookingsSheet = spreadsheet.insertSheet('bookings');
      bookingsSheet.hideSheet();
    }
    const data = bookingsSheet.getDataRange().getValues();
    const eventId = booking.eventId;
    const calendarId = booking.calendarId;
    const matchingRows: number[] = [];

    // Check the hidden "bookings" sheet for matching rows based on eventId and calendarId

    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === eventId) {
        if (data[i][1] === calendarId) {
          matchingRows.push(i + 1); // +1 because Sheets are 1-indexed
        }
      }
    }
    if (matchingRows.length > 0) {
      return matchingRows;
    }
    // Search "Sheet1" for matching rows based on booking.date, booking.duration, and booking.technitian
    const sheet1 = spreadsheet.getSheetByName('Sheet1');
    if (sheet1) {
      const sheet1Data = sheet1.getDataRange().getValues();
      const bookingDate = booking.date;
      const bookingTechnitian = booking.technician;

      for (let i = 0; i < sheet1Data.length; i++) {
        const rowDate = new Date(sheet1Data[i][0]);
        const rowTechnitian = sheet1Data[i][2];

        if (
          rowDate.getMonth() === bookingDate.getMonth() &&
          rowDate.getDate() === bookingDate.getDate() &&
          rowTechnitian === bookingTechnitian
        ) {
          matchingRows.push(i + 1); // 1-indexed
        }
      }
      if (matchingRows.length === 1) {
        bookingsSheet.getRange(matchingRows[0], 1).setValue(eventId);
        bookingsSheet.getRange(matchingRows[0], 2).setValue(calendarId);
      }
      if (matchingRows.length > 0) {
        return matchingRows;
      }
    }
    return [];
  }

  /////////////////////////////////////////////
  //             Public Methods              //
  /////////////////////////////////////////////

  public linkBooking(): void {
    if (!this._bookingCalId || !this._bookingId) {
      throw new exports.ValidationError('Booking calendar ID or event ID is not set.');
    }
    if (!this.row) {
      throw new exports.ValidationError('Reconciliation row number is not set.');
    }
    this.bookingSheet.getRange(this.row, 1).setValue(this._bookingId);
    this.bookingSheet.getRange(this.row, 2).setValue(this._bookingCalId);
  }
}