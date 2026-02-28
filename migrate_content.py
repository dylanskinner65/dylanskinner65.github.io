import os
import json
import re
from html import unescape

def extract_meta(html):
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""
    
    date_match = re.search(r'datetime="(.*?)"', html)
    date = date_match.group(1).strip() if date_match else ""
    
    desc_match = re.search(r'meta name="description" content="(.*?)"', html)
    desc = desc_match.group(1).strip() if desc_match else ""
    
    return title, date, desc

def extract_content(html):
    # Find the content inside kg-card-markdown
    content_match = re.search(r'<div class="kg-card-markdown">(.*?)</div>\s*</section>', html, re.DOTALL)
    if not content_match:
        content_match = re.search(r'<section class="post-content">(.*?)</section>', html, re.DOTALL)
    
    if content_match:
        content = content_match.group(1).strip()
        
        # Handle quotes without stripping LaTeX
        quote_match = re.search(r'<blockquote>(.*?)</blockquote>\s*<p>-\s*(.*?)</p>', content, re.DOTALL)
        quote_text = ""
        quote_author = ""
        if quote_match:
            quote_text = quote_match.group(1).strip().replace('"', '')
            quote_author = quote_match.group(2).strip()
            content = content.replace(quote_match.group(0), "").strip()
        
        if not quote_text:
            quote_match = re.search(r'<blockquote>(.*?)\s*<p>-\s*(.*?)</p>\s*</blockquote>', content, re.DOTALL)
            if quote_match:
                quote_text = quote_match.group(1).strip().replace('"', '')
                quote_author = quote_match.group(2).strip()
                content = content.replace(quote_match.group(0), "").strip()

        return content, quote_text, quote_author
    return "", "", ""

def get_project_metadata(slug):
    # Mapping for specialized metadata
    metadata = {
        "causal-inference": {"field": "Structural Causality", "tags": ["GNN", "Causality", "Python"]},
        "deep-knots-rl": {"field": "Topology", "tags": ["RL", "Topology", "PyTorch"]},
        "labor-dynamics": {"field": "Economics", "tags": ["Math", "Dynamics", "ODE"]},
        "nhl-predictor": {"field": "Bayesian Analytics", "tags": ["Analytics", "Bayesian", "XGBoost"]},
        "pitch-predictor": {"field": "Deep Learning", "tags": ["DL", "MLB", "CatBoost"]},
        "trash-detector": {"field": "Computer Vision", "tags": ["CV", "YOLOv8", "Streamlit"]}
    }
    return metadata.get(slug, {"field": "Research", "tags": ["ML", "Research"]})

def migrate():
    data = {"blog": [], "projects": []}
    
    # Process Blog
    blog_dir = "blog"
    for f in sorted(os.listdir(blog_dir)):
        if f.endswith(".html") and f not in ["blog.html", "list.html", "test.html"]:
            with open(os.path.join(blog_dir, f), 'r', encoding='utf-8') as file:
                html = file.read()
                title, date, desc = extract_meta(html)
                content, quote, author = extract_content(html)
                slug = f.replace(".html", "").replace("_", "-")
                data["blog"].append({
                    "slug": slug,
                    "title": title,
                    "date": date,
                    "description": desc,
                    "content": content,
                    "quote": quote,
                    "quoteAuthor": author,
                    "category": "Math & ML"
                })
                
    # Process Projects
    proj_dir = "projects"
    for f in sorted(os.listdir(proj_dir)):
        if f.endswith(".html") and f not in ["projects.html", "list.html"]:
            with open(os.path.join(proj_dir, f), 'r', encoding='utf-8') as file:
                html = file.read()
                title, date, desc = extract_meta(html)
                content, quote, author = extract_content(html)
                slug = f.replace(".html", "").replace("_", "-")
                meta = get_project_metadata(slug)
                data["projects"].append({
                    "slug": slug,
                    "title": title,
                    "date": date,
                    "description": desc,
                    "content": content,
                    "quote": quote,
                    "quoteAuthor": author,
                    "tags": meta["tags"],
                    "field": meta["field"]
                })
                
    os.makedirs("src/data", exist_ok=True)
    with open("src/data/content.json", "w", encoding='utf-8') as out:
        json.dump(data, out, indent=2)

if __name__ == "__main__":
    migrate()
