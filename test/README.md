## Setup

1. On the 21PSTEM Shared Google Drive get file: Developer/VmtEncompass/mt-sso_env-test
2. Move file to local mt-sso directory
3. Rename current .env to .env-dev and mt-sso_env-test to .env
4. Start sso server: in vmt/server/ `npm run dev-sso` 
5. Open encompass/app_server/config.js: `testPort: 8082`
7. In terminal in /encompass `npm run seed`
8. In terminal in /encompass `npm run test-back`
9. Open encompass/app_server/config.js: `testPort: 8081`
10. In new terminal in /encompass `npm run start-test`
11. In new terminal in /encompass `npm run selenium`

Note: switch mt-sso .env files when running development server (.env -> .env-test, .env-dev -> .env)

## Overview

`npm run test` runs e2e tests in app/test/selenium first, then api tests in app/test/mocha

The goal of these full stack integration tests is to make sure things are working together.  Related: cover things that are impossible (or too hard) to do with unit tests.

The risk is writing every test as an integration test and not knowing what layer things broke at.

Perhaps one rule of thumb or starting point is to cover the cross product of the operations and the models.

CRUD x Models

              Create  Read  Update  Delete
Users            X    X       X
Workspaces            X
Folders               X
Submissions           X
Selections            X
Taggings              X
Responses        X    X
Sections

## TODO
- remove diver.sleep from tests and change to blocking awaiting selectors (will cut total test time in half)
- testing for dashboard
- testing for metrics route

# Flaky Tests
- returning to login randomly results in 404 but clicking the logout button puts it back on track

# confirm_email tests don't route properly

# assignments_student.js
  1) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           contributors should only contain the submitting student:

      AssertionError: expected '' to deeply equal 'actingstudent'
      + expected - actual

      +actingstudent
      
      at Context.<anonymous> (test/selenium/assignments_student.js:109:55)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  2) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           should succesfully create answer:
     TimeoutError: Waiting for element to be located By(css selector, #past-submissions-header)
Wait timed out after 10052ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  3) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           Viewing most recent submission
             "before all" hook for "should display correct brief summary":
     TypeError: Cannot read property 'click' of undefined
      at Context.<anonymous> (test/selenium/assignments_student.js:197:30)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)