import { Empty, Skeleton } from "antd";
import { UseQueryResult } from "react-query";

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
