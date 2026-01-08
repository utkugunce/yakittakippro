from playwright.sync_api import sync_playwright

def verify_dashboard():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to http://localhost:3000/")
            page.goto("http://localhost:3000/")

            # Wait for dashboard to load
            print("Waiting for 'Panel & Giriş' to be visible")
            page.wait_for_selector("text=Panel & Giriş")

            # Take screenshot
            print("Taking screenshot")
            page.screenshot(path="verification/dashboard.png")
            print("Screenshot saved to verification/dashboard.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_dashboard()
