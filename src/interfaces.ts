import { Project, Proposal } from './classes/initiatives';

export interface SerializedInitiative {
  [key: string]: string | number;
}

export interface InitiativeParams {
  name?: string;
  nameArray?: string[];
  folder?: GoogleAppsScript.Drive.Folder | null;
}

export interface ClientParams {
  name?: string;
  folder?: GoogleAppsScript.Drive.Folder | null;
}

export type Initiative = Project | Proposal;
//TODO does the initiative need to be the parent class search somehow?