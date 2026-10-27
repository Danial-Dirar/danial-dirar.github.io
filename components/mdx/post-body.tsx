import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { MdxImage } from "@/components/mdx/mdx-image";

// The site is dark only, so code blocks use a single dark theme.
const prettyCodeOptions = {
  theme: "github-dark-default",
  keepBackground: false,
};

/**
 * A post's MDX body, rendered on the server. Shared by the post page and the
 * blog feed so both get the same highlighting and base-path-safe images.
 */
export function PostBody({ source }: { source: string }) {
  return (
    <MDXRemote
      source={source}
      components={{ img: MdxImage }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
        },
      }}
    />
  );
}
