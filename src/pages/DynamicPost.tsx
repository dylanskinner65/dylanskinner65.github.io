import { Navigate, useParams } from "react-router-dom";
import { MarkdownPage } from "../components/MarkdownPage";
import { getPostBySlug } from "../hooks/useContent";

export function DynamicPost() {
	const { slug } = useParams();
	const post = slug ? getPostBySlug(slug) : undefined;

	if (!post) {
		return <Navigate to="/blog" replace />;
	}

	return <MarkdownPage item={post} fallbackExcerpt="Technical exploration." />;
}
