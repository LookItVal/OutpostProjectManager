import { BookingParams, Initiative } from '../interfaces';
import { Project, Proposal } from './initiatives';

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
    private _project?: Initiative;

    constructor({event = undefined}: BookingParams) {
        if (event) {
            this.eventId = event.calendar.id;
            this.calendarId = event.calendar.calendarId;
        }
    }

    public get project(): Initiative | undefined {
        if (this._project) return this._project;
        if (this.calendarEvent) {
            this._project = exports.Project.getInitiative({ name: this.calendarEvent.getTitle() });
            return this._project;
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

    public get row(): number {
        throw new Error('Not implemented');
    }
}