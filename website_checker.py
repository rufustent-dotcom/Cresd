import requests

websites = [
    "https://www.google.com",
    "https://www.facebook.com",
    "https://www.twitter.com",
    "https://www.bing.com",
    "https://www.youtube.com",
]


def check_websites(website_list):
    status_dict = {}

    for website in website_list:
        try:
            status = requests.get(website, timeout=5).status_code
            status_dict[website] = "UP" if 200 <= status < 300 else "DOWN"
        except requests.exceptions.RequestException:
            status_dict[website] = "ERROR"

    return status_dict


def display_statuses(status_dict):
    print("Website Status")
    print("--------------")
    print()
    for website, status in status_dict.items():
        print(f"{website} {status}")


if __name__ == "__main__":
    display_statuses(check_websites(websites))
