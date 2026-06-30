import { createCookieSessionStorage } from "react-router";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        secrets: ["replace-this-with-a-long-random-secret"],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});

export async function createUserSession(userId: number, redirectTo: string) {
    const session = await sessionStorage.getSession();
    session.set("userId", userId);

    const { redirect } = await import("react-router");
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await sessionStorage.commitSession(session),
        },
    });
}

export async function getUserId(request: Request): Promise<number | null> {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    return userId ?? null;
}

export async function logout(request: Request) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const { redirect } = await import("react-router");
    return redirect("/", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}

export async function requireAdmin(request: Request) {
    const userId = await getUserId(request);
    const { redirect } = await import("react-router");

    if (!userId) {
        throw redirect("/login");
    }

    const { default: db } = await import("~/db.server");
    const user = await db.user.findUnique({ where: { id: userId } });

    if (!user || !user.isAdmin) {
        throw redirect("/");
    }

    return user;
}

const cartStorage = createCookieSessionStorage({
    cookie: {
        name: "__cart",
        secrets: ["replace-this-with-another-long-random-secret"],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});

export async function getCart(request: Request): Promise<Record<string, number>> {
    const session = await cartStorage.getSession(request.headers.get("Cookie"));
    return session.get("items") || {};
}

export async function saveCart(request: Request, items: Record<string, number>) {
    const session = await cartStorage.getSession(request.headers.get("Cookie"));
    session.set("items", items);
    return cartStorage.commitSession(session);
}