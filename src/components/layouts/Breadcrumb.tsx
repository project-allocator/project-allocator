import { HomeOutlined } from "@ant-design/icons";
import * as antd from "antd";
import { Link, UIMatch, useMatches } from "react-router-dom";

export default function Breadcrumb() {
  const matches = useMatches() as UIMatch<unknown, { crumb?: string }>[];
  const breadcrumbs = matches
    .filter((match) => match.handle?.crumb)
    .map((match) => ({
      path: match.pathname,
      breadcrumbName: match.handle.crumb,
    }));

  return (
    <antd.Breadcrumb
      className="my-4"
      items={[{ path: "/", breadcrumbName: "Home" }, ...breadcrumbs]}
      itemRender={(breadcrumb) => (
        <Link to={breadcrumb.path!}>{breadcrumb.path === "/" ? <HomeOutlined /> : breadcrumb.breadcrumbName}</Link>
      )}
    />
  );
}
