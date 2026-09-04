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
  let tokenA;
  let tokenB;
  let taskId;

  beforeEach(async () => {
    tokenA = await registerAndGetToken("User A", "usera@example.com");
    tokenB = await registerAndGetToken("User B", "userb@example.com");

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ title: "User A Task", priority: "High" });

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
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          title: "New Task",
          description: "Test description",
          status: "Pending",
          priority: "Medium",
        });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe("New Task");
      expect(res.body.user).toBeDefined();
    });

    it("rejects missing title", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ description: "No title" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tasks", () => {
    it("returns only the authenticated user's tasks", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "User B Task" });

      const resA = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${tokenA}`);

      const resB = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${tokenB}`);

      expect(resA.body.tasks.some((t) => t.title === "User B Task")).toBe(false);
      expect(resB.body.tasks).toHaveLength(1);
      expect(resB.body.tasks[0].title).toBe("User B Task");
    });

    it("filters by status", async () => {
      await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ title: "Completed Task", status: "Completed" });

      const res = await request(app)
        .get("/api/tasks?status=Completed")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.every((t) => t.status === "Completed")).toBe(true);
    });

    it("searches by title", async () => {
      const res = await request(app)
        .get("/api/tasks?search=User A")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/tasks/stats", () => {
    it("returns task statistics for the user", async () => {
      const res = await request(app)
        .get("/api/tasks/stats")
        .set("Authorization", `Bearer ${tokenA}`);

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
    it("prevents User B from reading User A's task", async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });

    it("prevents User B from updating User A's task", async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ title: "Hacked" });

      expect(res.status).toBe(404);
    });

    it("prevents User B from deleting User A's task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("allows partial updates", async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ status: "In Progress" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("In Progress");
      expect(res.body.title).toBe("User A Task");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes the task", async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(getRes.status).toBe(404);
    });

    it("rejects invalid task ID", async () => {
      const res = await request(app)
        .delete("/api/tasks/not-a-valid-id")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
    });
  });
});
