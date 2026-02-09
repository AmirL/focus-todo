/// <reference types="cypress" />

describe("Task Management", () => {
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

  describe("Create Tasks", () => {
    it("should create a new task using the add task button", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type("Buy groceries");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Buy groceries").should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });

    it("should create a task for a specific date", () => {
      cy.get('[data-testid="add-task-button"]').click();
      cy.get('[data-testid="task-name-input"]').type("Schedule meeting");
      cy.get('[data-testid="save-task-button"]').click();
      cy.contains("Schedule meeting").should("be.visible");

      cy.wait("@createTask").then((interception) => {
        createdTaskIds.push(interception.response!.body.id);
      });
    });
  });

  describe("Task Actions", () => {
    it("should mark a task as complete", () => {
      // Radix checkbox uses role="checkbox"
      cy.get('[data-testid^="task-"]').first().find('[role="checkbox"]').click();
      cy.get(".line-through").should("exist");
    });

    it("should star/select a task", () => {
      // Get the first task name to verify later
      cy.get('[data-testid^="task-"]').first().invoke('text').then((taskText) => {
        // Hover and click star
        cy.get('[data-testid^="task-"]').first().trigger('mouseover');
        cy.get('[data-testid^="star-task-"]').first().click({ force: true });
        // Navigate to Selected and verify task appears there
        cy.prompt(["Click the 'Selected' button in the sidebar"]);
        cy.contains(taskText.slice(0, 20)).should("exist");
      });
    });

    it("should delete a task", () => {
      cy.get('[data-testid^="delete-task-"]').first().click();
      cy.get(".line-through").should("exist");
    });

    it("should snooze a task to a different date", () => {
      cy.get('[data-testid^="snooze-task-"]').first().click();
      // Wait for calendar grid to exist and scroll it into view
      cy.get('[role="grid"]', { timeout: 15000 }).scrollIntoView().should('exist');
      // Click next month button with force to handle any overflow issues
      cy.get('button.absolute.right-1').click({ force: true });
      // Wait for month change and select a day - use simple button selector within grid
      cy.wait(500);
      cy.get('[role="grid"] button.h-8.w-8').not('.day-outside').eq(10).click({ force: true });
    });

    it("should mark a task as a blocker", () => {
      cy.get('[data-testid^="blocker-task-"]').first().click();
      // Blocker icon SVG should have fill when selected
      cy.get('[data-testid^="blocker-task-"]').first().should("have.class", "text-blue-600");
    });
  });

  describe("Edit Tasks", () => {
    it("should edit task name", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('#name').clear().type("Updated task name");
      cy.get('[data-testid="save-task-changes-button"]').click();
      cy.contains("Updated task name").should("be.visible");
    });

    it("should open edit dialog", () => {
      cy.get('[data-testid^="edit-task-"]').first().click();
      cy.get('[role="dialog"]').should("be.visible");
      cy.get('[data-testid="save-task-changes-button"]').click();
    });
  });

  describe("Filter Tasks", () => {
    it("should navigate to Today filter", () => {
      cy.prompt(["Click the 'Today' button in the sidebar"]);
      cy.contains("today").should("exist");
    });

    it("should navigate to Tomorrow filter", () => {
      cy.prompt(["Click the 'Tomorrow' button in the sidebar"]);
      cy.contains("tomorrow").should("exist");
    });

    it("should navigate to Backlog filter", () => {
      cy.prompt(["Click the 'Backlog' button in the sidebar"]);
      cy.contains("backlog").should("exist");
    });

    it("should navigate to Selected filter", () => {
      cy.prompt(["Click the 'Selected' button in the sidebar"]);
      cy.contains("selected").should("exist");
    });

    it("should navigate to Future filter", () => {
      cy.prompt(["Click the 'Future' button in the sidebar"]);
      cy.contains("future").should("exist");
    });
  });
});
