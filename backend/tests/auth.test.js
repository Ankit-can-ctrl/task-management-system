const request = require("supertest");
const app = require("../app");

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user and returns a token", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "secret123",
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.email).toBe("ankit@gmail.com");
    });

    it("rejects duplicate email", async () => {
      await request(app).post("/api/auth/register").send({
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "secret123",
      });

      const res = await request(app).post("/api/auth/register").send({
        name: "Ankit Kumar",
        email: "ankit@gmail.com",
        password: "otherpass",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it("rejects invalid email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Ankit",
        email: "ankit@gmail",
        password: "secret123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "secret123",
      });
    });

    it("logs in with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "ankit@gmail.com",
        password: "secret123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("rejects wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "ankit@gmail.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("returns current user when authenticated", async () => {
      const register = await request(app).post("/api/auth/register").send({
        name: "Ankit",
        email: "ankit@gmail.com",
        password: "secret123",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${register.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("ankit@gmail.com");
    });

    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });
});
