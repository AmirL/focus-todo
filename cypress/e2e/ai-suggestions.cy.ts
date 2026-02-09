/// <reference types="cypress" />

const apiKey = Cypress.env("API_TEST_KEY");
const authHeaders = { "X-API-Key": apiKey };

let workListId: number;

const pendingSuggestions = {
  name: { suggestion: "Improved task title", userReaction: null },
  details: { suggestion: "Better description with more context", userReaction: null },
  estimatedDuration: { suggestion: "60", userReaction: null },
};

const reviewedSuggestions = {
  name: { suggestion: "Improved task title", userReaction: "accepted" as const },
  details: { suggestion: "Better description", userReaction: "rejected" as const },
};

function createTaskWithSuggestions(
  name: string,
  aiSuggestions: Record<string, unknown>
): Cypress.Chainable<number> {
  return cy
    .request({
      method: "POST",
      url: "/api/tasks",
      headers: authHeaders,
      body: { name, listId: workListId },
    })
    .then((response) => {
      const taskId = response.body.task.id;
      return cy
        .request({
          method: "PATCH",
          url: `/api/tasks/${taskId}`,
          headers: authHeaders,
          body: { aiSuggestions },
        })
        .then(() => taskId);
    });
}

function findTaskElement(taskId: number) {
  return cy.get(`[data-testid="task-${taskId}"]`);
}

function openEditDialog(taskId: number) {
  cy.get(`[data-testid="edit-task-${taskId}"]`).click();
  cy.get('[role="dialog"]').should("be.visible");
}

describe("AI Suggestions", () => {
  let createdTaskIds: number[] = [];

  before(() => {
    cy.request({
      method: "GET",
      url: "/api/tasks?limit=1",
      headers: authHeaders,
    }).then((response) => {
      expect(response.body.tasks.length).to.be.greaterThan(0);
      workListId = response.body.tasks[0].listId;
    });
  });

  beforeEach(() => {
    expect(apiKey, "API_TEST_KEY should be configured").to.exist;
    cy.visit("/");
    cy.waitForAppLoad();
  });

  afterEach(() => {
    createdTaskIds.forEach((taskId) => {
      cy.request({
        method: "DELETE",
        url: `/api/tasks/${taskId}?permanent=true`,
        headers: authHeaders,
        failOnStatusCode: false,
      });
    });
    createdTaskIds = [];
  });

  describe("Badge in task list", () => {
    it("should show AI suggestion badge for tasks with pending suggestions", () => {
      const name = `AI badge test ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        findTaskElement(taskId)
          .find('[data-cy="ai-suggestion-badge"]')
          .should("be.visible");
      });
    });

    it("should not show badge for tasks with all reviewed suggestions", () => {
      const name = `AI no-badge test ${Date.now()}`;
      createTaskWithSuggestions(name, reviewedSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        findTaskElement(taskId)
          .find('[data-cy="ai-suggestion-badge"]')
          .should("not.exist");
      });
    });

    it("should not show badge when suggestion matches current task value", () => {
      const taskName = `AI match test ${Date.now()}`;
      createTaskWithSuggestions(taskName, {
        name: { suggestion: taskName, userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        findTaskElement(taskId)
          .find('[data-cy="ai-suggestion-badge"]')
          .should("not.exist");
      });
    });
  });

  describe("Suggestion banners in edit dialog", () => {
    it("should show suggestion banners for all pending fields", () => {
      const name = `AI banners test ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="ai-suggestion-banner-name"]').should("be.visible");
        cy.get('[data-cy="ai-suggestion-banner-estimatedDuration"]').scrollIntoView().should("be.visible");
        cy.get('[data-cy="ai-suggestion-banner-details"]').scrollIntoView().should("be.visible");
      });
    });

    it("should not show banner when suggestion matches current field value", () => {
      const taskName = `AI banner match ${Date.now()}`;
      createTaskWithSuggestions(taskName, {
        name: { suggestion: taskName, userReaction: null },
        details: { suggestion: "Different details", userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        // Name suggestion matches current value - should not show
        cy.get('[data-cy="ai-suggestion-banner-name"]').should("not.exist");
        // Details suggestion does NOT match - should show
        cy.get('[data-cy="ai-suggestion-banner-details"]')
          .scrollIntoView()
          .should("be.visible");
      });
    });

    it("should accept name suggestion and update field value", () => {
      const name = `AI accept name ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="accept-suggestion-name"]').click();

        // Name input should now have the suggested value
        cy.get('[data-testid="task-name-input"]').should(
          "have.value",
          "Improved task title"
        );

        // Banner should disappear
        cy.get('[data-cy="ai-suggestion-banner-name"]').should("not.exist");
      });
    });

    it("should reject details suggestion and keep current value", () => {
      const name = `AI reject details ${Date.now()}`;
      createTaskWithSuggestions(name, {
        details: { suggestion: "Should not appear", userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="reject-suggestion-details"]').click();

        // Banner should disappear
        cy.get('[data-cy="ai-suggestion-banner-details"]').should("not.exist");
      });
    });

    it("should accept duration suggestion and update metadata", () => {
      const name = `AI accept duration ${Date.now()}`;
      createTaskWithSuggestions(name, {
        estimatedDuration: { suggestion: "60", userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="ai-suggestion-banner-estimatedDuration"]')
          .should("be.visible")
          .and("contain.text", "1h");

        cy.get('[data-cy="accept-suggestion-estimatedDuration"]').click();

        // Banner should disappear
        cy.get('[data-cy="ai-suggestion-banner-estimatedDuration"]').should(
          "not.exist"
        );
      });
    });

    it("should persist accepted suggestion via API on save", () => {
      const name = `AI persist accept ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();

        cy.intercept("POST", "/api/update-task").as("updateTask");

        openEditDialog(taskId);
        cy.get('[data-cy="accept-suggestion-name"]').click();
        cy.get('[data-testid="save-task-changes-button"]').click();

        cy.wait("@updateTask").then((interception) => {
          const task = interception.request.body.task;
          expect(task.aiSuggestions.name.userReaction).to.eq("accepted");
        });
      });
    });

    it("should persist rejected suggestion via API on save", () => {
      const name = `AI persist reject ${Date.now()}`;
      createTaskWithSuggestions(name, {
        details: { suggestion: "New details", userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();

        cy.intercept("POST", "/api/update-task").as("updateTask");

        openEditDialog(taskId);
        cy.get('[data-cy="reject-suggestion-details"]').click();
        cy.get('[data-testid="save-task-changes-button"]').click();

        cy.wait("@updateTask").then((interception) => {
          const task = interception.request.body.task;
          expect(task.aiSuggestions.details.userReaction).to.eq("rejected");
        });
      });
    });

    it("should remove badge from task list after accepting all suggestions and saving", () => {
      const name = `AI badge removal ${Date.now()}`;
      createTaskWithSuggestions(name, {
        name: { suggestion: "New title", userReaction: null },
      }).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();

        findTaskElement(taskId)
          .find('[data-cy="ai-suggestion-badge"]')
          .should("be.visible");

        openEditDialog(taskId);
        cy.get('[data-cy="accept-suggestion-name"]').click();
        cy.get('[data-testid="save-task-changes-button"]').click();

        // Badge should be gone after save
        findTaskElement(taskId)
          .find('[data-cy="ai-suggestion-badge"]')
          .should("not.exist");
      });
    });
  });

  describe("Clear suggestions button", () => {
    it("should show clear button when task has suggestions", () => {
      const name = `AI clear visible ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="clear-suggestions-button"]')
          .scrollIntoView()
          .should("be.visible");
      });
    });

    it("should not show clear button when task has no suggestions", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: { name: `No suggestions ${Date.now()}`, listId: workListId },
      }).then((response) => {
        const taskId = response.body.task.id;
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();
        openEditDialog(taskId);

        cy.get('[data-cy="clear-suggestions-button"]').should("not.exist");
      });
    });

    it("should clear all suggestions and persist via API", () => {
      const name = `AI clear persist ${Date.now()}`;
      createTaskWithSuggestions(name, pendingSuggestions).then((taskId) => {
        createdTaskIds.push(taskId);
        cy.visit("/");
        cy.waitForAppLoad();

        cy.intercept("POST", "/api/update-task").as("updateTask");

        openEditDialog(taskId);
        cy.get('[data-cy="clear-suggestions-button"]').click();

        cy.wait("@updateTask").then((interception) => {
          const task = interception.request.body.task;
          expect(task.aiSuggestions).to.be.null;
        });

        // Banners and clear button should disappear
        cy.get('[data-cy="ai-suggestion-banner-name"]').should("not.exist");
        cy.get('[data-cy="ai-suggestion-banner-details"]').should("not.exist");
        cy.get('[data-cy="ai-suggestion-banner-estimatedDuration"]').should(
          "not.exist"
        );
        cy.get('[data-cy="clear-suggestions-button"]').should("not.exist");
      });
    });
  });
});
