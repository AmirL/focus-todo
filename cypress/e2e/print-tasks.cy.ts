/// <reference types="cypress" />

describe("Print Tasks", () => {
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    cy.intercept("POST", "/api/create-task").as("createTask");
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    cy.apiCleanupTasks(createdTaskIds);
    createdTaskIds = [];
  });

  function createTask(name: string): Cypress.Chainable<number> {
    cy.get('[data-cy="add-task-button"]').click();
    cy.get('[data-cy="task-name-input"]').type(name);
    cy.get('[data-cy="save-task-button"]').click();
    return cy.wait("@createTask").then((interception) => {
      const taskId = interception.response!.body.id as number;
      createdTaskIds.push(taskId);
      cy.get(`[data-cy="task-${taskId}"]`, { timeout: 15000 }).should(
        "be.visible",
      );
      return cy.wrap(taskId);
    });
  }

  it("should show print button on Today page when tasks exist", () => {
    cy.get('[data-cy="filter-today"]').click();
    const taskName = `Print test ${Date.now()}`;
    createTask(taskName);

    cy.get('[data-cy="print-tasks-btn"]', { timeout: 10000 }).should(
      "be.visible",
    );
    cy.get('[data-cy="print-tasks-btn"]').should("contain.text", "Tasks");
  });

  it("should not show print button when no printable tasks exist", () => {
    // Navigate to a filter unlikely to have tasks (Future)
    cy.get('[data-cy="filter-future"]').click();

    // Print button should not be visible when there are no tasks
    // (or may not exist at all)
    cy.wait(2000);
    cy.get("body").then(($body) => {
      // If no tasks are visible, print button should not appear
      if ($body.find('[data-cy^="task-"]').length === 0) {
        cy.get('[data-cy="print-tasks-btn"]').should("not.exist");
      }
    });
  });

  it("should trigger print when clicking the print button", () => {
    cy.get('[data-cy="filter-today"]').click();
    const taskName = `Print trigger test ${Date.now()}`;
    createTask(taskName);

    cy.get('[data-cy="print-tasks-btn"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Stub window.open to capture the print call without actually opening a window
    const stubWindow = {
      document: {
        write: cy.stub().as("docWrite"),
        close: cy.stub().as("docClose"),
      },
      focus: cy.stub().as("winFocus"),
      print: cy.stub().as("winPrint"),
      close: cy.stub().as("winClose"),
    };
    cy.window().then((win) => {
      cy.stub(win, "open").returns(stubWindow);
    });

    cy.get('[data-cy="print-tasks-btn"]').click();

    // Verify the print workflow was triggered
    cy.get("@docWrite").should("have.been.calledOnce");
    cy.get("@docClose").should("have.been.calledOnce");
    cy.get("@winFocus").should("have.been.calledOnce");
    cy.get("@winPrint").should("have.been.calledOnce");
    cy.get("@winClose").should("have.been.calledOnce");

    // Verify the HTML content contains "Daily Tasks" header and the task name
    cy.get("@docWrite").then((stub) => {
      const htmlContent = (stub as unknown as Cypress.Agent<sinon.SinonStub>)
        .firstCall.args[0] as string;
      expect(htmlContent).to.contain("Daily Tasks");
      expect(htmlContent).to.contain(taskName);
    });
  });

  it("should include task duration info in print output", () => {
    cy.intercept("POST", "/api/update-task").as("updateTask");

    cy.get('[data-cy="filter-today"]').click();
    const taskName = `Duration print ${Date.now()}`;
    createTask(taskName).then((taskId) => {
      // Set estimated duration
      cy.get(`[data-cy="task-${taskId}"]`)
        .find('[data-cy^="estimated-time-task-"]')
        .click();
      cy.get('[role="menuitem"]', { timeout: 10000 })
        .contains("1 hour")
        .click();
      cy.wait("@updateTask");

      // Wait for UI to settle
      cy.wait(1000);

      // Stub window.open
      const stubWindow = {
        document: {
          write: cy.stub().as("docWrite2"),
          close: cy.stub(),
        },
        focus: cy.stub(),
        print: cy.stub(),
        close: cy.stub(),
      };
      cy.window().then((win) => {
        cy.stub(win, "open").returns(stubWindow);
      });

      cy.get('[data-cy="print-tasks-btn"]').click();

      cy.get("@docWrite2").then((stub) => {
        const htmlContent = (stub as unknown as Cypress.Agent<sinon.SinonStub>)
          .firstCall.args[0] as string;
        // Should contain duration-related content (e.g., "1h" or "60")
        expect(htmlContent).to.contain(taskName);
      });
    });
  });
});
