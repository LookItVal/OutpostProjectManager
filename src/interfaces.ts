import { Project, Proposal } from './classes/initiatives';

export interface InitEvent {
  hostApp: string,
  userLocale: string,
  userTimezone: {
    id: string,
    offset: string
  },
  userCountry: string,
  clientPlatform: string,
  commonEventObject: {
    hostApp: string,
    timeZone: {
      id: string,
      offset: string
    },
    platform: string,
    userLocale: string
  },
  calendar: {
    capabilities: {
      canSeeAttendees: boolean,
      canSeeConferenceData: boolean
    },
    calendarId: string,
    id: string,
    organizer: {
      email: string
    }
  }
}

export interface SerializedData {
  [key: string]: string | SerializedData | SerializedData[];
}
export interface SerializedInitiative {
  [key: string]: string | number;
}

export interface InitiativeParams {
  name?: string;
  nameArray?: ProjectNameArray | ProposalNameArray | [];
  folder?: GoogleAppsScript.Drive.Folder;
}

export interface ProjectNameArray extends Array<string> {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

export interface ProposalNameArray extends Array<string> {
  0: string;
  1: string;
  2: string;
  3: string;
}

export interface ClientParams {
  name?: string;
  folder?: GoogleAppsScript.Drive.Folder;
}

export interface BookingParams {
  event?: InitEvent;
}

export type Initiative = Project | Proposal;
