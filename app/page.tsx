import HomepageClient from "./components/home/HomepageClient";

export const metadata = {
  title: "Amila Gold – Pure Organic Jaggery, Buy Online",
  description:
    "Pure, chemical-free jaggery slow-boiled the traditional way in copper vats. No shortcuts, no preservatives. Buy organic jaggery online today.",
  keywords: [
    "organic jaggery online",
    "buy organic jaggery online",
    "desi jaggery online",
    "organic jaggery near me",
  ],
};

export const revalidate = 300;

export default function HomeRoute() {
  return <HomepageClient />;
}
