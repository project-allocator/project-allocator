import { AdminService } from "@/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useConflictingProjects() {
  return useQuery({
    queryKey: ["projects", "conflicting-projects"],
    queryFn: () => AdminService.readConflictingProjects(),
  });
}

export function useUnallocatedUsers() {
  return useQuery({ queryKey: ["users", "unallocated-users"], queryFn: () => AdminService.readUnallocatedUsers() });
}

export function useExportData() {
  return useMutation({
    mutationFn: (type: string) => {
      const exportFn = type === "json" ? AdminService.exportJson() : AdminService.exportCsv();
      return exportFn.then((response) => {
        // Create blob link to download
        // https://stackoverflow.com/questions/50694881/how-to-download-file-in-react-js
        const url = window.URL.createObjectURL(new Blob([response]));
        const linkElement = document.createElement("a");
        linkElement.href = url;
        linkElement.setAttribute("download", `output.${type}`);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
      });
    },
  });
}

export function useImportData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { users: any[]; projects: any[] }) => AdminService.importJson(data),
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();
    },
  });
}

export function useResetDatabase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => AdminService.resetDatabase(),
    onSuccess: () => {
      // Invalidate all queries
      queryClient.invalidateQueries();
    },
  });
}
