import { Page } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

let email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {};
  const token: string = "abcdef";

  // Authorize login or registration for the given user
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();
    const url = new URL(route.request().url());

    // REGISTER
    if (method === "POST") {
      const body = route.request().postDataJSON();
      const { name, email, password } = body;

      // If the user already exists, don't add it
      if (validUsers[email]) {
        await route.fulfill({
          status: 400,
          json: { error: "Email already registered" },
        });
        return;
      }

      const newUser: User = {
        id: (Object.keys(validUsers).length + 1).toString(),
        name,
        email,
        password,
        roles: [{ role: Role.Diner }],
      };
      validUsers[email] = newUser;
      loggedInUser = newUser;

      await route.fulfill({
        json: { user: newUser, token },
      });
      return;
    }

    // LOGIN
    if (method === "PUT") {
      const body = route.request().postDataJSON();
      const { email, password } = body;
      const user = validUsers[email];

      if (!user || user.password !== password) {
        await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
        return;
      }

      loggedInUser = user;
      await route.fulfill({ json: { user, token } });
      return;
    }

    // LOGOUT
    if (method === "DELETE") {
      loggedInUser = undefined;
      await route.fulfill({ json: { message: "logout successful" } });
      return;
    }

    await route.continue();
  });

  // PUT /api/user/:userId — Update user (new feature)
  await page.route(/.*\/api\/user\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method !== "PUT") {
      await route.continue();
      return;
    }

    if (!loggedInUser) {
      await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
      return;
    }

    const body = route.request().postDataJSON();
    loggedInUser = { ...loggedInUser, ...body };

    if (!loggedInUser || !loggedInUser.email) {
      await route.fulfill({
        status: 418,
        json: { error: "An unexpected error occured." },
      });
    } else {
      validUsers[loggedInUser.email] = loggedInUser;

      await route.fulfill({
        json: { user: loggedInUser, token },
      });
    }
  });
}

test("updateUser", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("pizza diner");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Register" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza diner");

  await page.getByRole("button", { name: "Edit" }).click();
  await expect(page.locator("h3")).toContainText("Edit User");
  await page.getByRole("textbox").first().fill("pizza dinerx");
  await page.getByRole("button", { name: "Update" }).click();

  await page.waitForSelector('[role="dialog"].hidden', { state: "attached" });

  await expect(page.getByRole("main")).toContainText("pizza dinerx");

  // Logout and login again to verify the change was persisted
  await page.getByRole("link", { name: "Logout" }).click();
  await page.getByRole("link", { name: "Login" }).click();

  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill("diner");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "pd" }).click();

  await expect(page.getByRole("main")).toContainText("pizza dinerx");
});
