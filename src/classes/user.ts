export class User {
    constructor() {
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
}