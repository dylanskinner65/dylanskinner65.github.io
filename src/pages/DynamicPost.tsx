import { Navigate, useParams } from "react-router-dom";
import { MarkdownPage } from "../components/MarkdownPage";
import { getPostBySlug, useContentBody } from "../hooks/useContent";

export function DynamicPost() {
	const { slug } = useParams();
	const post = slug ? getPostBySlug(slug) : undefined;
	const content = useContentBody("blog", slug);

	if (!post) {
		return <Navigate to="/blog" replace />;
	}

	return (
		<MarkdownPage
			item={post}
			content={content}
			fallbackExcerpt="Technical exploration."
		/>
	);
}
