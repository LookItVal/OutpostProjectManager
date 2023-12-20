class Booking {
  constructor(event = null, reconciliation = null) {
    if (event) {
      this.eventId = event.calendar.id;
      this.calendarId = event.calendar.calendarId; 
      this.sheetId = findSheet(this.event.getSummary());
      this.findRow();
    }
  }

  /////////////////////////////////////////////
  //                Properties               //
  /////////////////////////////////////////////

  get calendar() {
    if(this._calendar) {
      return this._calendar;
    }
    this._calendar = CalendarApp.getCalendarById(this.calendarId);
    return this._calendar;
  }

  get event() {
    if(this._event) return this._event;
    this._event = this.calendar.getEventById(this.eventId);
    return this._event;
  }

  /////////////////////////////////////////////
  //              Init Functions             //
  /////////////////////////////////////////////

  findRow() {
    console.log('Attemped to find booking row: function not written');
  }
}

function replaceWhitespace(inputString) {
  return inputString.replace(/\s+/g, ' ');
}