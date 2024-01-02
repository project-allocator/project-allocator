import { Button, Result } from "antd";
import { FallbackProps } from "react-error-boundary";
import { useNavigate } from "react-router-dom";

export default function Fallback({ error }: FallbackProps) {
  const navigate = useNavigate();

  return (
    <Result
      status={error.status}
      title={error.status}
      subTitle={error.body?.detail}
      extra={
        // Refresh page to try again.
        <Button type="primary" onClick={() => navigate(0)}>
          Try again
        </Button>
      }
    />
  );
}
