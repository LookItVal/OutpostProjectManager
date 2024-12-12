/**
 * Set of types and interfaces used throughout the application.
 * @module src/interfaces
 */

import { Project, Proposal } from './classes/initiatives';

/** The type of the event object passed to from the eventOpenTrigger function. */
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

/** Type representing data that has been serialized to a json parsable format. */
export interface SerializedData {
  [key: string]: string | SerializedData | SerializedData[];
}

/** Type representing valid initialization parameters for the Initiative class. */
export interface InitiativeParams {
  name?: string;
  nameArray?: ProjectNameArray | ProposalNameArray;
  folder?: GoogleAppsScript.Drive.Folder;
  serializedData?: SerializedData;
}

/** Type representing valid shapes for the ProjectNameArray parameter in the InitiativeParams interface. */
export interface ProjectNameArray extends Array<string> {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
}

/** Type representing valid shapes for the ProposalNameArray parameter in the InitiativeParams interface. */
export interface ProposalNameArray extends Array<string> {
  0: string;
  1: string;
  2: string;
  3: string;
}

/** Type representing valid initialization parameters for the Client class. */
export interface ClientParams {
  name?: string;
  folder?: GoogleAppsScript.Drive.Folder;
}

/** Type representing valid initialization parameters for the Booking class. */
export interface BookingParams {
  event?: InitEvent;
}

/** Type representing the structure of the changelog dictionary. */ 
export interface ChangelogDict {
  // Outermost key is the major version number
  [key: number]: {
    // Minor version number
    [key: number]: (string | {
        // Innermost key is the patch version number
        [key: number]: 
          // Array of [description, type]
          string[][]
      }
    )[];
  };
}

/** Type representing the union of the Project and Proposal classes. */
export type Initiative = Project | Proposal;

/**
 * The type of the event object passed to the onOpen function in the Docs app.
 * Fixes the issue with the GoogleAppsScript.Events.DocsOnOpen interface.
 */
export interface DocEvent {
  source: GoogleAppsScript.Document.Document;
  user?: {
    email: string;
    nickname: string;
  };
}
