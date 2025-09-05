import { BookingParams, Initiative, SerializedData } from '../interfaces';
import { Project, Proposal } from './initiatives';
import { Reconciliation } from './reconciliation';
import { regex4Digits, regexJobName } from '../constants';

interface BookingExports {
    Project: typeof Project;
    Proposal: typeof Proposal;
    regex4Digits: typeof regex4Digits;
    regexJobName: typeof regexJobName;
}
declare const exports: BookingExports;

export class Booking {
  [key: string]: string | number | object | (() => string) | undefined;

  public eventId?: string;
  public calendarId?: string;

  private _calendar?: GoogleAppsScript.Calendar.Calendar;
  private _calendarEvent?: GoogleAppsScript.Calendar.CalendarEvent;
  private _calendarEventLink?: string;
  private _reconciliation?: Reconciliation;
  private _project?: Initiative;
  private _date?: Date;
  private _duration?: number;
  private _technician?: string;

  constructor({event = undefined, calendarId = undefined, eventId = undefined}: BookingParams) {
    if (event) {
      this.eventId = event.calendar.id;
      this.calendarId = event.calendar.calendarId;
      return;
    }
    if (calendarId && eventId) {
      this.calendarId = calendarId;
      this.eventId = eventId;
      return;
    }
    throw new ReferenceError('Booking must be initialized with an event or calendarId and eventId');
  }

  public get project(): Initiative | undefined {
    if (this._project) return this._project;
    if (this.calendarEvent) {
      this._project = exports.Project.getInitiative({ name: this.calendarEvent.getTitle().trim() });
      return this._project;
    }
    return undefined;
  }

  public get reconciliation(): Reconciliation | undefined {
    if (this._reconciliation) return this._reconciliation;
    if (!this.project?.reconciliationSheet) {
      return undefined;
    }
    const rows = Reconciliation.findRow(this);
    if (rows.length === 1) {
      this._reconciliation = new Reconciliation({
        sheetId: this.project.reconciliationSheetId !== undefined ? String(this.project.reconciliationSheetId) : undefined,
        row: rows[0]});
      return this._reconciliation;
    }
    return undefined;
  }

  public set reconciliation(value: Reconciliation | undefined) {
    this._reconciliation = value;
  }

  public get calendar(): GoogleAppsScript.Calendar.Calendar | undefined {
    if (this._calendar) return this._calendar;
    if (this.calendarId) {
      this._calendar =  CalendarApp.getCalendarById(this.calendarId);
      if (!this._calendar) {
        this._calendar = CalendarApp.getCalendarById(`${this.calendarId}@group.calendar.google.com`);
      }
    }
    return this._calendar;
  }

  public get calendarEvent(): GoogleAppsScript.Calendar.CalendarEvent | undefined {
    if (this._calendarEvent) return this._calendarEvent;
    if (this.eventId && this.calendarId) {
      this._calendarEvent = this.calendar?.getEventById(this.eventId);
      return this._calendarEvent;
    }
    return undefined;
  }

  public get calendarEventLink(): string {
    if (this._calendarEventLink) return this._calendarEventLink;
    if (this.calendarEvent) {
      this._calendarEventLink = `https://calendar.google.com/calendar/u/0/r/week/${this.calendarEvent.getStartTime().getFullYear()}/${this.calendarEvent.getStartTime().getMonth() + 1}/${this.calendarEvent.getStartTime().getDate()}`;
      return this._calendarEventLink;
    }
    return '';
  }

  public get sheetId(): string {
    if (this.project instanceof exports.Proposal) return '';
    return this.project?.reconciliationSheetId ?? '';
  }

  public get date(): Date {
    if (this._date) return this._date;
    if (this.calendarEvent) {
      this._date = new Date(this.calendarEvent.getStartTime().getTime());
      return this._date;
    }
    throw new ReferenceError('Booking date is not set.');
  }

  public set date(date: Date) {
    if (date instanceof Date) {
      this._date = date;
      if (this.calendarEvent) {
        this.calendarEvent.setTime(date, new Date(date.getTime() + this.duration * 60 * 60 * 1000));
      }
    } else {
      throw new TypeError('Date must be a Date object.');
    }
  }

  public get duration(): number {
    if (this._duration) return this._duration;
    if (this.calendarEvent) {
      this._duration = (this.calendarEvent.getEndTime().getTime() - this.calendarEvent.getStartTime().getTime()) / (1000 * 60 * 60);
      return this._duration;
    }
    throw new ReferenceError('Booking duration is not set.');
  }

  public set duration(hours: number) {
    if (typeof hours === 'number') {
      this._duration = hours;
      if (this.calendarEvent) {
        this.calendarEvent.setTime(this.date, new Date(this.date.getTime() + hours * 60 * 60 * 1000));
      }
    } else {
      throw new TypeError('Duration must be a number.');
    }
  }

  public get technician(): string {
    if (this._technician) return this._technician;
    if (this.calendar) {
      const name = this.calendar.getName();
      const match = name.match(/^\*(.+) - Outpost$/i);
      if (match) {
        this._technician = name.substring(1, name.length - ' - Outpost'.length).trim();
        return this._technician;
      }
    }
    return '';
  }
  
  public resetBookingToReconciliation(): void {
    this.date = this.reconciliation?.date ?? new Date();
    this.duration = this.reconciliation?.hours ?? 1;
  }

  public reconcileBooking(): void {
    if (!this.project) {
      throw new ReferenceError('Cannot reconcile booking without a project.');
    }
    if (this.project.type !== 'PROJECT') {
      throw new TypeError('Cannot reconcile booking for a non-project initiative.');
    }
    this.reconciliation = new Reconciliation({sheetId: this.project?.reconciliationSheetId as string, row: -1});
    this.reconciliation.linkBooking();
    this.reconciliation.date = this.date;
    this.reconciliation.hours = this.duration;
    this.reconciliation.technician = this.technician;
  }

  public serialize(): SerializedData {
    const bookingData: SerializedData = {
      eventId: this.eventId?.split('@')[0] ?? '',
      calendarId: this.calendarId?.split('@')[0] ?? '',
      date: this.date.toLocaleDateString(),
      duration: String(this.duration),
      technician: this.technician,
      project: this.project?.name as string,
      calendarEventLink: this.calendarEventLink
    };
    return bookingData;
  }

  ////////////////////////////////////////////////////////////////////////////////
  //        Static Methods
  ////////////////////////////////////////////////////////////////////////////////

  public static getReconciliationPeriod(): Date {
    const projectNames: string[] = [];
    const files = exports.Project.reconciliationFolder.getFiles();
    while (files.hasNext()) {
      const file = files.next();
      if (exports.regexJobName.test(file.getName())) {
        projectNames.push(file.getName().match(exports.regexJobName)![0]);
      }
    }
    const projectDates: number[] = [];
    projectNames.forEach(name => {
      const match = name.match(exports.regex4Digits);
      if (match) {
        projectDates.push(Number(match[0]));
      }
    });
    const yrmo = String(Math.min(...projectDates));
    const year = Number(yrmo.substring(0, 2)) + 2000;
    const month = Number(yrmo.substring(2, 4)) - 1;
    return new Date(year, month, 1);
  }
}