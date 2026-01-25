/// <reference types="cypress" />

/**
 * E2E tests for the Task API endpoints
 * Tests all CRUD operations using API key authentication
 */
describe("Task API", () => {
  const apiKey = Cypress.env("API_TEST_KEY");

  const authHeaders = {
    "X-API-Key": apiKey,
  };

  // Store created task IDs for cleanup
  let createdTaskIds: number[] = [];

  beforeEach(() => {
    // Verify API key is configured
    expect(apiKey, "API_TEST_KEY should be configured").to.exist;
  });

  describe("API Key Authentication (no session)", () => {
    it("should work with only API key, without session cookie", () => {
      // Clear all cookies to ensure no session exists
      cy.clearAllCookies();

      // Make request with only API key - no session cookie
      cy.request({
        method: "GET",
        url: "/api/tasks?limit=1",
        headers: authHeaders,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("tasks");
      });
    });

    it("should reject requests without API key and without session", () => {
      // Clear all cookies to ensure no session exists
      cy.clearAllCookies();

      // Make request without API key or session
      cy.request({
        method: "GET",
        url: "/api/tasks",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  afterEach(() => {
    // Clean up created tasks after each test
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

  describe("POST /api/tasks - Create Task", () => {
    it("should create a new task with minimal fields", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Test task from API",
          list: "Work",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property("task");
        expect(response.body.task).to.have.property("id");
        expect(response.body.task.name).to.eq("Test task from API");
        expect(response.body.task.list).to.eq("Work");
        createdTaskIds.push(response.body.task.id);
      });
    });

    it("should create a task with all optional fields", () => {
      const taskDate = new Date();
      taskDate.setDate(taskDate.getDate() + 1); // Tomorrow

      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Complete task from API",
          list: "Personal",
          details: "This is a detailed task description",
          date: taskDate.toISOString(),
          estimatedDuration: 60,
          isBlocker: true,
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        const task = response.body.task;
        expect(task.name).to.eq("Complete task from API");
        expect(task.list).to.eq("Personal");
        expect(task.details).to.eq("This is a detailed task description");
        expect(task.date).to.not.be.null;
        expect(task.estimatedDuration).to.eq(60);
        expect(task.isBlocker).to.eq(true);
        expect(task.createdAt).to.not.be.null;
        createdTaskIds.push(task.id);
      });
    });

    it("should fail without task name", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          list: "Work",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq("Task name is required");
      });
    });

    it("should fail without task list", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task without list",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq("Task list is required");
      });
    });

    it("should fail without API key", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        body: {
          name: "Unauthorized task",
          list: "Work",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("GET /api/tasks - List Tasks", () => {
    let testTaskId: number;

    beforeEach(() => {
      // Create a test task for list tests
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task for list test",
          list: "Work",
        },
      }).then((response) => {
        testTaskId = response.body.task.id;
        createdTaskIds.push(testTaskId);
      });
    });

    it("should list tasks with API key", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks",
        headers: authHeaders,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("tasks");
        expect(response.body.tasks).to.be.an("array");
      });
    });

    it("should filter tasks by completion status", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks?completed=false",
        headers: authHeaders,
      }).then((response) => {
        expect(response.status).to.eq(200);
        response.body.tasks.forEach((task: { completedAt: string | null }) => {
          expect(task.completedAt).to.be.null;
        });
      });
    });

    it("should respect limit parameter", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks?limit=5",
        headers: authHeaders,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.tasks.length).to.be.at.most(5);
      });
    });

    it("should fail without API key", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("GET /api/tasks/:id - Get Single Task", () => {
    let testTaskId: number;

    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task for single get test",
          list: "Work",
          details: "Test details",
        },
      }).then((response) => {
        testTaskId = response.body.task.id;
        createdTaskIds.push(testTaskId);
      });
    });

    it("should get a single task by ID", () => {
      cy.request({
        method: "GET",
        url: `/api/tasks/${testTaskId}`,
        headers: authHeaders,
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property("task");
        expect(response.body.task.id).to.eq(testTaskId);
        expect(response.body.task.name).to.eq("Task for single get test");
        expect(response.body.task.details).to.eq("Test details");
      });
    });

    it("should return 404 for non-existent task", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks/999999999",
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.error).to.eq("Task not found");
      });
    });

    it("should return 400 for invalid task ID", () => {
      cy.request({
        method: "GET",
        url: "/api/tasks/invalid",
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.error).to.eq("Invalid task ID");
      });
    });

    it("should fail without API key", () => {
      cy.request({
        method: "GET",
        url: `/api/tasks/${testTaskId}`,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("PATCH /api/tasks/:id - Update Task", () => {
    let testTaskId: number;

    beforeEach(() => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task to update",
          list: "Work",
          isBlocker: false,
        },
      }).then((response) => {
        testTaskId = response.body.task.id;
        createdTaskIds.push(testTaskId);
      });
    });

    it("should update task name", () => {
      cy.request({
        method: "PATCH",
        url: `/api/tasks/${testTaskId}`,
        headers: authHeaders,
        body: {
          name: "Updated task name",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.task.name).to.eq("Updated task name");
        expect(response.body.task.list).to.eq("Work"); // Unchanged
      });
    });

    it("should update multiple fields at once", () => {
      cy.request({
        method: "PATCH",
        url: `/api/tasks/${testTaskId}`,
        headers: authHeaders,
        body: {
          name: "Multi-update task",
          details: "New details",
          isBlocker: true,
          estimatedDuration: 45,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const task = response.body.task;
        expect(task.name).to.eq("Multi-update task");
        expect(task.details).to.eq("New details");
        expect(task.isBlocker).to.eq(true);
        expect(task.estimatedDuration).to.eq(45);
      });
    });

    it("should mark task as completed", () => {
      const completedAt = new Date().toISOString();
      cy.request({
        method: "PATCH",
        url: `/api/tasks/${testTaskId}`,
        headers: authHeaders,
        body: {
          completedAt,
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.task.completedAt).to.not.be.null;
      });
    });

    it("should update task date", () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 7); // One week from now

      cy.request({
        method: "PATCH",
        url: `/api/tasks/${testTaskId}`,
        headers: authHeaders,
        body: {
          date: newDate.toISOString(),
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.task.date).to.not.be.null;
      });
    });

    it("should return 404 for non-existent task", () => {
      cy.request({
        method: "PATCH",
        url: "/api/tasks/999999999",
        headers: authHeaders,
        body: {
          name: "Should not work",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("should fail without API key", () => {
      cy.request({
        method: "PATCH",
        url: `/api/tasks/${testTaskId}`,
        body: {
          name: "Unauthorized update",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("DELETE /api/tasks/:id - Delete Task", () => {
    it("should soft delete a task", () => {
      // Create a task to delete
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task to soft delete",
          list: "Work",
        },
      }).then((createResponse) => {
        const taskId = createResponse.body.task.id;

        // Soft delete the task
        cy.request({
          method: "DELETE",
          url: `/api/tasks/${taskId}`,
          headers: authHeaders,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          expect(deleteResponse.body.message).to.eq("Task deleted");

          // Verify task is soft deleted (not visible in normal GET)
          cy.request({
            method: "GET",
            url: `/api/tasks/${taskId}`,
            headers: authHeaders,
            failOnStatusCode: false,
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(404);
          });

          // Clean up permanently
          cy.request({
            method: "DELETE",
            url: `/api/tasks/${taskId}?permanent=true`,
            headers: authHeaders,
            failOnStatusCode: false,
          });
        });
      });
    });

    it("should permanently delete a task", () => {
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Task to permanently delete",
          list: "Work",
        },
      }).then((createResponse) => {
        const taskId = createResponse.body.task.id;

        cy.request({
          method: "DELETE",
          url: `/api/tasks/${taskId}?permanent=true`,
          headers: authHeaders,
        }).then((deleteResponse) => {
          expect(deleteResponse.status).to.eq(200);
          expect(deleteResponse.body.message).to.eq("Task permanently deleted");

          // Verify task is gone
          cy.request({
            method: "GET",
            url: `/api/tasks/${taskId}`,
            headers: authHeaders,
            failOnStatusCode: false,
          }).then((getResponse) => {
            expect(getResponse.status).to.eq(404);
          });
        });
      });
    });

    it("should return 404 for non-existent task", () => {
      cy.request({
        method: "DELETE",
        url: "/api/tasks/999999999",
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });

    it("should fail without API key", () => {
      cy.request({
        method: "DELETE",
        url: "/api/tasks/1",
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  });

  describe("Full CRUD Workflow", () => {
    it("should perform complete task lifecycle", () => {
      let taskId: number;

      // 1. Create task
      cy.request({
        method: "POST",
        url: "/api/tasks",
        headers: authHeaders,
        body: {
          name: "Lifecycle test task",
          list: "Work",
          details: "Initial details",
        },
      }).then((response) => {
        expect(response.status).to.eq(201);
        taskId = response.body.task.id;

        // 2. Read task
        cy.request({
          method: "GET",
          url: `/api/tasks/${taskId}`,
          headers: authHeaders,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.task.name).to.eq("Lifecycle test task");

          // 3. Update task
          cy.request({
            method: "PATCH",
            url: `/api/tasks/${taskId}`,
            headers: authHeaders,
            body: {
              name: "Updated lifecycle task",
              details: "Updated details",
              isBlocker: true,
            },
          }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body.task.name).to.eq("Updated lifecycle task");
            expect(response.body.task.isBlocker).to.eq(true);

            // 4. Mark as completed
            cy.request({
              method: "PATCH",
              url: `/api/tasks/${taskId}`,
              headers: authHeaders,
              body: {
                completedAt: new Date().toISOString(),
              },
            }).then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body.task.completedAt).to.not.be.null;

              // 5. Delete task
              cy.request({
                method: "DELETE",
                url: `/api/tasks/${taskId}?permanent=true`,
                headers: authHeaders,
              }).then((response) => {
                expect(response.status).to.eq(200);

                // 6. Verify deletion
                cy.request({
                  method: "GET",
                  url: `/api/tasks/${taskId}`,
                  headers: authHeaders,
                  failOnStatusCode: false,
                }).then((response) => {
                  expect(response.status).to.eq(404);
                });
              });
            });
          });
        });
      });
    });
  });
});
