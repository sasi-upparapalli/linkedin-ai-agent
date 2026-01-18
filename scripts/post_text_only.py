import os
import requests
import json
from pathlib import Path

ACCESS_TOKEN = os.getenv("LINKEDIN_ACCESS_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json"
}

CONTENT_DIR = Path("content")

def get_author_urn():
    resp = requests.get(
        "https://api.linkedin.com/v2/me",
        headers=HEADERS
    )
    resp.raise_for_status()
    user_id = resp.json()["id"]
    return f"urn:li:person:{user_id}"

def get_first_caption():
    folder = sorted(CONTENT_DIR.iterdir())[0]
    txt_file = list(folder.glob("*.txt"))[0]
    return txt_file.read_text(encoding="utf-8")

def post_text(author_urn, caption):
    payload = {
        "author": author_urn,
        "lifecycleState": "PUBLISHED",
        "specificContent": {
            "com.linkedin.ugc.ShareContent": {
                "shareCommentary": {
                    "text": caption
                },
                "shareMediaCategory": "NONE"
            }
        },
        "visibility": {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
        }
    }

    resp = requests.post(
        "https://api.linkedin.com/v2/ugcPosts",
        headers=HEADERS,
        data=json.dumps(payload)
    )

    print(resp.status_code)
    print(resp.text)

def main():
    author_urn = get_author_urn()
    caption = get_first_caption()
    post_text(author_urn, caption)

if __name__ == "__main__":
    main()
