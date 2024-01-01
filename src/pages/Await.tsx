import { UseQueryResult } from "@tanstack/react-query";
import { Empty, Skeleton } from "antd";

export default function Await<TData, TError>({
  query,
  errorElement,
  children,
}: {
  query: UseQueryResult<TData, TError>;
  errorElement: React.ReactNode;
  children: (data: TData) => React.ReactNode;
}) {
  if (query.isLoading) return <Skeleton active />;
  if (query.isError) return <Empty description={errorElement} />;

  return children(query.data!);
}
