import { Form, Link, useActionData } from "react-router";
import bcrypt from "bcryptjs";
import db from "~/db.server";
import { createUserSession } from "~/session.server";
import type { Route } from "./+types/login";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    const errors: Record<string, string> = {};

    if (!username) errors.username = "Username is required.";
    if (!password) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const user = await db.user.findUnique({ where: { username } });

    if (!user) {
        return { errors: { username: "Invalid username or password." } };
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
        return { errors: { username: "Invalid username or password." } };
    }

    return createUserSession(user.id, "/");
}

export default function Login({ actionData }: Route.ComponentProps) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-80 flex flex-col gap-3">

                <h1 className="text-2xl font-bold text-center">Login</h1>

                {actionData?.errors && Object.keys(actionData.errors).length > 0 && (
                    <div className="border-2 border-red-600 bg-red-50 text-red-700 text-sm p-2">
                        Please fix the errors below.
                    </div>
                )}

                <Form method="post" className="flex flex-col gap-3">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Username</label>
                        <input name="username" className="border-2 border-black p-1 text-sm" />
                        {actionData?.errors?.username && (
                            <p className="text-xs text-red-600">{actionData.errors.username}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-bold">Password</label>
                        <input name="password" type="password" className="border-2 border-black p-1 text-sm" />
                        {actionData?.errors?.password && (
                            <p className="text-xs text-red-600">{actionData.errors.password}</p>
                        )}
                    </div>

                    <button type="submit" className="border-2 border-black p-1 text-sm font-bold">
                        Login
                    </button>

                </Form>

                <p className="text-sm text-center">
                    Don't have an account? <Link to="/register" className="font-bold hover:underline">Register</Link>
                </p>

            </div>
        </div>
    );
}