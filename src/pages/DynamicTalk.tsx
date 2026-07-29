import { Navigate, useParams } from "react-router-dom";
import { MarkdownPage } from "../components/MarkdownPage";
import { getTalkBySlug, useContentBody } from "../hooks/useContent";

export function DynamicTalk() {
	const { slug } = useParams();
	const talk = slug ? getTalkBySlug(slug) : undefined;
	const { content, error, retry } = useContentBody("talk", slug);

	if (!talk) {
		return <Navigate to="/talks" replace />;
	}

	return (
		<MarkdownPage
			item={talk}
			content={content}
			contentError={error}
			onRetryContent={retry}
			fallbackExcerpt="A talk."
		/>
	);
}
