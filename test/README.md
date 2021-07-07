## Setup

1. On the 21PSTEM Shared Google Drive get file: Developer/VmtEncompass/mt-sso_env-test
2. Move file to local mt-sso directory
3. Rename current .env to .env-dev and mt-sso_env-test to .env
4. Start sso server: in vmt/server/ `npm run dev-sso` 
5. Start EnCoMPASS test server: in encompass/ `grunt serve-seed`
5. Start EnCoMPASS tests: in encompass/ `npm run test`

Note: switch mt-sso .env files when running development server (.env -> .env-test, .env-dev -> .env)

## Executing

- In vmt/server `npm run dev-sso`
- In encompass `npm run test`

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

# assignments_student.js
  1) Assignments as Student
       As Student
         Visting Summer's Org Problem / Sep 6th 2018
           should display assignment details:
     TimeoutError: Could not find Nov 30th 2018 in DOM
Wait timed out after 10172ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  2) Assignments as Student
       As Student
         Submitting response to assignment
           should display Revise button:
     AssertionError: expected undefined to deeply equal 'Revise'
      at Context.<anonymous> (test/selenium/assignments_student.js:74:104)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  3) Assignments as Student
       As Student
         Submitting response to assignment
           Clicking button should bring up new answer form:

      AssertionError: expected false to be true
      + expected - actual

      -false
      +true
      
      at Context.<anonymous> (test/selenium/assignments_student.js:80:95)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  4) Assignments as Student
       As Student
         Submitting response to assignment
           brief summary should be prefilled:
     AssertionError: expected undefined to deeply equal 'This is a brief summary of my thoughts.'
      at Context.<anonymous> (test/selenium/assignments_student.js:86:107)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  5) Assignments as Student
       As Student
         Submitting response to assignment
           explanation should be prefilled:
     AssertionError: expected undefined to deeply equal 'This is my explanation.'
      at Context.<anonymous> (test/selenium/assignments_student.js:89:102)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  6) Assignments as Student
       As Student
         Submitting response to assignment
           contributors should list all contributors from previous answer:

      AssertionError: expected [] to have a length of 1 but got 0
      + expected - actual

      -0
      +1
      
      at Context.<anonymous> (test/selenium/assignments_student.js:94:41)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  7) Assignments as Student
       As Teacher acting as Student
         Visting Summer's Org Problem / Sep 6th 2018
           should display assignment details:
     TimeoutError: Could not find Nov 30th 2018 in DOM
Wait timed out after 10078ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  8) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           should display Share Your Ideas button:
     AssertionError: expected undefined to deeply equal 'Share Your Ideas'
      at Context.<anonymous> (test/selenium/assignments_student.js:74:104)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  9) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           Clicking button should bring up new answer form:

      AssertionError: expected false to be true
      + expected - actual

      -false
      +true
      
      at Context.<anonymous> (test/selenium/assignments_student.js:80:95)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  10) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           brief summary should empty:
     AssertionError: expected undefined to deeply equal ''
      at Context.<anonymous> (test/selenium/assignments_student.js:100:107)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  11) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           explanation should empty:
     AssertionError: expected undefined to deeply equal ''
      at Context.<anonymous> (test/selenium/assignments_student.js:103:102)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  12) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           contributors should only contain the submitting student:

      AssertionError: expected [] to have a length of 1 but got 0
      + expected - actual

      -0
      +1
      
      at Context.<anonymous> (test/selenium/assignments_student.js:107:41)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  13) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           should display error if explanation is omitted:

      AssertionError: expected [] to have a length of 1 but got 0
      + expected - actual

      -0
      +1
      
      at Context.<anonymous> (test/selenium/assignments_student.js:127:38)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  14) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           should display error if brief summary is omitted:

      AssertionError: expected [] to have a length of 1 but got 0
      + expected - actual

      -0
      +1
      
      at Context.<anonymous> (test/selenium/assignments_student.js:141:38)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  15) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           should succesfully create answer:
     TimeoutError: Waiting for element to be located By(css selector, #past-submissions-header)
Wait timed out after 10075ms
      at /Users/timothyleonard/Documents/21PSTEM/migration/encompass/node_modules/selenium-webdriver/lib/webdriver.js:897:17
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)

  16) Assignments as Student
       As Teacher acting as Student
         Submitting response to assignment
           Viewing most recent submission
             "before all" hook for "should display correct brief summary":
     TypeError: Cannot read property 'click' of undefined
      at Context.<anonymous> (test/selenium/assignments_student.js:196:30)
      at runMicrotasks (<anonymous>)
      at processTicksAndRejections (internal/process/task_queues.js:97:5)