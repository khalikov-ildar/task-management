import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { HttpStatus } from "@nestjs/common";
import { UsersService } from "../../src/users/users.service";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../../src/app/app.module";
import {
  user,
  moderator,
  validTask,
  invalidDeadline,
  invalidAllowance,
  invalidPriority,
} from "./samples";
import { TasksService } from "../../src/tasks/tasks.service";
import { AuthService } from "../../src/auth/auth.service";
import { HashingService } from "../../src/auth/services/hashing/hashing.service";
import { IHashingService } from "../../src/auth/services/hashing/i-hashing.service";
import { seedUsers } from "./utils";
import TestAgent from "supertest/lib/agent";

describe("[TasksController] E2E", () => {
  let app: INestApplication;
  let userService: UsersService;
  let hashingService: HashingService;
  let taskService: TasksService;
  let authService: AuthService;

  let agent: TestAgent;

  let userToken: string;
  let moderatorToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule.setEnvironment("test")],
    }).compile();

    app = moduleFixture.createNestApplication();
    userService = moduleFixture.get<UsersService>(UsersService);
    hashingService = moduleFixture.get<HashingService>(IHashingService);
    taskService = moduleFixture.get<TasksService>(TasksService);
    authService = moduleFixture.get<AuthService>(AuthService);

    agent = request(app.getHttpServer());

    await seedUsers(userService, hashingService);

    userToken = (
      await authService.login({ email: user.email, password: user.password })
    ).accessToken;
    moderatorToken = (
      await authService.login({
        email: moderator.email,
        password: moderator.password,
      })
    ).accessToken;

    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await taskService.deleteAll();
    await userService.deleteAll();
    await app.close();
  });

  describe("Check the routes for permissions", () => {
    describe("Should fail all the given tests if the user is not logged in", () => {
      it("/tasks/assigned [GET]", () => {
        return agent.get("/tasks/assigned").expect(HttpStatus.UNAUTHORIZED);
      });

      it("/tasks [POST]", () => {
        return agent
          .post("/tasks/")
          .send(validTask)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("/tasks/:id [PUT]", () => {
        return agent
          .put("/tasks/1")
          .send(validTask)
          .expect(HttpStatus.UNAUTHORIZED);
      });

      it("/tasks/:id [DELETE]", () => {
        return agent.delete("/tasks/1").expect(HttpStatus.UNAUTHORIZED);
      });
    });

    describe("Should fail all the given tests if the user is not a moderator", () => {
      it("/tasks [POST]", () => {
        return agent
          .post("/tasks")
          .set("Authorization", `Bearer ${userToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });

      it("/tasks/:id [DELETE]", () => {
        return agent
          .delete("/tasks/1")
          .set("Authorization", `Bearer ${userToken}`)
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });

  describe("/tasks [POST]", () => {
    describe("Should fail to create task with invalid data", () => {
      it("If is not at least one hour from the current date", () => {
        return agent
          .post("/tasks")
          .set("Authorization", `Bearer ${moderatorToken}`)
          .send(invalidDeadline)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it("If the allowed to edit users are not in the assigned users", () => {
        return agent
          .post("/tasks")
          .set("Authorization", `Bearer ${moderatorToken}`)
          .send(invalidAllowance)
          .expect(HttpStatus.BAD_REQUEST);
      });

      it("If the priority is not a part of enum", () => {
        return agent
          .post("/tasks")
          .set("Authorization", `Bearer ${moderatorToken}`)
          .send(invalidPriority)
          .expect(HttpStatus.BAD_REQUEST);
      });
    });

    it("Should successfully create a task", () => {
      return agent
        .post("/tasks")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .send(validTask)
        .expect(HttpStatus.CREATED);
    });
  });

  describe("/tasks/assigned [GET]", () => {
    it("Should return the only one existing task assigned to the user", () => {
      return agent
        .get("/tasks/assigned")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body.length).toBe(1);
        });
    });

    it("Should return an empty array if the user has no assigned tasks", () => {
      return agent
        .get("/tasks/assigned")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .expect(HttpStatus.OK)
        .then((res) => {
          expect(res.body.length).toBe(0);
        });
    });
  });

  describe("/tasks/:id [PUT]", () => {
    it("Should fail to update task with invalid deadline", () => {
      return agent
        .put("/tasks/1")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .send(invalidDeadline)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("Should fail to update task with invalid allowance", () => {
      return agent
        .put("/tasks/1")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .send(invalidAllowance)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("Should fail to update task with invalid priority", () => {
      return agent
        .put("/tasks/1")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .send(invalidPriority)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it("Should successfully update a task", () => {
      return agent
        .put("/tasks/1")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .send(validTask)
        .expect(HttpStatus.OK);
    });
  });

  describe("/tasks/:id [DELETE]", () => {
    it("Should successfully delete a task", () => {
      return agent
        .delete("/tasks/1")
        .set("Authorization", `Bearer ${moderatorToken}`)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
