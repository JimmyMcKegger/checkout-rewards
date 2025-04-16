import { Link } from "@remix-run/react";
import { NavMenu as AppBridgeNavMenu } from "@shopify/app-bridge-react";

export function NavMenu() {
  return (
    <AppBridgeNavMenu>
      <Link to="/" rel="home">
        Customer Information
      </Link>
      <Link to="/reward-points">Reward Points</Link>
      <Link to="/discounts">Discounts</Link>
    </AppBridgeNavMenu>
  );
}
