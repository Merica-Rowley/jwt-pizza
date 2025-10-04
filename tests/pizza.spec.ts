import { Page } from "@playwright/test";
import { test, expect } from "playwright-test-coverage";
import { User, Role } from "../src/service/pizzaService";

async function basicInit(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = {
    "d@jwt.com": {
      id: "3",
      name: "Kai Chen",
      email: "d@jwt.com",
      password: "a",
      roles: [{ role: Role.Diner }],
    },
    "f@jwt.com": {
      id: "4",
      name: "Oscar George",
      email: "f@jwt.com",
      password: "a",
      roles: [{ role: Role.Franchisee }],
    },
    "admin@jwt.com": {
      id: "5",
      name: "Alice Smith",
      email: "admin@jwt.com",
      password: "a",
      roles: [{ role: Role.Admin }],
    },
  };

  // Authorize login for the given user
  await page.route("*/**/api/auth", async (route) => {
    const method = route.request().method();

    if (method === "PUT") {
      // Handle login
      const loginReq = route.request().postDataJSON();
      const user = validUsers[loginReq.email];
      if (!user || user.password !== loginReq.password) {
        await route.fulfill({ status: 401, json: { error: "Unauthorized" } });
        return;
      }
      loggedInUser = validUsers[loginReq.email];
      const loginRes = { user: loggedInUser, token: "abcdef" };
      await route.fulfill({ json: loginRes });
    } else if (method === "DELETE") {
      // Handle logout
      loggedInUser = undefined;
      await route.fulfill({ json: { message: "Logged out" } });
    } else if (method === "POST") {
      // Handle register
      const registerReq = route.request().postDataJSON();
      if (validUsers[registerReq.email]) {
        await route.fulfill({
          status: 409,
          json: { error: "User already exists" },
        });
        return;
      }
      const user = {
        id: 4,
        name: registerReq.name,
        email: registerReq.email,
        password: registerReq.password,
        roles: [{ role: Role.Diner }],
      };
      const registerRes = { user, token: "ghijkl" };
      await route.fulfill({ json: registerRes });
    }
  });

  // Return the currently logged in user
  await page.route("*/**/api/user/me", async (route) => {
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route("*/**/api/order/menu", async (route) => {
    const menuRes = [
      {
        id: 1,
        title: "Veggie",
        image: "pizza1.png",
        price: 0.0038,
        description: "A garden of delight",
      },
      {
        id: 2,
        title: "Pepperoni",
        image: "pizza2.png",
        price: 0.0042,
        description: "Spicy treat",
      },
    ];
    expect(route.request().method()).toBe("GET");
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(
    /\/api\/franchise(\?.*)?$/,
    async (route) => {
      const franchiseRes = {
        franchises: [
          {
            id: 2,
            name: "LotaPizza",
            stores: [
              { id: 4, name: "Lehi" },
              { id: 5, name: "Springville" },
              { id: 6, name: "American Fork" },
            ],
          },
          {
            id: 3,
            name: "PizzaCorp",
            stores: [{ id: 7, name: "Spanish Fork" }],
          },
          { id: 4, name: "topSpot", stores: [] },
        ],
      };
      expect(route.request().method()).toBe("GET");
      await route.fulfill({ json: franchiseRes });
    }
    // { times: Infinity }
  );

  // Order a pizza.
  await page.route("*/**/api/order", async (route) => {
    const method = route.request().method();

    if (method === "POST") {
      const orderReq = route.request().postDataJSON();
      const orderRes = {
        order: { ...orderReq, id: 23 },
        jwt: "eyJpYXQ",
      };
      await route.fulfill({ json: orderRes });
    } else if (method === "GET") {
      const orderHistoryReq = route.request().postDataJSON();
      // Order history cannot be accessed if the user isn't logged in
      if (!loggedInUser) {
        throw new Error("Accessing user page without being logged in");
      }

      const orderHistoryRes = {
        dinerId: loggedInUser.id,
        orders: [
          {
            id: 1,
            franchiseId: 1,
            storeId: 1,
            date: "2024-06-05T05:14:40.000Z",
            items: [{ id: 1, menuId: 1, description: "Veggie", price: 0.05 }],
          },
        ],
        page: 1,
      };
      await route.fulfill({ json: orderHistoryRes });
    }
  });

  await page.goto("/");
}

test("home page", async ({ page }) => {
  await page.goto("/");

  expect(await page.title()).toBe("JWT Pizza");
});

test("docs", async ({ page }) => {
  await page.goto("/docs");
  await expect(page.getByText("JWT Pizza API")).toBeVisible();
});

test("login", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByRole("link", { name: "KC" })).toBeVisible();
});

test("register", async ({ page }) => {
  await basicInit(page);

  await page.getByRole("link", { name: "Register" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("Julia Jones");
  await page.getByRole("textbox", { name: "Email address" }).fill("e@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("b");
  await page.getByRole("button", { name: "Register" }).click();

  await expect(page.getByRole("link", { name: "JJ" })).toBeVisible();
});

test("logout", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Register" })).toBeVisible();
});

test("purchase with login", async ({ page }) => {
  await basicInit(page);

  // Go to order page
  await page.getByRole("button", { name: "Order now" }).click();

  // Create order
  await expect(page.locator("h2")).toContainText("Awesome is a click away");
  await page.getByRole("combobox").selectOption("4");
  await page.getByRole("link", { name: "Image Description Veggie A" }).click();
  await page.getByRole("link", { name: "Image Description Pepperoni" }).click();
  await expect(page.locator("form")).toContainText("Selected pizzas: 2");
  await page.getByRole("button", { name: "Checkout" }).click();

  // Login
  await page.getByPlaceholder("Email address").click();
  await page.getByPlaceholder("Email address").fill("d@jwt.com");
  await page.getByPlaceholder("Email address").press("Tab");
  await page.getByPlaceholder("Password").fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  // Pay
  await expect(page.getByRole("main")).toContainText(
    "Send me those 2 pizzas right now!"
  );
  await expect(page.locator("tbody")).toContainText("Veggie");
  await expect(page.locator("tbody")).toContainText("Pepperoni");
  await expect(page.locator("tfoot")).toContainText("0.008 ₿");
  await page.getByRole("button", { name: "Pay now" }).click();

  // Check balance
  await expect(page.getByText("0.008")).toBeVisible();
});

test("about", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByText("The secret sauce")).toBeVisible();
});

test("history", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "History" }).click();
  await expect(page.getByText("Mama Rucci, my my")).toBeVisible();
});

test("diner dashboard", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Email address" }).fill("d@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();

  await page.getByRole("link", { name: "KC" }).click();
  await expect(page.getByText("Your pizza kitchen")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "ID" })).toBeVisible();
});

test("admin dashboard goes to not found if not admin", async ({ page }) => {
  await page.goto("/admin-dashboard");
  await expect(page.getByText("Oops")).toBeVisible();
});

test("admin dashboard and close", async ({ page }) => {
  await basicInit(page);
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill("admin@jwt.com");
  await page.getByRole("textbox", { name: "Password" }).fill("a");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByRole("link", { name: "Admin" })).toBeVisible();
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Franchises" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Franchise", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "LotaPizza" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "PizzaCorp" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "topSpot" })).toBeVisible();
  await page
    .getByRole("row", { name: "topSpot Close" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("Mama Ricci's kitchen")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Franchises" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Franchise", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "LotaPizza" })).toBeVisible();
});
