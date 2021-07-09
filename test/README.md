## Setup

1. On the 21PSTEM Shared Google Drive get file: Developer/VmtEncompass/mt-sso_env-test
2. Move file to local mt-sso directory
3. Verify filename is .env_test
4. Start sso server: in mt-sso/ `npm run test` 
7. In terminal in /encompass `npm run seed`
8. In terminal in /encompass `npm run test-back`
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

# sections.js
1) Sections
       As PD Admin
         Visiting Morty's Math 101
           "before all" hook for "should display the section details":
     TimeoutError: Waiting for element to be located By(css selector, form[data-test="section-info-form"])
Wait timed out after 10166ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  2) Sections
       As PD Admin
         Create section
           Creating section
             submitting empty form
               should display error message(s):
     TimeoutError: Waiting for element to be located By(css selector, .error-message)
Wait timed out after 10025ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  3) Sections
       As PD Admin
         Create section
           Creating section
             submitting valid form
               should redirect to section-info page after creating:

      AssertionError: expected false to be true
      + expected - actual

      -false
      +true
      
      at Context.<anonymous> (test/selenium/sections.js:226:75)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  4) Sections
       As Teacher
         Visiting Summer's Algebra 2 1st Period
           "before all" hook for "should display the section details":
     TimeoutError: Waiting for element to be located By(css selector, form[data-test="section-info-form"])
Wait timed out after 10090ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  5) Sections
       As Teacher
         Create section
           Verify form inputs
             teacher field should be fixed as current user:
     AssertionError: expected undefined to deeply equal 'ssmith'
      at Context.<anonymous> (test/selenium/sections.js:116:103)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  6) Sections
       As Teacher
         Create section
           Creating section
             submitting empty form
               should display error message(s):
     TimeoutError: Waiting for element to be located By(css selector, .error-message)
Wait timed out after 10114ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  7) Sections
       As Admin
         Visiting Drexel University
           "before all" hook for "should display the section details":
     TimeoutError: Waiting for element to be located By(css selector, form[data-test="section-info-form"])
Wait timed out after 10147ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  8) Sections
       As Admin
         Create section
           Creating section
             submitting empty form
               should display error message(s):
     TimeoutError: Waiting for element to be located By(css selector, .error-message)
Wait timed out after 10121ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  9) Sections
       As Student
         Visiting Summer's Algebra 2 1st Period
           "before all" hook for "should display the section details":
     TimeoutError: Waiting for element to be located By(css selector, form[data-test="section-info-form"])
Wait timed out after 10166ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  10) Sections
       As Student
         Create section
           Navigating directly
             should redirect to sections:
     TimeoutError: Waiting for element to be located By(css selector, div#section-home)
Wait timed out after 10141ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  11) Sections
       As Teacher acting as Student
         Visiting Summer's Algebra 2 1st Period
           "before all" hook for "should display the section details":
     TimeoutError: Waiting for element to be located By(css selector, form[data-test="section-info-form"])
Wait timed out after 10174ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  12) Sections
       As Teacher acting as Student
         Create section
           Navigating directly
             should redirect to sections:
     TimeoutError: Waiting for element to be located By(css selector, div#section-home)
Wait timed out after 10179ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

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