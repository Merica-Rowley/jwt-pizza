# Curiosity Report: Test Database Setup and Teardown

## What I Am Doing

For my curiosity report, I decided to experiment with my testing environment. Specifically, I decided to redesign my tests so that they used a separate database, rather than polluting my development database with testing data. To do this, I created a set up that would initialize a new database each time the tests were run and then remove that database once the tests were finished.

## Why I Am Doing It

As I was creating and running my tests for Deliverable 3 (unit testing with Jest for the jwt-pizza-service), I realized that my local development database was getting polluted with all sorts of test data. For the purposes of this class, having the garbage data in the development database isn't a huge deal, but in a professional environment, leaving test data in the development database would be unacceptable. In class, several people had mentioned various methods for keeping their development database clean, and the one that made the most sense to me was to spin up a new database for each testing iteration, so I decided to attempt that. This was a bit of an experiment for me, since I haven't done too much with testing or databases up to this point. However, I was able to learn quite a bit in the process.

## What Happened?

Before starting any actual code, I had a general idea of what I wanted to be able to do:

1. Create a new, clean database each time I ran tests,
2. Use the new database for my tests without touching data in the original database, and
3. Remove the new database and all of its data after each test run is finished.

However, I really didn't know where to start beyond that. So, I turned to ChatGPT for a little bit of help.

One of the first things that I needed to do was create a .env.test file, which holds the data for my test database. For example:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=myfakesecretpassword
DB_NAME=pizza_test
```

This data was later used to log in to mySQL and create the database.

In order to use this data, I also needed to alter my config.js file so that the data in .env.test would be used when I was doing testing but my regular data would be used when running my code in my development environment. This is done using the NODE_ENV variable, which can hold various values. When using Jest, NODE_ENV is set to test ([see here](https://jestjs.io/docs/environment-variables)). The database name is then determined based on the value of NODE_ENV (if in development or production, use the regular development database; if in testing, use the testing database name, which is determined from the provided DB_NAME variable concatenated with a random number, e.g. pizza_test_45678).

After changing my config file, the next thing I needed to do was add paths to setup and teardown code to my jest.config file.

Here is the result in my jest.config.json:

```json
{
  "collectCoverage": true,
  "coverageReporters": ["json-summary", "text"],
  "coverageThreshold": {
    "global": {
      "lines": 80
    }
  },
  "globalSetup": "./tests/setup/globalSetup.js",
  "globalTeardown": "./tests/setup/globalTeardown.js",
  "testEnvironment": "node",
  "setupFiles": ["dotenv/config"]
}
```

The new lines include "globalSetup", "globalTeardown", "testEnvironment", and "setupFiles" (the lines for coverage were already present).

After that, I needed to actually create the globalSetup and globalTeardown files.

Within the globalSetup file, I connect to mySQL, create a new database for the tests (first checking to make sure the database doesn't already exist; if it does, then I remove it before recreating it), and finally save the name of the database to a file so that my teardown code can access it afterwards.

In the globalTeardown file, I read the name of the database from the file, connect to mySQL, and then remove the database.

In order to make sure that the test database wasn't created when the tests were run as part of the CI process in GitHub actions (since we were already creating a fresh database for the tests there, we didn't need to make a second database as well), I added these lines to the globalSetup and globalTeardown files, respectively.

```js
// in globalSetup
if (process.env.CI) {
  console.log("✅ CI environment detected — skipping local test DB creation.");
  return;
}

// in globalTeardown
if (process.env.CI) {
  console.log("✅ CI environment detected — skipping test DB teardown.");
  return;
}
```

As part of this, I learned about the CI environment variable, which is set to true if a job is being run in GitHub Actions CI ([see here](https://docs.gitlab.com/ci/variables/predefined_variables/)).

After implementing these changes, I was running into a few problems in trying to connect to my database. I discovered that there were some issues with the asynchronous nature of initializing the database. To fix this, I moved the initialization of the database from the constructor to its own init() function. After this, I needed to modify my tests and service files to call the init() function before any interactions with the database. Once I had adapted the tests and services, the program was successfully able to connect with the database.

The last thing that I needed to do was add some dummy test data to the database (such as menu items and a franchise with a store). After fixing a few minor bugs, my setup was ready to go!

## Future Improvements

After getting the testing databases all set up, I found that there was still at least one bug. The database setup and takedown worked almost flawlessly (with the databases being added and dropped from mySQL), but sometimes the testing database would be left behind. I think that this happened when my tests were specifically testing erroneous actions that were supposed to throw an error. When this happened, the connection to the database would close, and the database wouldn't be dropped from mySQL. To improve this in the future, I would determine how to handle testing correct error handling while still managing to delete the testing database properly.

The other problem that I discovered after completing the process to configure my testing suite to use the fresh database with each round of testing was a couple of deliverables later when we needed to deploy the backend on AWS. The way that I had my configuration set up made it so that deploying to AWS would be extremely complicated. Since we had finished working on the backend testing for this class, I decided to just put my codebase back to the original setup which used the development database for testing. (Since we were deploying to AWS and using a cloud database, it was no longer such a huge concern to have garbage data in the development database.) However, while regressing to the original setup works fine for the purposes of this class, if I was working for a company, it would be more important to have a testing environment that was properly separated from the development environment.

## Final Thoughts

I enjoyed doing this curiosity project! I feel like I learned a lot through hands-on experimentation with the code. I ran into a couple of dead ends and strange bugs, but in the end I was able to get them mostly ironed out and achieve the result that I was looking for.

Some of the main things I learned about in this project:

- The need for clean testing environments
- Jest globalSetup and globalTeardown (which basically function as global beforeAll and afterAll blocks of code for the entire testing suite)
- Environment variables (i.e. development, test, and CI)
