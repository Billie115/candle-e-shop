import { createCookieSessionStorage } from "react-router";

const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session", //onoma mporei na einai kai mpampis
        secrets: ["loginSecret123"], //kwdikos wste na mhn mporei na ginei forged to cookie san 2FA
        sameSite: "lax", //einai gia asfalia apo cross site request attack exei ki alles epiloges
        path: "/", //to cookie mporei na stal8ei se ola ta paths(routes)
        httpOnly: true, //kai afto einai gia asfalia enantion XSS attacks
        secure: process.env.NODE_ENV === "production", //afto einai wste na mporei na leitourgei sto local host, dld kata thn diarkia tou development
    },
});
/** edw kanei to login cookie, kanei ena adio session, apo8hkebei to userId
kai me ta kanei redirect kai kanei attach to session cookie sto header
meta o browser exei to cookie kai to xrhshmopoiei opote tou zhth8ei, afto to xrhshmopoioume sto login */
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
/** afto kalhte apo ta loaders kurios, einai gia checkarei an kapoios einai logged in, dldl exei cookie
checkarei to signature me to secret pou balame prin, kai to userId, an den einai logged in h 
einai forged to cookie, tote gurnaei Null to opoio shamainei, den einai logged in */
export async function getUserId(request: Request): Promise<number | null> {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    return userId ?? null;
}
/** edw kanei to logout, dld diabazei to cookie to session kai to kanei destroy kai meta kanei redirect
sto root page dld home */
export async function logout(request: Request) {
    const session = await sessionStorage.getSession(request.headers.get("Cookie"));
    const { redirect } = await import("react-router");
    return redirect("/", {
        headers: {
            "Set-Cookie": await sessionStorage.destroySession(session),
        },
    });
}
/** edw checkarei an einai an einai o user admin, to xrhshmopoioun osa routes
einai mono gia admins, kanei 2 checks, an einai genika logged in k an einai admin 
epishs anti gia redirect xrhshmopoiei throw to opoio stamataei amesa ka8e energia einai pio safe apo redirect*/
export async function requireAdmin(request: Request) {
    const userId = await getUserId(request);
    const { redirect } = await import("react-router");
    //edw checkarei to an einai logged in
    if (!userId) {
        throw redirect("/login");
    }
    //edw pernei ta stoixia tou user, efoson einai logged in
    const { default: db } = await import("~/db.server");
    const user = await db.user.findUnique({ where: { id: userId } });
    //edw checkarei an o user einai logged in
    if (!user || !user.isAdmin) {
        throw redirect("/");
    }

    return user;
}
/** einai cookie session gia to cart, ka8os to cart den einai linked me ton account
pou einai logged in, mporei kapoios na balei pragmata sto cart xwris kan na einai logged in
exei diaforetiko kwddiko kai onoma apo to login cookie */
const cartStorage = createCookieSessionStorage({
    cookie: {
        name: "__cart",
        secrets: ["cartSecret123"],
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    },
});
/** edw pernoume to cookie apo to browser kai me liga logia pernoume ta products tou cart
einai ena JSON file to opoio einai ths morfhs "productID": (number), prwta to id tou proiontos kai meta posa apo afto to proion */
export async function getCart(request: Request): Promise<Record<string, number>> {
    const session = await cartStorage.getSession(request.headers.get("Cookie"));
    return session.get("items") || {};
}
/** edw kanoume to idio, kaloume to cartCookie alla apo8hkeboume tis allages pou kaname,
cart[productId] = (cart[productId] || 0) + 1; edw pros8etei +1 sto productId */
export async function saveCart(request: Request, items: Record<string, number>) {
    const session = await cartStorage.getSession(request.headers.get("Cookie"));
    session.set("items", items);
    return cartStorage.commitSession(session);
}