import client from "@/services/api";
import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function projectDeleteAction({ params }: ActionFunctionArgs) {
    await client.delete(`/projects/${params.id}`);
    return redirect('/projects');
}
