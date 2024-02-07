import { Project, Proposal } from './classes/initiatives';

// no export interface needed here, this file will be empty on compile.

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
export interface InitiativeParams {
  name?: string;
  nameArray?: ProjectNameArray | ProposalNameArray;
  folder?: GoogleAppsScript.Drive.Folder;
  serializedData?: SerializedData;
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

export interface BasicTestJSON {
  'Raw': number[],
  'Statistics'?: {
    'Mean Total': number,
    'Mean Per Process'?: {[key: string]: number},
    'Range Total': number,
    'Range Per Process'?: {[key: string]: number}
  }
}

export interface OPDSheetJSONTests {
  'jumpToProjects'?: BasicTestJSON,
  'jumpToProposals'?: BasicTestJSON,
  'getInitiative from empty project'?: BasicTestJSON,
  'getInitiative from empty proposal'?: BasicTestJSON,
  'getInitiative from proposal with all docs'?: BasicTestJSON,
  'getInitiative from project with all docs'?: BasicTestJSON,
  'getInitiative from proposal with no docs'?: BasicTestJSON,
  'getInitiative from project with no docs'?: BasicTestJSON,
  'generateProposal from existing client'?: BasicTestJSON,
  'generateProposal from new client'?: BasicTestJSON,
  'acceptProposal'?: BasicTestJSON,
  'generateProject from existing client'?: BasicTestJSON,
  'generateProject from new client'?: BasicTestJSON,
  'openChangelog'?:  BasicTestJSON
}

export interface CalendarJSONTests {
  'openChangelog'?: BasicTestJSON,
  'getEvent from new event'?: BasicTestJSON,
  'getEvent from never loaded event with reconciliation sheet'?: BasicTestJSON,
  'getEvent from never loaded event without reconciliation sheet'?: BasicTestJSON,
  'getEvent from loaded event with reconciliation sheet'?: BasicTestJSON,
  'getEvent from loaded event without reconciliation sheet'?: BasicTestJSON
}

export interface BenchmarkJSON {
  'OPDSheet'?: {
    'Frontend': OPDSheetJSONTests,
    'Backend': OPDSheetJSONTests
  },
  'Calendar'?: {
    'Frontend': CalendarJSONTests,
    'Backend': CalendarJSONTests
  }
}

export interface Method {
  (...args: unknown[]): unknown;
}

export type Initiative = Project | Proposal;

export type unknownFunction = (...args: unknown[]) => unknown;