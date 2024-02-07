# Outpost Project Manager Case Studies
Outpost Worldwide is a small video production company with very few employees. I am one of those employees, and I saw first hand how people were over worked with business admin and upkeep type tasks that were getting in the way from them doing the video production work they were hired to do. Every employee logged all of the work they do in the day into an individual spreadsheet for each project they worked on. They also had a system for organizing their projects that was hard to search through and had little use besides searching. The Outpost Project Manager aims to ease the day to day minutiae for the team, making the business administration easy and automatic, so they can focus on the art.

# App Details
Outpost Project Manager is an internal use application deployed as a google workspace addon written in google apps script and hosted on google cloud platform. The application is written in typescript in a GitHub repository found [here](https://github.com/LookItVal/OutpostProjectManager), and using a tool called clasp, I push updates from my local code editor into the google apps script project hosted on the company google drive account and it will then compile the typescript into google apps script code. 

## Important Terms

### Project
A project is a job that a client has agreed to and the work has either begun, or has been finished already. Each project has a unique folder and a variety of folders associated with them.

### Proposal
A proposal is where a job is before the client has agreed to the work. It is the work that gets done before the project starts, and includes preparing documents for the client, and producing estimations for cost to produce a budget for the project if it is produced.

### Initiative
An initiative is the blanket term for either a Project or a Proposal. Project and Proposal are each a unique class that both extend Initiative.

## Tracked Documents

### Outpost Project Database
The Outpost Project Database, or as I will sometimes call it the OPD, is the google spreadsheet that holds the basic information for every project we have, including their locations in the tape library.

### Reconciliation Sheet
This is the sheet each employee uses to log down all the work they did for a project. There is a Unique Reconciliation Sheet for every active project, and once they go inactive the Reconciliation Sheets are archived.

### Job Costing Sheet
This is a sheet we use to calculate how much we need to charge for the work we are doing. Not every project has a Job Costing Sheet, this is something that is mostly used for new jobs or clients that we don't have previous work to look at to produce a quote.

### Proposal Document
This is a document that gets sent to a client before any work has been agreed to, proposing that we could do work for them. They only get produced for some projects. Eventually both the job costing sheet and the proposal document will be linked automatically and they will reference information from each other.

## The Export Problem
If you look through the code, you will see throughout it times I would normally just use something like 
```
import { something } from './module'

something();
```
y'know, like a normal person? I always do this:
```
import { something } from './module'

declare const exports: {
  something: typeof something;
};

exports.something();
```
And the reason for that is that google apps script is not JavaScript. Somehow its worse. Google apps script does a few things, and more specifically clasp doesn't do a few things that it probably should. 

You see, in google apps script there are no folders, every script gets run in the same folder, and there is no file specific namespace. Everything is global. Nothing needs to be imported ever because it is already in the same scope. To deal with that, clasp decides to put everything that is being exported out, into an object called exports. Clasp at no point tries to unpack these automatically.

This means typescript that you would fully expect to run with no issues will not work at runtime.

There are 2 solutions to this problem. I have chosen the bad one. (Maybe there is a case study in the future for fixing that)

### The Bad Solution
The bad solution is to do what I've done and:
  - Always make sure things that are exported don't overwrite the key of anything else that has been exported in this project.
  - Declare the exports object so typescript knows its there
    - Just assign everything that you import to type of itself
  - Always call imported items through the exports object.
This is find if you are attentive.

### The Better Solution
Using JavaScripts built in namespace system, we can manually assign each file their own namespace, and sort everything that way. Below is what google has to say in the clasp documentation about that.

#### The namespace statement workaround
This workaround takes advantage of TypeScript "namespaces" (formerly known as "internal module") and achieves proper code isolation.

Namespace definition can be nested, spread over multiple files and do not need any import/require statement to be used.
```
// module.ts
namespace Module {
  export function foo() {}
  function bar() {}  // this function can only be addressed from within the `Module` namespace
}
```
```
// anyFiles.ts
Module.foo();  // address a namespace's exported content directly

const nameIWantForMyImports = Module.foo;  // to simulate `import` with renaming
nameIWantForMyImports();
```
For a more detailed example on how namespaces can be used in a project you can visit [ts-gas-project-starter](https://github.com/PopGoesTheWza/ts-gas-project-starter)

