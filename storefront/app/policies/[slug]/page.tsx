import type { Metadata } from "next";
import {
  PolicyPageView,
  policyMetadata,
} from "../../../components/policy-page-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  return policyMetadata("policies", slug);
}

export default async function Page(props: Props) {
  const { slug } = await props.params;
  return <PolicyPageView section="policies" slug={slug} />;
}
