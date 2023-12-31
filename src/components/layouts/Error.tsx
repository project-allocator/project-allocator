import { Button, Result } from "antd";
import { ResultStatusType } from "antd/es/result";
import { FallbackProps } from "react-error-boundary";

export default function Error({ error, resetErrorBoundary }: FallbackProps) {
  // Print the error for debugging.
  console.error(error);

  return (
    <Result
      status={error.status as ResultStatusType}
      title={`${error.status} ${error.statusText}`}
      subTitle={error.body?.detail}
      extra={
        <Button type="primary" onClick={() => resetErrorBoundary()}>
          Try again
        </Button>
      }
    />
  );
}
