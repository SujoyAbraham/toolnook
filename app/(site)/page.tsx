import { getHiddenTools } from "@/lib/visibility";
import { HomeTools } from "@/components/layout/HomeTools";

export const dynamic = "force-static";
export const revalidate = 60;

export default async function HomePage() {
  const hidden = await getHiddenTools();
  return <HomeTools hidden={hidden} />;
}
