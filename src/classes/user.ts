export class User {
  constructor() {

  }

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

  static get isAdmin(): boolean {
    const email = User.email;
    let isAdmin = false;
    exports.properties.getProperty('administrators').split(',').forEach((adminEmail: string) => {
      if (email == adminEmail) {
        isAdmin = true;
      }
    });
    return isAdmin;
  }

  static get isDeveloper(): boolean {
    const email = User.email;
    let isDeveloper = false;
    exports.properties.getProperty('developers').split(',').forEach((developerEmail: string) => {
      if (email === developerEmail) {
        isDeveloper = true;
      }
    });
    return isDeveloper;
  }
    
}

export function test() {
  console.log('User.email:', User.email);
  console.log('User.fullName:', User.fullName);
  console.log('User.isAdmin:', User.isAdmin);
  console.log('User.isDeveloper:', User.isDeveloper);
}
