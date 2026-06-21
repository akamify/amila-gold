import HomepageClient from "./components/home/HomepageClient";

export const revalidate = 300;

export default function HomeRoute() {
  return <HomepageClient />;
}
