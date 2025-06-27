import { BookingParams, Initiative } from '../interfaces';
import { Project, Proposal } from './initiatives';
import { Reconciliation } from './reconciliation';

interface BookingExports {
    Project: typeof Project;
    Proposal: typeof Proposal;
}
declare const exports: BookingExports;

export class Booking {
  public eventId?: string;
  public calendarId?: string;

  private _calendar?: GoogleAppsScript.Calendar.Calendar;
  private _calendarEvent?: GoogleAppsScript.Calendar.CalendarEvent;
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

  public get calendar(): GoogleAppsScript.Calendar.Calendar | undefined {
    if (this._calendar) return this._calendar;
    this._calendar =  CalendarApp.getCalendarById(this.calendarId ?? '');
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

  public get sheetId(): string {
    if (this.project instanceof exports.Proposal) return '';
    return this.project?.reconciliationSheetId ?? '';
  }

  public get date(): Date {
    if (this._date) return this._date;
    if (this.calendarEvent) {
      this._date = new Date(this.calendarEvent.getStartTime().getTime());
      console.log(this._date);
      return this._date;
    }
    throw new ReferenceError('Booking date is not set.');
  }

  public get duration(): number {
    if (this._duration) return this._duration;
    if (this.calendarEvent) {
      this._duration = (this.calendarEvent.getEndTime().getTime() - this.calendarEvent.getStartTime().getTime()) / (1000 * 60 * 60);
      console.log(this._duration);
      return this._duration;
    }
    throw new ReferenceError('Booking duration is not set.');
  }

  public get technician(): string {
    if (this._technician) return this._technician;
    if (this.calendar) {
      const name = this.calendar.getName();
      const match = name.match(/^\*(.+) - Outpost$/i);
      if (match) {
        this._technician = name.substring(1, name.length - ' - Outpost'.length).trim();
        console.log(this._technician);
        return this._technician;
      }
    }
    return '';
  }
}