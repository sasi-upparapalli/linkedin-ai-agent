import os
import json
import time
from playwright.sync_api import sync_playwright

LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT_DIR = os.path.join(BASE_DIR, "content")
TRACKER_FILE = os.path.join(BASE_DIR, "agent", "content_tracker.json")


def load_tracker():
    with open(TRACKER_FILE, "r") as f:
        return json.load(f)


def save_tracker(data):
    with open(TRACKER_FILE, "w") as f:
        json.dump(data, f, indent=2)


def get_next_content():
    tracker = load_tracker()
    idx = tracker["current_index"]
    folder = f"CODE{idx:02d}"
    path = os.path.join(CONTENT_DIR, folder)

    if not os.path.exists(path):
        print("✅ All posts completed.")
        return None, None, None

    images = sorted([
        os.path.join(path, f)
        for f in os.listdir(path)
        if f.endswith(".jpeg")
    ])

    caption_file = os.path.join(path, f"{folder}.txt")
    with open(caption_file, "r", encoding="utf-8") as f:
        caption = f.read()

    tracker["current_index"] += 1
    save_tracker(tracker)

    return images, caption, folder


def linkedin_login(page):
    page.goto("https://www.linkedin.com/login")
    page.fill("input#username", LINKEDIN_EMAIL)
    page.fill("input#password", LINKEDIN_PASSWORD)
    page.click("button[type=submit]")
    page.wait_for_load_state("networkidle")
    time.sleep(5)


def create_post(page, images, caption):
    page.goto("https://www.linkedin.com/feed/")
    page.wait_for_load_state("networkidle")
    time.sleep(5)

    # Click "Start a post" (robust selector)
    page.locator("button[aria-label*='Start']").first.click()
    time.sleep(4)

    # Click "Add media"
    page.locator("button[aria-label*='media']").click()
    time.sleep(3)

    # Upload images
    page.locator("input[type='file']").set_input_files(images)
    time.sleep(6)

    # Click Next
    page.locator("button[aria-label*='Next']").click()
    time.sleep(3)

    # Enter caption
    page.locator("div[role='textbox']").fill(caption)
    time.sleep(2)

    # Click Post
    page.locator("button[aria-label*='Post']").click()
    time.sleep(6)

def main():
    images, caption, folder = get_next_content()
    if not images:
        return

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print(f"🚀 Posting {folder}")
        linkedin_login(page)
        create_post(page, images, caption)

        browser.close()
        print("✅ Post successful")


if __name__ == "__main__":
    main()

