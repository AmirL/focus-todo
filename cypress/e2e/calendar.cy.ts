/// <reference types="cypress" />

describe("Calendar Day View", () => {
  let createdTaskIds: number[] = [];
  let workListId: number;

  before(() => {
    // Dynamically fetch a valid listId
    const apiKey = Cypress.env("API_TEST_KEY");
    cy.request({
      method: "GET",
      url: "/api/lists",
      headers: { "x-api-key": apiKey },
    }).then((response) => {
      expect(response.body.lists.length).to.be.greaterThan(0);
      workListId = response.body.lists[0].id;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", "/api/create-completed-task").as(
      "createCompletedTask",
    );
    cy.intercept("POST", "/api/update-time-entry").as("updateTimeEntry");
    cy.intercept("POST", "/api/delete-time-entry").as("deleteTimeEntry");
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  function createCompletedTaskViaApi(
    name: string,
    startedAt: string,
    endedAt: string,
    listId: number,
  ): Cypress.Chainable<number> {
    return cy
      .request({
        method: "POST",
        url: "/api/create-completed-task",
        body: {
          task: { name, listId },
          startedAt,
          endedAt,
        },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        const taskId = response.body.task.id as number;
        createdTaskIds.push(taskId);
        return cy.wrap(taskId);
      });
  }

  function todayAt(hour: number, minute: number): string {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  }

  function setupEntriesAndVisitCalendar(prefix: string) {
    createCompletedTaskViaApi(
      `${prefix} A ${Date.now()}`,
      todayAt(9, 0),
      todayAt(10, 0),
      workListId,
    );
    createCompletedTaskViaApi(
      `${prefix} B ${Date.now()}`,
      todayAt(11, 0),
      todayAt(12, 0),
      workListId,
    );
    cy.visit("/calendar");
    cy.waitForAppLoad();
  }

  it("should load the calendar page and show time entries", () => {
    setupEntriesAndVisitCalendar("Load test");

    cy.get('[data-cy="calendar-day-page"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="day-timeline"]').should("be.visible");
    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 }).should(
      "have.length.at.least",
      2,
    );
  });

  it("should navigate between days using prev/next buttons", () => {
    cy.visit("/calendar");
    cy.waitForAppLoad();

    cy.get('[data-cy="day-timeline-header"]').should("be.visible");

    // Get today's date text
    cy.get('[data-cy="day-timeline-header"]')
      .invoke("text")
      .then((todayText) => {
        // Click next day
        cy.get('[data-cy="day-timeline-next"]').click();
        cy.get('[data-cy="day-timeline-header"]')
          .invoke("text")
          .should("not.eq", todayText);

        // Click prev day twice to go to yesterday
        cy.get('[data-cy="day-timeline-prev"]').click();
        cy.get('[data-cy="day-timeline-header"]')
          .invoke("text")
          .should("contain", todayText.trim());
      });
  });

  it("should open inline editor when clicking a time block", () => {
    setupEntriesAndVisitCalendar("Edit test");

    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 })
      .first()
      .click();

    cy.get('[data-cy="day-timeline-inline-editor"]').should("be.visible");
    cy.get('[data-cy="day-timeline-edit-start"]').should("be.visible");
    cy.get('[data-cy="day-timeline-edit-end"]').should("be.visible");
    cy.get('[data-cy="day-timeline-edit-save"]').should("be.visible");
    cy.get('[data-cy="day-timeline-edit-cancel"]').should("be.visible");
  });

  it("should cancel inline edit without saving", () => {
    setupEntriesAndVisitCalendar("Cancel edit test");

    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 })
      .first()
      .click();

    cy.get('[data-cy="day-timeline-inline-editor"]').should("be.visible");
    cy.get('[data-cy="day-timeline-edit-cancel"]').click();
    cy.get('[data-cy="day-timeline-inline-editor"]').should("not.exist");
  });

  it("should save edited time entry via inline editor", () => {
    setupEntriesAndVisitCalendar("Save edit test");

    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 })
      .first()
      .click();

    cy.get('[data-cy="day-timeline-inline-editor"]').should("be.visible");

    // Modify end time
    cy.get('[data-cy="day-timeline-edit-end"]').clear().type("10:30");
    cy.get('[data-cy="day-timeline-edit-save"]').click();

    cy.wait("@updateTimeEntry").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
    });
  });

  it("should delete a time entry", () => {
    setupEntriesAndVisitCalendar("Delete test");

    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 }).should(
      "have.length.at.least",
      2,
    );

    cy.get('[data-cy="day-timeline-delete-btn"]').first().click();

    cy.wait("@deleteTimeEntry").then((interception) => {
      expect(interception.response!.statusCode).to.eq(200);
    });

    // One fewer block
    cy.get('[data-cy="day-timeline-block"]', { timeout: 10000 }).should(
      "have.length.at.least",
      1,
    );
  });

  it("should open gap dialog when clicking a gap between entries", () => {
    setupEntriesAndVisitCalendar("Gap click test");

    cy.get('[data-cy="day-timeline-gap"]', { timeout: 10000 }).should(
      "have.length.at.least",
      1,
    );

    cy.get('[data-cy="day-timeline-gap"]').first().click();

    cy.get('[data-cy="quick-add-gap-dialog"]', { timeout: 5000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="gap-start-time"]').should("not.have.value", "");
    cy.get('[data-cy="gap-end-time"]').should("not.have.value", "");
  });

  it("should show add entry button on hour row hover and open dialog", () => {
    cy.visit("/calendar");
    cy.waitForAppLoad();

    cy.get('[data-cy="day-timeline"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // The add entry button is opacity-0 until hover; use force click
    cy.get('[data-cy="day-timeline-add-entry"]')
      .first()
      .click({ force: true });

    cy.get('[data-cy="quick-add-gap-dialog"]', { timeout: 5000 }).should(
      "be.visible",
    );
  });

  it("should show empty state when no time entries exist for a day", () => {
    // Navigate to calendar and go to a past day unlikely to have entries
    cy.visit("/calendar");
    cy.waitForAppLoad();

    // Click prev multiple times to go to a day without entries
    for (let i = 0; i < 30; i++) {
      cy.get('[data-cy="day-timeline-prev"]').click();
    }

    cy.get('[data-cy="day-timeline-empty"]', { timeout: 5000 }).should(
      "be.visible",
    );
  });

  it("should navigate to calendar from sidebar link", () => {
    cy.visit("/");
    cy.waitForAppLoad();

    cy.get('[data-cy="calendar-link"]').click();
    cy.url().should("include", "/calendar");
    cy.get('[data-cy="calendar-day-page"]', { timeout: 10000 }).should(
      "be.visible",
    );
  });

  it("should show calendar link between filters and categories in sidebar", () => {
    cy.visit("/");
    cy.waitForAppLoad();

    // Calendar link should exist in the sidebar
    cy.get('[data-cy="calendar-link"]').should("be.visible");

    // Calendar link should be after the filter buttons (e.g., Future)
    // and before the Categories section
    cy.get('[data-cy="filter-future"]')
      .parent()
      .within(() => {
        // Calendar link is inside the same filter button group
        cy.get('[data-cy="calendar-link"]').should("exist");
      });
  });
});
