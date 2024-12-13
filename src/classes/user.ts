/**
 * Basic user class for getting user information.
 * @module src/classes/user
 */

import { State } from '../constants';

/**
 * The User static class for getting information about the active user.
 * @static
 * @class User
 * @memberof src/classes/user
 * @exports User
 * @property {string} email - The user's email address.
 * @property {string} fullName - The user's full name.
 * @property {boolean} isAdmin - Whether the user is an administrator.
 * @property {boolean} isDeveloper - Whether the user is a developer.
 */
export class User {
  /** Why are you doing this? do not do this. This is a STATIC class. */
  constructor() {}

  /**
   * Get the active user's email address.
   * @static
   * @property {string} email
   * @returns {string} The user's email address.
   * @throws {Error} If the user is not found.
   */
  static get email(): string {
    const user = People.People?.get('people/me', {personFields: 'emailAddresses'});
    if (!user) {
      throw new Error('User not found');
    }
    const emailAddresses = user.emailAddresses as GoogleAppsScript.People.Schema.EmailAddress[];
    if (!emailAddresses || !emailAddresses[0]) {
      throw new Error('User email not found');
    }
    return emailAddresses[0].value as string;
  }

  /**
   * Get the active user's full name.
   * @static
   * @property {string} fullName
   * @returns {string} The user's full name.
   * @throws {Error} If the user is not found.
   */
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

  /**
   * Check if the active user is an administrator.
   * @static
   * @property {boolean} isAdmin
   * @returns {boolean} Whether the user is an administrator.
   */
  static get isAdmin(): boolean {
    const email = User.email;
    let isAdmin = false;
    State.properties.getProperty('administrators')?.split(',').forEach((adminEmail: string) => {
      if (email == adminEmail) {
        isAdmin = true;
      }
    });
    return isAdmin;
  }

  /**
   * Check if the active user is a developer.
   * @static
   * @property {boolean} isDeveloper
   * @returns {boolean} Whether the user is a developer.
   */
  static get isDeveloper(): boolean {
    const email = User.email;
    let isDeveloper = false;
    State.properties.getProperty('developers')?.split(',').forEach((developerEmail: string) => {
      if (email === developerEmail) {
        isDeveloper = true;
      }
    });
    return isDeveloper;
  }
}