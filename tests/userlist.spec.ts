import { Page } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  let validUsers: Record<string, User> = {
    "a@jwt.com": {
      id: "1",
      name: "Alex Marin",
      email: "a@jwt.com",
      password: "admin",
      roles: [{ role: Role.Admin }],
    },
    "bella@jwt.com": {
      id: "2",
      name: "Bella Cruz",
      email: "bella@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "chase@jwt.com": {
      id: "3",
      name: "Chase Nguyen",
      email: "chase@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "dina@jwt.com": {
      id: "4",
      name: "Dina Patel",
      email: "dina@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "eli@jwt.com": {
      id: "5",
      name: "Eli Romero",
      email: "eli@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "fiona@jwt.com": {
      id: "6",
      name: "Fiona Brooks",
      email: "fiona@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "george@jwt.com": {
      id: "7",
      name: "George Li",
      email: "george@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "harper@jwt.com": {
      id: "8",
      name: "Harper Singh",
      email: "harper@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "isaac@jwt.com": {
      id: "9",
      name: "Isaac Turner",
      email: "isaac@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "julia@jwt.com": {
      id: "10",
      name: "Julia Vega",
      email: "julia@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "kai@jwt.com": {
      id: "11",
      name: "Kai Morgan",
      email: "kai@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "leah@jwt.com": {
      id: "12",
      name: "Leah Park",
      email: "leah@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "mason@jwt.com": {
      id: "13",
      name: "Mason Patel",
      email: "mason@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "nora@jwt.com": {
      id: "14",
      name: "Nora Diaz",
      email: "nora@jwt.com",
      password: "diner",
      roles: [{ role: Role.Diner }],
    },
    "oliver@jwt.com": {
      id: "15",
      name: "Oliver Zhao",
      email: "oliver@jwt.com",
      password: "admin",
      roles: [{ role: Role.Admin }],
    },
  };
  const dummyFranchises = [
    {
      id: 1,
      name: "pizzaPocket",
      admins: [{ id: "4", name: "pizza franchisee", email: "f@jwt.com" }],
      stores: [{ id: "1", name: "SLC", totalRevenue: 0 }],
    },
    {
      id: 2,
      name: "CheesyBites",
      admins: [{ id: "5", name: "cheese admin", email: "c@jwt.com" }],
      stores: [{ id: "2", name: "NYC", totalRevenue: 1000 }],
    },
    {
      id: 3,
      name: "SliceMasters",
      admins: [{ id: "6", name: "slice admin", email: "s@jwt.com" }],
      stores: [{ id: "3", name: "LA", totalRevenue: 500 }],
    },
    {
      id: 4,
      name: "DoughNation",
      admins: [{ id: "7", name: "dough admin", email: "d@jwt.com" }],
      stores: [{ id: "4", name: "Chicago", totalRevenue: 300 }],
    },
    {
      id: 5,
      name: "PepperoniKing",
      admins: [{ id: "8", name: "pepperoni admin", email: "p@jwt.com" }],
      stores: [{ id: "5", name: "Boston", totalRevenue: 700 }],
    },
  ];
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

  // This handles getting the list of users
  await page.route(/.*\/api\/user(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const pageParam = parseInt(url.searchParams.get("page") ?? "0", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    let nameFilter = url.searchParams.get("name")?.toLowerCase() ?? "*";
    nameFilter = nameFilter.replace(/\*/g, "%");

    const users = Object.values(validUsers);
    let filtered: User[] = [];
    if (nameFilter !== "%") {
      nameFilter = nameFilter.slice(1, nameFilter.length - 1);
      filtered = nameFilter
        ? users.filter((u) => u.name?.toLowerCase().includes(nameFilter))
        : users;
    } else {
      filtered = users;
    }

    const start = pageParam * limit; // 0-based
    const paged = filtered.slice(start, start + limit);

    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      json: {
        users: paged,
        more: start + limit < filtered.length,
        page: pageParam,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  });

  // Handle DELETE /api/user/:id
  await page.route(/.*\/api\/user\/\d+$/, async (route) => {
    const method = route.request().method();
    if (method !== "DELETE") {
      await route.continue();
      return;
    }

    const url = new URL(route.request().url());
    const id = url.pathname.split("/").pop(); // Pull out the ID from the path

    // Find the user by ID
    const targetEntry = Object.entries(validUsers).find(([, u]) => u.id === id);

    if (!targetEntry) {
      await route.fulfill({
        status: 404,
        json: { error: `User with id ${id} not found` },
      });
      return;
    }

    const [email] = targetEntry;

    // Delete the user from validUsers
    delete validUsers[email];

    console.log(`Mock deleted user id=${id} (${email})`);

    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      json: { message: "User deleted successfully", id },
    });
  });

  // This gets a list of the franchises
  await page.route(/.*\/api\/franchise(\?.*)?$/, async (route) => {
    const url = new URL(route.request().url());
    const pageParam = parseInt(url.searchParams.get("page") ?? "0", 10);
    const limit = parseInt(url.searchParams.get("limit") ?? "10", 10);
    const nameFilter = url.searchParams.get("name")?.toLowerCase() ?? "";

    const franchises = Object.values(dummyFranchises);
    let filtered = [];
    if (nameFilter !== "*") {
      filtered = nameFilter
        ? franchises.filter((f) => f.name.toLowerCase().includes(nameFilter))
        : franchises;
    } else {
      filtered = franchises;
    }

    const start = pageParam * limit;
    const paged = filtered.slice(start, start + limit);

    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      json: {
        franchises: paged,
        more: start + limit < filtered.length,
        page: pageParam,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  });
}

test("get user list", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByLabel("Global")).toContainText("AM");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();

  await expect(page.getByText("Alex Marin")).toBeVisible();
  await expect(page.getByText("Bella Cruz")).toBeVisible();
});

test("remove user", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByLabel("Global")).toContainText("AM");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();

  await page
    .getByRole("row", { name: "Bella Cruz" })
    .getByRole("button")
    .click();

  await expect(page.getByText("Are you sure?")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.getByText("Mama Ricci's kitchen").click();
  await expect(page.getByRole("cell", { name: "Bella Cruz" })).toBeVisible();

  await page
    .getByRole("row", { name: "Chase Nguyen" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Remove" }).click();
  await expect(
    page.getByRole("cell", { name: "Chase Nguyen" })
  ).not.toBeVisible();
});

test("pagination", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByLabel("Global")).toContainText("AM");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();

  await page.getByRole("button", { name: "»" }).first().click();
  await expect(page.getByRole("cell", { name: "Mason Patel" })).toBeVisible();
  await page.getByRole("button", { name: "«" }).first().click();
  await expect(page.getByRole("cell", { name: "Fiona Brooks" })).toBeVisible();

  await page.getByRole("button", { name: "»" }).nth(1).click();
  await expect(page.getByRole("cell", { name: "DoughNation" })).toBeVisible();

  await page.getByRole("button", { name: "«" }).nth(1).click();
  await expect(page.getByRole("cell", { name: "CheesyBites" })).toBeVisible();
});

test("search", async ({ page }) => {
  await basicInit(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("a@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("admin");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByLabel("Global")).toContainText("AM");
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();

  await page.getByRole("textbox", { name: "Search users" }).fill("eli");
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("cell", { name: "Eli Romero" }).click();
  await expect(
    page.getByRole("cell", { name: "Bella Cruz" })
  ).not.toBeVisible();

  await page.getByRole("textbox", { name: "Filter franchises" }).fill("cheesy");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByRole("cell", { name: "CheesyBites" })).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "pizzaPocket" })
  ).not.toBeVisible();
});
