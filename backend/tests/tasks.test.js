const request = require("supertest");
const app = require("../app");

const registerAndGetToken = async (name, email) => {
  const res = await request(app).post("/api/auth/register").send({
    name,
    email,
    password: "secret123",
  });
  return res.body.token;
};

describe("Tasks API", () => {
  let ankitToken;
  let rahulToken;
  let taskId;

  beforeEach(async () => {
    ankitToken = await registerAndGetToken("Ankit", "ankit@gmail.com");
    rahulToken = await registerAndGetToken("Rahul", "rahul@gmail.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${ankitToken}`)
      .send({ title: "Complete backend assignment", priority: "High" });

    taskId = created.body._id;
  });

  describe("Authorization", () => {
    it("rejects unauthenticated requests", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a task for the authenticated user", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${ankitToken}`)
        .send({
          title: "Review assignment requirements",
          description: "Go through the SDE assignment doc once more",
          status: "Pending",
          priority: "Medium",
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Review assignment requirements");
      expect(res.body.user).toBeDefined();
    });

    it("rejects missing title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${ankitToken}`)
        .send({ description: "Missing title field" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks", () => {
    it("returns only the authenticated user's tasks", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ title: "Prepare system design notes" });

      const ankitTasks = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${ankitToken}`);

      const rahulTasks = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${rahulToken}`);

      expect(ankitTasks.body.tasks.some((t) => t.title === "Prepare system design notes")).toBe(false);
      expect(rahulTasks.body.tasks).toHaveLength(1);
      expect(rahulTasks.body.tasks[0].title).toBe("Prepare system design notes");
    });

    it("filters by status", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${ankitToken}`)
        .send({ title: "Submit assignment", status: "Completed" });

      const res = await request(app)
        .get("/api/tasks?status=Completed")
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.every((t) => t.status === "Completed")).toBe(true);
    });

    it("searches by title", async () => {
      const res = await request(app)
        .get("/api/tasks?search=assignment")
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/tasks/stats", () => {
    it("returns task statistics for the user", async () => {
      const res = await request(app)
        .get("/api/tasks/stats")
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        total: expect.any(Number),
        pending: expect.any(Number),
        inProgress: expect.any(Number),
        completed: expect.any(Number),
      });
    });
  });

  describe("User isolation", () => {
    it("prevents Rahul from reading Ankit's task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${rahulToken}`);

      expect(res.status).toBe(404);
    });

    it("prevents Rahul from updating Ankit's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${rahulToken}`)
        .send({ title: "Changed by someone else" });

      expect(res.status).toBe(404);
    });

    it("prevents Rahul from deleting Ankit's task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${rahulToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("allows partial updates", async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ankitToken}`)
        .send({ status: "In Progress" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("In Progress");
      expect(res.body.title).toBe("Complete backend assignment");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes the task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(getRes.status).toBe(404);
    });

    it("rejects invalid task ID", async () => {
      const res = await request(app)
        .delete("/api/tasks/not-a-valid-id")
        .set("Authorization", `Bearer ${ankitToken}`);

      expect(res.status).toBe(400);
    });
  });
});
