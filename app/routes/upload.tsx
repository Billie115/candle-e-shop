import { writeFile } from "fs/promises";
import { join } from "path";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
        return { error: "No file provided" };
    }

    const filename = `${Date.now()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(process.cwd(), "public", "images", filename), buffer);

    return { filename };
}