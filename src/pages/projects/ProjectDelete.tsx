import { ProjectService } from "@/api";
import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function projectDeleteAction({ params }: ActionFunctionArgs) {
    await ProjectService.deleteProject(parseInt(params.id!));
    return redirect('/projects');
}
