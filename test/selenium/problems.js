// REQUIRE MODULES
const { Builder } = require('selenium-webdriver');
const expect = require('chai').expect;

// REQUIRE FILES
const helpers = require('./helpers');
const dbSetup = require('../data/restore');
const css = require('./selectors');

const host = helpers.host;
const testUsers = require('./fixtures/users');
let topLink = css.topBar.problems;


describe('Problems', async function () {
  async function runTests(users) {
    function _runTests(user) {
      const { accountType, actingRole, testDescriptionTitle, problems } = user;
      const isStudent = accountType === 'S' || actingRole === 'student';
      const isAdmin = accountType === 'A';

      describe(`As ${testDescriptionTitle}`, function() {
        this.timeout(helpers.timeoutTestMsStr);
        let driver = null;

        before(async function() {
          driver = new Builder()
            .forBrowser('chrome')
            .build();
            await dbSetup.prepTestDb();
            return helpers.login(driver, host, user);
          });

        after(function() {
          return driver.quit();
        });

        describe('Visiting problems main page', function () {
          before(async function () {
            await helpers.findAndClickElement(driver, topLink);
            if (!isStudent) {
              await helpers.waitForSelector(driver, css.problemPageSelectors.problemContainer);
            }
          });

          it('should display side list of filter options', async function () {
            if (!isStudent) {
              expect(await helpers.waitForSelector(driver, css.problemPageSelectors.sideFilterOptions));
            }
            let optionsList = css.problemFilterList.primaryFilters;
            let filterOptions = helpers.createFilterList(isStudent, isAdmin, optionsList, true);
            let filterSelectors = helpers.createSelectors(filterOptions);
            expect(await helpers.checkSelectorsExist(driver, filterSelectors)).to.be.true;
          });

          it('should display category filter options', async function () {
            if (!isStudent) {
              await helpers.findAndClickElement(driver, '.category-header');
              let filterSelectors = helpers.createSelectors(css.problemFilterList.categoryFilters);
              expect(await helpers.checkSelectorsExist(driver, filterSelectors)).to.be.true;
              await helpers.findAndClickElement(driver, '.category-header');
            }
          });

          it('should update problem list when clicking on Public', async function () {
            if (!isStudent) {
              await helpers.findAndClickElement(driver, 'li.filter-everyone');
              let resultsMsg = `${problems.public.count} problems found`;
              expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
            }
          });

          it('should update problem list when clicking on Mine', async function () {
            if (!isStudent) {
              await helpers.findAndClickElement(driver, 'li.filter-mine');
              let resultsMsg = `${problems.mine.count} problems found`;
              expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
            }
          });

          describe('Clicking on My Org filter option', function () {
            before(async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.filter-myOrg');
              }
            });

            it('should update problem list when clicking on My Org', async function () {
              if (!isStudent) {
                let resultsMsg = `${problems.org.total} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });

            it('should update problem list when unchecking created by members', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.fromOrg');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                let resultsMsg = `${problems.org.recommended} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });

            it('should update problem list when unchecking recommended', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.recommended');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(css.noResultsMsg);
              }
            });

            it('should update problem list when checking created by members', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.fromOrg');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                let resultsMsg = `${problems.org.members} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });
          });

          describe('Clicking on Category filter menu', function () {
            before(async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.filter-myOrg');
              }
            });

            it('should update problem list when clicking on My Org', async function () {
              if (!isStudent) {
                let resultsMsg = `${problems.org.total} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });

            it('should update problem list when unchecking created by members', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.fromOrg');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                let resultsMsg = `${problems.org.recommended} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });

            it('should update problem list when unchecking recommended', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.recommended');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(css.noResultsMsg);
              }
            });

            it('should update problem list when checking created by members', async function () {
              if (!isStudent) {
                await helpers.findAndClickElement(driver, 'li.fromOrg');
                await helpers.waitForSelector(driver, css.resultsMesasage);
                let resultsMsg = `${problems.org.members} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              }
            });
          });

          if (isAdmin) {
            describe('Clicking on Trashed problems', function () {
              before(async function () {
                await helpers.findAndClickElement(driver, '.more-header');
              });

              it('should update problem list and display message', async function () {
                await helpers.findAndClickElement(driver, '#toggle-trashed');
                let resultsMsg = `2 problems found - Displaying Trashed Problems`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              });

              it('should restore a trashed problem', async function () {
                await helpers.findAndClickElement(driver, 'button.primary-button');
                await helpers.findAndClickElement(driver, 'button.swal2-confirm');
                await driver.sleep(500);
                let resultsMsg = `1 problems found - Displaying Trashed Problems`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              });

              it('should continue displaying trashed problems until unchecked', async function () {
                await helpers.findAndClickElement(driver, 'li.filter-mine');
                let resultsMsg = `${problems.mine.count} problems found - Displaying Trashed Problems`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                await helpers.findAndClickElement(driver, '#toggle-trashed');
                let updatedMsg = `${problems.mine.count} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(updatedMsg);
                await helpers.findAndClickElement(driver, '.more-header');
              });
            });

            describe('Clicking on All problems filter', function () {
              before(async function () {
                await helpers.findAndClickElement(driver, '.filter-all');
              });

              it('should update the problem list and display message', async function () {
                await helpers.waitForSelector(driver, css.resultsMesasage);
                let resultsMsg = `${problems.all.total} problems found`;
                expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
              });

              describe('Searching by organization', function () {
                before(async function () {
                  await helpers.findInputAndType(driver, '#all-org-filter-selectized', 'Mathematical Thinking', true);
                  await helpers.findAndClickElement(driver, css.resultsMesasage);
                });

                it('should select and organization then update the list and display message', async function () {
                  let resultsMsg = `${problems.all.org.total} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });

                it('should uncheck Created by Members then update the list and display message', async function () {
                  await helpers.findAndClickElement(driver, 'li.fromOrg');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  let resultsMsg = `${problems.all.org.recommended} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });

                it('should uncheck Recommended then no problems should appear', async function () {
                  await helpers.findAndClickElement(driver, 'li.recommended');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(css.noResultsMsg);
                });

                it('should check Created by Members and the update the list and display message', async function () {
                  await helpers.findAndClickElement(driver, 'li.fromOrg');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  let resultsMsg = `${problems.all.org.members} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });


              });

              describe('Searching by creator', function () {
                before(async function () {
                  await helpers.findAndClickElement(driver, '#admin-filter-select-selectized');
                  await helpers.findAndClickElement(driver, '[data-value="creator"]');
                  await helpers.findInputAndType(driver, '#all-user-filter-selectized', 'morty');
                  await helpers.waitForSelector(driver, '[data-value="5b245841ac75842be3189526"]');
                  await helpers.findAndClickElement(driver, '[data-value="5b245841ac75842be3189526"]');
                  await helpers.findAndClickElement(driver, css.resultsMesasage);
                });

                it('should select a creator and then update the list and display message', async function () {
                  let resultsMsg = `${problems.all.creator} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });
              });

              describe('Searching by PoWs', function () {
                before(async function () {
                  await helpers.findAndClickElement(driver, '.selectize-input');
                  await helpers.findAndClickElement(driver, '#admin-filter-select-selectized');
                  await helpers.findAndClickElement(driver, '[data-value="pows"]');
                });

                it('should update the list and display message', async function () {
                  let resultsMsg = `${problems.all.pows.total} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });

                it('should uncheck public then update the list and display message', async function () {
                  await helpers.findAndClickElement(driver, 'li.shared');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  let resultsMsg = `${problems.all.pows.private} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });

                it('should uncheck private then show no problems', async function () {
                  await helpers.findAndClickElement(driver, 'li.unshared');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(css.noResultsMsg);
                });

                it('should check private then update the list and display message', async function () {
                  await helpers.findAndClickElement(driver, 'li.shared');
                  await helpers.waitForSelector(driver, css.resultsMesasage);
                  let resultsMsg = `${problems.all.pows.public} problems found`;
                  expect(await helpers.findAndGetText(driver, css.resultsMesasage)).to.contain(resultsMsg);
                });
              });

            });
          }
        });
      });
    }
    for (let user of Object.keys(users)) {
      // eslint-disable-next-line no-await-in-loop
      await _runTests(users[user]);
    }
  }
  await runTests(testUsers);
});



//SORT BAR
//Test to check sort bar is there - options are accurate
//Test to check alphabetical sorting
//Test to check date sorting
//Test to check privacy filtering
//Test to check status filtering

//RESULTS
//Test that list view displays everything properly
//Test that card view displays everything properly
//Test that values update when changes are made
//Test button values are acurate
//Test more menu shows correct values
//Test button actions perform correctly
//Test more actions perform correctly
//Test pagination works

//SEARCH BAR
//Test that there are 2 drop down items
//Search works with enter and clicking button
//Clear button shows when query is applied or text in field
//Clearing search bar resets results properly
//Searching only applies to results of primary filters
//Searching should work for title, text, author, additional Info, status, flagReason, status, sharingAuth/copyright in that order
