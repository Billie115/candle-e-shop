import { Form, Link, redirect, useActionData } from "react-router";
import bcrypt from "bcryptjs";
import db from "~/db.server";
import type { Route } from "./+types/register";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");
    const isAdmin = formData.get("isAdmin") === "on";

    const errors: Record<string, string> = {};

    if (!username) errors.username = "Username is required.";
    if (!password) errors.password = "Password is required.";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters.";

    if (Object.keys(errors).length === 0) {
        const existing = await db.user.findUnique({ where: { username } });
        if (existing) errors.username = "Username already taken.";
    }

    if (Object.keys(errors).length > 0) {
        return { errors };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
        data: {
            username,
            password: hashedPassword,
            isAdmin,
        },
    });

    return redirect("/login");
}

export default function Register({ actionData }: Route.ComponentProps) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-80 flex flex-col gap-3">

                <h1 className="text-2xl font-bold text-center">Register</h1>

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

                    <div className="flex items-center gap-2">
                        <input type="checkbox" name="isAdmin" id="isAdmin" className="w-4 h-4" />
                        <label htmlFor="isAdmin" className="text-sm">Register as admin (debug)</label>
                    </div>

                    <button type="submit" className="border-2 border-black p-1 text-sm font-bold">
                        Register
                    </button>

                </Form>

                <p className="text-sm text-center">
                    Already have an account? <Link to="/login" className="font-bold hover:underline">Login</Link>
                </p>

            </div>
        </div>
    );
}